// Supabase Edge Function: trigger-publish
//
// Called by the admin dashboard (js/admin.js) right after a photo or a
// text field is saved. It:
//   1. Inserts a "pending" row into publish_log (using the caller's own
//      JWT, so it's the dashboard user -- i.e. Melissa -- doing the
//      insert, satisfying the "authenticated can insert" RLS policy).
//   2. Asks GitHub Actions to run the "Publish dashboard content"
//      workflow, passing that row's id as a workflow input.
//   3. Returns the row's id so the dashboard can poll publish_log and
//      show whether the publish actually succeeded, instead of firing
//      the request and hoping.
//
// The workflow itself (running with a service-role key kept only as a
// GitHub Actions secret) is the only thing that later marks that row
// success/failed -- see .github/workflows/publish-content.yml. That's
// deliberate: the public anon key can insert a pending row but can't
// mark anything successful, so nobody can forge a fake "published" status
// with just the anon key.
//
// Why an Edge Function instead of calling the GitHub API straight from
// admin.js: the GitHub token needs "repo" write access to dispatch a
// workflow, and that token must never be visible in the browser (unlike
// the Supabase anon key, which is meant to be public). The Edge Function
// holds that token as a server-side secret instead.
//
// Deploy (from the repo, with the Supabase CLI, one-time):
//   supabase functions deploy trigger-publish --project-ref amrzoqmnkfnewujbeqdn
//   supabase secrets set GITHUB_TOKEN=<a GitHub PAT with repo scope> --project-ref amrzoqmnkfnewujbeqdn
//   supabase secrets set GITHUB_REPO=Mrxa69K/website1.2 --project-ref amrzoqmnkfnewujbeqdn
// (SUPABASE_URL and SUPABASE_ANON_KEY are auto-injected by the Supabase
// runtime -- no need to set those secrets by hand.)
//
// Security: this function requires a valid logged-in Supabase session
// (Edge Functions verify the JWT automatically unless deployed with
// --no-verify-jwt, which this one should NOT be) -- so only someone
// logged into the admin dashboard can trigger a publish.

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck  -- Deno global + remote imports aren't understood by a
// Node/TS toolchain; this file only runs on Supabase's Deno runtime.

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const githubRepo = Deno.env.get('GITHUB_REPO'); // e.g. "Mrxa69K/website1.2"
    const workflowFile = Deno.env.get('GITHUB_WORKFLOW_FILE') || 'publish-content.yml';
    const ref = Deno.env.get('GITHUB_REF') || 'main';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!githubToken || !githubRepo) {
      return new Response(
        JSON.stringify({ error: 'Server is missing GITHUB_TOKEN or GITHUB_REPO secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ error: 'Server is missing SUPABASE_URL or SUPABASE_ANON_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let reason = 'dashboard save';
    try {
      const body = await req.json();
      if (body && typeof body.reason === 'string' && body.reason.trim()) {
        reason = body.reason.trim().slice(0, 200);
      }
    } catch {
      // no/invalid JSON body -- fine, use the default reason
    }

    const callerAuth = req.headers.get('Authorization') || `Bearer ${anonKey}`;

    // 1. Insert the pending publish_log row as the caller (so RLS's
    // "authenticated can insert" policy is satisfied).
    const insertResp = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/publish_log`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: callerAuth,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'pending', triggered_by: 'dashboard', reason }),
    });

    if (!insertResp.ok) {
      const text = await insertResp.text();
      return new Response(
        JSON.stringify({ error: `Could not create publish_log row (${insertResp.status})`, details: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inserted = await insertResp.json();
    const logId = Array.isArray(inserted) && inserted[0] ? inserted[0].id : null;
    if (!logId) {
      return new Response(JSON.stringify({ error: 'publish_log insert returned no id.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Dispatch the workflow, passing log_id through so the workflow's
    // final step knows which row to mark success/failed.
    const dispatchUrl = `https://api.github.com/repos/${githubRepo}/actions/workflows/${workflowFile}/dispatches`;
    const ghResponse = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'melissa-photography-admin',
      },
      body: JSON.stringify({ ref, inputs: { log_id: logId } }),
    });

    if (!ghResponse.ok) {
      const text = await ghResponse.text();
      // Row stays "pending" here -- regular dashboard users have no RLS
      // permission to mark it failed themselves (only the workflow's
      // service-role key can), by design (see migration 002). The
      // dashboard's publish-status UI treats a "pending" row that's been
      // sitting for more than a couple of minutes as failed, which covers
      // this case too.
      return new Response(
        JSON.stringify({ error: `GitHub dispatch failed (${ghResponse.status})`, details: text, log_id: logId }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true, log_id: logId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

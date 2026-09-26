// Supabase Edge Function: trigger-publish
//
// Called by the admin dashboard (js/admin.js) right after a photo or a
// text field is saved. It asks GitHub Actions to run the
// "Publish dashboard content" workflow, which regenerates the static
// HTML from Supabase and pushes it -- Netlify then redeploys
// automatically, same as any other push.
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

    if (!githubToken || !githubRepo) {
      return new Response(
        JSON.stringify({ error: 'Server is missing GITHUB_TOKEN or GITHUB_REPO secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dispatchUrl = `https://api.github.com/repos/${githubRepo}/actions/workflows/${workflowFile}/dispatches`;
    const ghResponse = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'melissa-photography-admin',
      },
      body: JSON.stringify({ ref }),
    });

    if (!ghResponse.ok) {
      const text = await ghResponse.text();
      return new Response(
        JSON.stringify({ error: `GitHub dispatch failed (${ghResponse.status})`, details: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
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

// Orders tab: the envelopes clients send from the homepage.
// Reads the "orders" table (see supabase/migrations/004_orders.sql).
// Only the site owner's account can read it; visitors can only add rows.
(function () {
    const list = document.getElementById('ordersList');
    const filter = document.getElementById('ordersFilter');
    const badge = document.getElementById('ordersBadge');
    if (!list) return;

    const STATUSES = ['new', 'replied', 'booked', 'archived'];
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function client() {
        return typeof supabaseClient !== 'undefined' && supabaseClient
            ? supabaseClient
            : window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    function replyLink(contact) {
        const c = contact.trim();
        if (/@/.test(c)) return `<a href="mailto:${encodeURIComponent(c)}">${esc(c)}</a>`;
        const digits = c.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^00/, '').replace(/^0(\d{9})$/, '33$1');
        if (digits.length >= 8) return `<a href="https://wa.me/${digits}" target="_blank" rel="noopener">${esc(c)} (WhatsApp)</a>`;
        return esc(c);
    }

    async function load() {
        list.innerHTML = '<p class="text-muted">Loading orders&hellip;</p>';
        let q = client().from('orders').select('*').order('created_at', { ascending: false }).limit(200);
        const f = filter.value;
        if (f === 'open') q = q.in('status', ['new', 'replied']);
        else if (f !== 'all') q = q.eq('status', f);
        const { data, error } = await q;
        if (error) {
            const missing = /relation .*orders|does not exist|schema cache/i.test(error.message);
            list.innerHTML = missing
                ? '<div class="orders-note">The orders table is not set up yet. Run <code>supabase/migrations/004_orders.sql</code> once in Supabase &rarr; SQL Editor. Until then, orders still reach you by email (Formspree).</div>'
                : `<div class="orders-note">Could not load orders: ${esc(error.message)}</div>`;
            return;
        }
        updateBadge();
        if (!data.length) { list.innerHTML = '<p class="text-muted">No orders here yet.</p>'; return; }
        list.innerHTML = data.map((o) => `
            <article class="order-card status-${esc(o.status)}" data-id="${esc(o.id)}">
                <header>
                    <strong>${esc(o.name)}</strong>
                    <span class="order-session">${esc(o.session)}</span>
                    <time>${new Date(o.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</time>
                </header>
                <p class="order-meta">
                    ${replyLink(o.contact)}
                    &middot; ${o.preferred_date ? 'Date: ' + esc(new Date(o.preferred_date + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })) : 'Date to pick together'}
                    &middot; Speaks: ${esc(o.language || '?')}
                    ${o.site_lang ? '&middot; site in ' + esc(o.site_lang.toUpperCase()) : ''}
                </p>
                ${o.message ? `<p class="order-msg">${esc(o.message)}</p>` : ''}
                <label>Status
                    <select class="form-control order-status">
                        ${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </label>
            </article>`).join('');
    }

    async function updateBadge() {
        const { count, error } = await client().from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new');
        if (error) return;
        badge.hidden = !count;
        badge.textContent = count || '';
    }

    list.addEventListener('change', async (e) => {
        const sel = e.target.closest('.order-status');
        if (!sel) return;
        const card = sel.closest('.order-card');
        sel.disabled = true;
        const { error } = await client().from('orders').update({ status: sel.value }).eq('id', card.dataset.id);
        sel.disabled = false;
        if (error) { alert('Could not save: ' + error.message); return; }
        card.className = `order-card status-${sel.value}`;
        updateBadge();
    });
    filter.addEventListener('change', load);
    document.getElementById('ordersRefresh').addEventListener('click', load);
    document.querySelector('[data-tab="ordersTab"]').addEventListener('click', load);
    // show the "new" count as soon as the owner is logged in
    setTimeout(() => { if (document.getElementById('adminSection') && !document.getElementById('adminSection').classList.contains('hidden')) updateBadge(); }, 2500);
})();

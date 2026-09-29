/**
 * MARKETLINK CUSTOMERS — ORDERS
 * List, filter, track (vine timeline + pickup ticket), cancel, reorder,
 * review and download a receipt.
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;
    let tab = ['active', 'collected', 'cancelled', 'all'].includes(ML.query.get('tab')) ? ML.query.get('tab') : 'active', q = '';
    let detail = null; // { id, modal }

    const badge = (o) => {
        const map = { reserved: ['info', 'bx-bookmark-alt-plus'], harvesting: ['warn', 'bx-sun'], packed: ['warn', 'bx-package'], ready: ['', 'bx-store-alt'], collected: ['muted', 'bx-check-double'], cancelled: ['danger', 'bx-x-circle'] }[o.status];
        const label = o.status === 'cancelled' ? 'Cancelled' : ML.STAGES.find((s) => s.id === o.status).label;
        return `<span class="badge ${map[0]}"><i class='bx ${map[1]}'></i> ${label}</span>`;
    };
    const cleanName = (n) => n.replace(/\s*\(.*\)/, '');

    /* ---------- stats + tabs ---------- */
    function counts(all) {
        return { active: all.filter(ML.orders.isActive).length, collected: all.filter((o) => o.status === 'collected').length, cancelled: all.filter((o) => o.status === 'cancelled').length, all: all.length };
    }
    function renderStats(all) {
        const c = counts(all);
        const spent = all.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0);
        const ready = all.filter((o) => o.status === 'ready').length;
        $('#ordStats').innerHTML = `
            <div class="stat${ready ? ' hot' : ''}"><i class='bx bx-store-alt'></i><small>Ready to collect</small><b data-cu="${ready}">0</b></div>
            <div class="stat"><i class='bx bx-time-five'></i><small>In progress</small><b data-cu="${c.active}">0</b></div>
            <div class="stat"><i class='bx bx-check-double'></i><small>Collected</small><b data-cu="${c.collected}">0</b></div>
            <div class="stat"><i class='bx bx-wallet'></i><small>Spent with farms</small><b data-cu="${spent}" data-money="1">₦0</b></div>`;
        $$('[data-cu]').forEach((el) => ML.countUp(el, Number(el.dataset.cu), el.dataset.money ? { format: (v) => money(v) } : {}));
        $$('[data-n]').forEach((n) => { n.textContent = c[n.dataset.n]; });
    }

    /* ---------- list ---------- */
    function render() {
        const all = ML.orders.all();
        renderStats(all);
        let list = all.filter((o) => tab === 'all' || (tab === 'active' ? ML.orders.isActive(o) : o.status === tab));
        if (q) list = list.filter((o) => (o.id + ' ' + o.items.map((l) => l.name).join(' ')).toLowerCase().includes(q));
        $$('#ordTabs .tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
        const box = $('#ordList');
        if (!list.length) {
            const msg = q ? `Nothing matches “${esc(q)}”.` : tab === 'active' ? 'No baskets in progress. Reserve something fresh.' : tab === 'all' ? 'You have not placed an order yet.' : 'Nothing here yet.';
            box.innerHTML = `<div class="empty"><div class="art"><i class='bx bx-receipt'></i></div><h3>No orders to show</h3><p>${msg}</p><a class="btn btn-primary" href="marketplace.html">Browse the market</a></div>`;
            return;
        }
        box.innerHTML = list.map((o, i) => {
            const hub = ML.hub(o.hub);
            const idx = ML.orders.stageIndex(o);
            const cancelled = o.status === 'cancelled';
            return `<article class="ord reveal in${cancelled ? ' cancelled' : ''}" style="--i:${i};animation:line-in .5s ${i * 70}ms var(--ease) both" data-id="${esc(o.id)}">
                <div class="ord-main">
                    <div class="ord-top"><h3>${esc(o.id)}</h3><small>Placed ${ML.ago(o.placedAt)}</small>${badge(o)}</div>
                    <div class="ord-items">
                        <div class="ord-imgs">${o.items.slice(0, 4).map((l) => `<img src="${esc(l.img)}" alt="${esc(l.name)}" data-fb="${esc(l.name)}">`).join('')}${o.items.length > 4 ? `<span class="more">+${o.items.length - 4}</span>` : ''}</div>
                        <p>${o.items.map((l) => l.qty + '× ' + esc(cleanName(l.name))).join(', ')}</p>
                    </div>
                    <div class="ord-meta"><span><i class='bx bx-store-alt'></i> ${esc(hub.name)}</span><span><i class='bx bx-calendar'></i> ${esc(o.slot.label)} · ${esc(o.slot.window)}</span></div>
                    ${cancelled ? '' : `<div class="mini-vine">${ML.STAGES.slice(0, 4).map((s, k) => `<span class="mv${k < idx ? ' done' : k === idx ? ' now' : ''}"></span>`).join('')}</div>
                    <div class="vine-label">${ML.STAGES.map((s, k) => `<span class="${k <= idx ? 'on' : ''}">${s.label}</span>`).join('')}</div>`}
                </div>
                <div class="ord-side">
                    <div><small>Total</small><div class="ord-total">${money(o.total)}</div></div>
                    ${cancelled || o.status === 'collected' ? '' : `<div class="ord-code"><small>Pickup code</small><b>${esc(o.code)}</b></div>`}
                    <div class="ord-btns">
                        <button class="btn btn-primary btn-sm" data-track="${esc(o.id)}"><i class='bx bx-map-pin'></i> ${ML.orders.isActive(o) ? 'Track order' : 'View details'}</button>
                        ${o.status === 'collected' && !o.reviewed ? `<button class="btn btn-lime btn-sm" data-rate="${esc(o.id)}"><i class='bx bx-star'></i> Rate</button>` : ''}
                        ${!ML.orders.isActive(o) ? `<button class="btn btn-soft btn-sm" data-reorder="${esc(o.id)}"><i class='bx bx-revision'></i> Reorder</button>` : ''}
                        ${ML.orders.canCancel(o) ? `<button class="btn btn-danger btn-sm" data-cancel="${esc(o.id)}">Cancel</button>` : ''}
                    </div>
                </div></article>`;
        }).join('');
        document.dispatchEvent(new Event('ml:rendered'));
    }

    /* ---------- detail modal ---------- */
    function detailHTML(o) {
        const hub = ML.hub(o.hub);
        const idx = ML.orders.stageIndex(o);
        const cancelled = o.status === 'cancelled';
        const hist = {};
        (o.history || []).forEach((h) => { hist[h.stage] = h.at; });
        const stages = cancelled
            ? `<div class="tl done"><i class='bx bx-bookmark-alt-plus'></i><div><b>Reserved</b><small>${hist.reserved ? ML.fmtDate(hist.reserved) : ''}</small></div></div>
               <div class="tl now" style="--x:1"><i class='bx bx-x' style="background:var(--color-danger);border-color:var(--color-danger);color:#fff;animation:none"></i><div><b>Cancelled</b><small>${hist.cancelled ? ML.fmtDate(hist.cancelled) + '. ' : ''}Nothing was charged. The farmer did not cut your crops.</small></div></div>`
            : ML.STAGES.map((s, k) => `<div class="tl ${k < idx ? 'done' : k === idx ? 'now' : ''}"><i class='bx ${k < idx ? 'bx-check' : s.icon}'></i><div><b>${s.label}</b><small>${k <= idx ? (hist[s.id] ? esc(ML.fmtDate(hist[s.id])) + ' · ' : '') + esc(s.hint) : esc(s.hint)}</small></div></div>`).join('');
        return `<div class="od">
            <div>
                <div class="timeline">${cancelled ? '' : '<span class="fillbar" id="fillbar"></span>'}${stages}</div>
                ${ML.orders.isActive(o) && !ML.remote ? `<div class="demo-adv"><i class='bx bxs-flask'></i> Demo tool: move this order to the next stage. <button data-advance="${esc(o.id)}">Advance</button></div>` : ''}
            </div>
            <div>
                <div class="od-ticket${cancelled ? ' void' : ''}"><small>${o.status === 'collected' ? 'Collected with code' : 'Pickup code'}</small><span class="code">${esc(o.code)}</span><i class="bars"></i>
                    <div class="where"><i class='bx bx-store-alt'></i> ${esc(hub.name)}</div>
                    <div class="where muted" style="margin-top:4px"><i class='bx bx-calendar'></i> ${esc(o.slot.label)} · ${esc(o.slot.window)}</div>
                    <div class="od-btnrow"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}"><i class='bx bx-navigation'></i> Directions</a><a class="btn btn-ghost btn-sm" href="map.html?hub=${hub.id}"><i class='bx bx-map-alt'></i> On map</a></div></div>
                <div class="od-items">
                    ${o.items.map((l) => `<div class="od-line"><img src="${esc(l.img)}" alt="" data-fb="${esc(l.name)}"><span><a href="product.html?id=${esc(l.id)}"><b style="font-family:var(--font-body);margin:0">${esc(cleanName(l.name))}</b></a><br><small class="muted">${l.qty} × ${esc(l.unit)} · ${esc(l.farm)}</small></span><b>${money(l.price * l.qty)}</b></div>`).join('')}
                    <div class="od-sum" style="margin-top:8px"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
                    ${o.discount ? `<div class="od-sum"><span>Promo ${esc(o.promo || '')}</span><span>− ${money(o.discount)}</span></div>` : ''}
                    <div class="od-sum total"><span>Total</span><b>${money(o.total)}</b></div>
                </div>
                <div class="od-info"><div class="fact"><small>Collector</small><b>${esc(o.contact.name)}</b></div><div class="fact"><small>Payment</small><b>${{ pickup: 'At pickup', transfer: 'Bank transfer', card: 'Card' }[o.pay] || 'At pickup'}</b></div></div>
            </div></div>`;
    }
    function footActions(o) {
        const id = o.id;
        const actions = [];
        actions.push({ label: 'Receipt', cls: 'btn-ghost', icon: 'bx-download', keepOpen: true, onClick: () => { receipt(ML.orders.get(id)); return false; } });
        actions.push({ label: 'Need help?', cls: 'btn-ghost', icon: 'bx-support', onClick: () => { location.href = 'chatbot.html?ask=' + encodeURIComponent('Help with order ' + id); return false; } });
        if (ML.orders.canCancel(o)) actions.push({ label: 'Cancel order', cls: 'btn-danger', keepOpen: true, onClick: () => { cancel(id); return false; } });
        if (!ML.orders.isActive(o)) actions.push({ label: 'Reorder', cls: 'btn-primary', icon: 'bx-revision', keepOpen: true, onClick: () => { reorder(id); return false; } });
        return actions;
    }
    function openDetail(id) {
        const o = ML.orders.get(id);
        if (!o) return ML.toast('Order not found', { type: 'error' });
        const actions = footActions(o);
        const m = ML.modal({ title: 'Order ' + o.id, size: 'lg', html: detailHTML(o), actions, onClose: () => { detail = null; history.replaceState(null, '', location.pathname); } });
        detail = { id, modal: m };
        history.replaceState(null, '', '?id=' + encodeURIComponent(id));
        requestAnimationFrame(fillVine);
        m.body.addEventListener('click', (e) => {
            const adv = e.target.closest('[data-advance]');
            if (adv) advance(adv.dataset.advance);
        });
    }
    function fillVine() {
        if (!detail) return;
        const bar = $('#fillbar', detail.modal.el);
        const tls = $$('.tl', detail.modal.el);
        const now = tls.findIndex((t) => t.classList.contains('now'));
        if (bar && now > 0) bar.style.height = tls[now].offsetTop - tls[0].offsetTop + 'px';
    }
    function refreshDetail() {
        if (!detail) return;
        const o = ML.orders.get(detail.id);
        detail.modal.body.innerHTML = detailHTML(o);
        const foot = $('.modal-foot', detail.modal.el);
        if (foot) {
            foot.innerHTML = '';
            footActions(o).forEach((a) => {
                const btn = document.createElement('button');
                btn.type = 'button'; btn.className = 'btn ' + a.cls;
                btn.innerHTML = (a.icon ? `<i class='bx ${a.icon}'></i>` : '') + `<span>${esc(a.label)}</span>`;
                btn.addEventListener('click', () => a.onClick());
                foot.appendChild(btn);
            });
        }
        requestAnimationFrame(fillVine);
    }

    /* ---------- actions ---------- */
    async function cancel(id) {
        const o = ML.orders.get(id);
        if (!o || !ML.orders.canCancel(o)) return ML.toast('This order can no longer be cancelled', { type: 'warn' });
        if (!(await ML.confirm({ title: 'Cancel order ' + id + '?', message: `The farmers have not started cutting yet, so this is free. Your ${o.items.length} item${o.items.length > 1 ? 's' : ''} will be released.`, ok: 'Cancel order', cancel: 'Keep it', danger: true }))) return;
        try { await ML.api.orders.cancel(id); } catch (err) { return ML.toast(err.message, { type: 'error' }); }
        if (!ML.remote) ML.notifs.add({ type: 'orders', icon: 'bx-x-circle', title: 'Order ' + id + ' cancelled', text: 'No charge was made. You can reserve again any time before the next harvest lock.', link: 'orders.html?id=' + id });
        ML.toast('Order ' + id + ' cancelled', { icon: 'bx-x-circle' });
        refreshDetail();
    }
    function reorder(id) {
        const o = ML.orders.get(id);
        let added = 0, skipped = 0;
        o.items.forEach((l) => { if (ML.product(l.id) && ML.cart.add(l.id, l.qty).ok) added++; else skipped++; });
        if (detail) detail.modal.close();
        ML.toast(added ? `${added} item${added > 1 ? 's' : ''} back in your basket${skipped ? ` (${skipped} unavailable)` : ''}` : 'Those items are unavailable right now', { icon: 'bx-basket', type: added ? '' : 'warn', action: added ? { label: 'Checkout', fn: () => { location.href = 'checkout.html'; } } : null });
    }
    function advance(id) {
        const before = ML.orders.get(id);
        const o = ML.orders.advance(id);
        if (!o || o.status === before.status) return;
        const st = ML.STAGES.find((s) => s.id === o.status);
        ML.notifs.add({ type: o.status === 'ready' ? 'pickup' : 'orders', icon: st.icon, title: `Order ${id}: ${st.label}`, text: st.hint + (o.status === 'ready' ? ` Code ${o.code}.` : ''), link: 'orders.html?id=' + id });
        ML.toast(`Order ${id} is now ${st.label.toLowerCase()}`, { icon: st.icon });
        refreshDetail();
    }
    function rate(id) {
        const o = ML.orders.get(id);
        let stars = 5;
        const m = ML.modal({
            title: 'How was ' + id + '?', size: 'sm',
            html: `<p class="muted" style="margin-bottom:14px">Your rating goes straight to the farmers and helps other shoppers.</p>
                <div class="star-input" id="starIn">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="on" data-s="${n}" aria-label="${n} stars"><i class='bx bxs-star'></i></button>`).join('')}</div>
                <label class="field"><span>Comments <small class="muted">(optional)</small></span><textarea class="textarea" id="rvText" placeholder="Freshness, packing, pickup…"></textarea></label>`,
            actions: [{ label: 'Later', cls: 'btn-ghost' }, { label: 'Submit rating', cls: 'btn-primary', icon: 'bx-send', onClick: () => {
                const text = $('#rvText', m.el).value.trim() || 'Great produce, would buy again.';
                ML.api.orders.review(id, { stars, text })
                    .then(() => ML.toast('Thanks for the feedback!', { icon: 'bx-star' }))
                    .catch((err) => ML.toast(err.message, { type: 'error' }));
            } }]
        });
        $('#starIn', m.el).addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; stars = Number(b.dataset.s); $$('#starIn button', m.el).forEach((x) => x.classList.toggle('on', Number(x.dataset.s) <= stars)); });
    }
    function receipt(o) {
        const h = ML.hub(o.hub), u = ML.auth.user() || {};
        const pad = (s, n) => String(s).padEnd(n, ' ');
        const lines = [
            'MARKETLINK · eGreen Basket', 'Order receipt', '='.repeat(44),
            `Order:    ${o.id}`, `Placed:   ${new Date(o.placedAt).toLocaleString('en-NG')}`, `Customer: ${o.contact.name} (${u.email || ''})`,
            `Pickup:   ${h.name}, ${o.slot.label} ${o.slot.window}`, `Code:     ${o.code}`, `Status:   ${o.status}`, '-'.repeat(44),
            ...o.items.map((l) => `${pad(l.qty + ' x ' + cleanName(l.name), 30)}${money(l.price * l.qty).padStart(14)}`),
            '-'.repeat(44), `${pad('Subtotal', 30)}${money(o.subtotal).padStart(14)}`,
            ...(o.discount ? [`${pad('Promo ' + (o.promo || ''), 30)}${('-' + money(o.discount)).padStart(14)}`] : []),
            `${pad('TOTAL', 30)}${money(o.total).padStart(14)}`, '='.repeat(44), 'Thank you for buying direct from the farm.'
        ];
        ML.download(`marketlink-${o.id}.txt`, lines.join('\n'));
        ML.toast('Receipt downloaded', { icon: 'bx-download' });
    }

    /* ---------- events ---------- */
    $('#ordTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#ordSearch').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); render(); });
    document.addEventListener('click', (e) => {
        let el;
        if ((el = e.target.closest('[data-track]'))) return openDetail(el.dataset.track);
        if ((el = e.target.closest('[data-cancel]'))) return cancel(el.dataset.cancel);
        if ((el = e.target.closest('[data-reorder]'))) return reorder(el.dataset.reorder);
        if ((el = e.target.closest('[data-rate]'))) return rate(el.dataset.rate);
    });
    document.addEventListener('ml:change', (e) => { const k = e.detail && e.detail.key; if (k === 'orders' || k === '*') render(); });

    const want = ML.query.get('id');
    if (want && ML.orders.get(want)) {
        const o = ML.orders.get(want);
        if (!ML.orders.isActive(o)) tab = o.status === 'cancelled' ? 'cancelled' : 'collected';
        render();
        setTimeout(() => openDetail(want), 250);
    } else render();
});

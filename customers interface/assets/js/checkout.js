/**
 * MARKETLINK CUSTOMERS — CHECKOUT
 * Four steps: pickup, details, payment, confirm. Creates a real order in
 * the local store, notifies the customer and clears the basket.
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;
    let step = 1, placed = false;
    const attempt = 'co-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); // idempotency key: a retry never double-orders
    const user = ML.auth.user() || {};
    const data = {
        hub: ML.prefs.get().hub,
        slot: null,
        name: user.name || '',
        phone: user.phone || '',
        note: '',
        sub: ML.prefs.get().substitute || 'ask',
        pay: 'pickup'
    };

    function guardEmpty() {
        if (placed) return true;
        if (ML.cart.count() > 0) { $('#coEmpty').hidden = true; $('#coLayout').hidden = false; return false; }
        $('#coLayout').hidden = true;
        $('#coEmpty').hidden = false;
        $('#coEmpty').innerHTML = `<div class="empty"><div class="art"><i class='bx bx-basket'></i></div><h3>Nothing to check out</h3><p>Your basket is empty. Add something fresh and come back.</p><a class="btn btn-primary" href="marketplace.html">Browse the market</a></div>`;
        return true;
    }
    if (guardEmpty()) { document.addEventListener('ml:change', () => guardEmpty()); return; }

    /* ---------- step 1: hub + slot ---------- */
    function renderHubs() {
        $('#hubRadios').innerHTML = ML.HUBS.map((h) => {
            const s = ML.nextSlots(h.id, 1)[0];
            return `<label><input type="radio" name="hub" value="${h.id}"${h.id === data.hub ? ' checked' : ''}><span class="hub-card"><span class="pin"><i class='bx bx-store-alt'></i></span><span><b>${esc(h.name)}</b><small>${esc(h.area)}</small></span><span class="day">${s ? esc(s.label) : '—'}<br><small>${esc(ML.windowLabel(h))}</small></span></span></label>`;
        }).join('');
        renderSlots();
    }
    function renderSlots() {
        const slots = ML.nextSlots(data.hub, 3);
        if (!slots.find((s) => s.iso === (data.slot && data.slot.iso))) data.slot = slots[0] || null;
        $('#slotRadios').innerHTML = slots.length ? slots.map((s) => `<label><input type="radio" name="slot" value="${s.iso}"${data.slot && s.iso === data.slot.iso ? ' checked' : ''}><span class="slot"><b>${esc(s.label)}</b><small>${esc(s.window)}</small></span></label>`).join('') : '<p class="muted">No upcoming pickup at this hub. Try another hub.</p>';
        lockNote();
    }
    function lockNote() {
        $('#lockNote').innerHTML = data.slot ? `<i class='bx bx-lock-open-alt'></i> You can cancel free until ${esc(ML.fmtDate(data.slot.lock))} at 6 PM, when the farmer starts cutting.` : '';
        $('#lockNote').hidden = !data.slot;
    }
    $('#hubRadios').addEventListener('change', (e) => { data.hub = e.target.value; ML.prefs.set({ hub: data.hub }); renderSlots(); });
    $('#slotRadios').addEventListener('change', (e) => { data.slot = ML.nextSlots(data.hub, 3).find((s) => s.iso === e.target.value); lockNote(); });

    /* ---------- step 2 ---------- */
    $('#cName').value = data.name; $('#cPhone').value = data.phone;
    $$('#subRadios input').forEach((i) => { i.checked = i.value === data.sub; });

    /* ---------- step 3 ---------- */
    function payPanels() { $('#payTransfer').hidden = data.pay !== 'transfer'; $('#payCard').hidden = data.pay !== 'card'; }
    $('#payRadios').addEventListener('change', (e) => { data.pay = e.target.value; payPanels(); });
    $('#cCard').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); });
    $('#cExp').addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
    $('#cCvc').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

    /* ---------- validation ---------- */
    const setErr = (f, bad) => { const el = $(`[data-f="${f}"]`); if (el) el.classList.toggle('error', bad); return bad; };
    $$('.field .input, .field .textarea').forEach((i) => i.addEventListener('input', () => { const f = i.closest('.field'); if (f) f.classList.remove('error'); }));
    function validate(s) {
        if (s === 1) { if (!data.slot) { ML.toast('Choose a hub with an upcoming pickup', { type: 'warn' }); return false; } return true; }
        if (s === 2) {
            const badName = setErr('name', $('#cName').value.trim().length < 2);
            const badPhone = setErr('phone', $('#cPhone').value.replace(/\D/g, '').length < 10);
            if (badName) $('#cName').focus(); else if (badPhone) $('#cPhone').focus();
            return !badName && !badPhone;
        }
        if (s === 3 && data.pay === 'card') {
            const badCard = setErr('card', $('#cCard').value.replace(/\D/g, '').length !== 16);
            const m = /^(\d{2})\/(\d{2})$/.exec($('#cExp').value);
            const now = new Date();
            const expBad = !m || +m[1] < 1 || +m[1] > 12 || (2000 + +m[2]) * 12 + +m[1] < now.getFullYear() * 12 + now.getMonth() + 1;
            const badExp = setErr('exp', expBad);
            const badCvc = setErr('cvc', !/^\d{3,4}$/.test($('#cCvc').value));
            return !(badCard || badExp || badCvc);
        }
        return true;
    }

    /* ---------- review ---------- */
    function renderReview() {
        const h = ML.hub(data.hub);
        const payLabel = { pickup: 'Pay at pickup', transfer: 'Bank transfer', card: 'Debit card' + ($('#cCard').value ? ' ending ' + $('#cCard').value.slice(-4) : '') }[data.pay];
        const subLabel = { ask: 'Ask me first', swap: 'Swap for similar', skip: 'Skip the item' }[data.sub];
        $('#reviewBox').innerHTML = `
            <div class="review-block"><i class='bx bx-store-alt'></i><div><small>Pickup</small><b>${esc(h.name)}</b><br><span class="muted">${esc(data.slot.label)} · ${esc(data.slot.window)}</span></div><button data-edit="1">Edit</button></div>
            <div class="review-block"><i class='bx bx-user'></i><div><small>Collector</small><b>${esc(data.name)}</b><br><span class="muted">${esc(data.phone)} · If sold out: ${esc(subLabel.toLowerCase())}</span>${data.note ? `<br><span class="muted">“${esc(data.note)}”</span>` : ''}</div><button data-edit="2">Edit</button></div>
            <div class="review-block"><i class='bx bx-wallet'></i><div><small>Payment</small><b>${esc(payLabel)}</b><br><span class="muted">${money(ML.cart.total())} total</span></div><button data-edit="3">Edit</button></div>
            <div class="review-block" style="border-bottom:0"><i class='bx bx-basket'></i><div><small>Basket</small><b>${ML.cart.count()} items</b><br><span class="muted">${ML.cart.items().map((l) => esc(l.product.name.replace(/\s*\(.*\)/, ''))).join(', ')}</span></div></div>`;
    }
    $('#reviewBox').addEventListener('click', (e) => { const b = e.target.closest('[data-edit]'); if (b) go(Number(b.dataset.edit)); });

    /* ---------- summary ---------- */
    function renderSummary() {
        const box = $('#coSummary');
        box.innerHTML = ML.receiptHTML({ title: 'Order summary', promo: true, note: data.slot ? `Collect ${esc(data.slot.label)}, ${esc(data.slot.window)}` : '' });
        ML.bindPromo(box, renderSummary);
    }

    /* ---------- stepping ---------- */
    function go(n, back) {
        step = n;
        $$('.co-step').forEach((s) => {
            const on = Number(s.dataset.step) === n;
            s.hidden = !on;
            if (on) { s.classList.toggle('back', !!back); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; }
        });
        $$('#stepper li').forEach((li) => { const k = Number(li.dataset.s); li.classList.toggle('on', k === n); li.classList.toggle('done', k < n); });
        $('#stepper').style.setProperty('--prog', (n - 1) / 3);
        $('#coBack').hidden = n === 1;
        const next = $('#coNext');
        next.innerHTML = n === 4 ? `<i class='bx bx-lock-alt'></i> Place order · ${money(ML.cart.total())}` : `Continue <i class='bx bx-right-arrow-alt go'></i>`;
        if (n === 4) renderReview();
        if (n === 3) payPanels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $('#stepper').addEventListener('click', (e) => { const li = e.target.closest('li.done'); if (li) go(Number(li.dataset.s), true); });
    $('#coBack').addEventListener('click', () => go(step - 1, true));
    $('#coNext').addEventListener('click', () => {
        if (step === 2) { data.name = $('#cName').value.trim(); data.phone = $('#cPhone').value.trim(); data.note = $('#cNote').value.trim(); data.sub = ($('#subRadios input:checked') || {}).value || 'ask'; }
        if (!validate(step)) return;
        if (step === 2) { data.name = $('#cName').value.trim(); data.phone = $('#cPhone').value.trim(); data.note = $('#cNote').value.trim(); data.sub = $('#subRadios input:checked').value; }
        if (step < 4) return go(step + 1);
        place();
    });

    /* ---------- place order ---------- */
    function place() {
        if (!$('#cTerms').checked) { $('#termsErr').hidden = false; $('.check-row').classList.add('shake'); setTimeout(() => $('.check-row').classList.remove('shake'), 500); return; }
        $('#termsErr').hidden = true;
        const items = ML.cart.items();
        const over = items.find((l) => l.qty > l.product.stock);
        if (over) { ML.toast(`Only ${over.product.stock} of ${over.product.name} left. Update your basket.`, { type: 'warn' }); return; }
        const btn = $('#coNext');
        btn.classList.add('loading');
        placed = true;
        const started = Date.now();
        ML.api.orders.create({
            items: items.map(({ product: p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty, unit: p.unit, img: p.img, farm: ML.farm(p.farm).name })),
            hub: data.hub,
            slot: { iso: data.slot.iso, label: data.slot.label, window: data.slot.window, hub: data.hub },
            subtotal: ML.cart.subtotal(), discount: ML.cart.discount(), promo: ML.cart.promo(), total: ML.cart.total(),
            pay: data.pay, substitute: data.sub,
            contact: { name: data.name, phone: data.phone, note: data.note },
            idempotencyKey: attempt
        }).then((order) => {
            const wait = ML.remote ? 0 : Math.max(0, 1100 - (Date.now() - started));
            setTimeout(() => {
                if (ML.auth.user() && !ML.auth.user().phone) ML.api.profile.update({ phone: data.phone }).catch(() => {});
                if (!ML.remote) ML.notifs.add({ type: 'orders', icon: 'bx-bookmark-alt-plus', title: 'Basket reserved: ' + order.id, text: `We have told ${new Set(order.items.map((l) => l.farm)).size} farm(s). Collect on ${order.slot.label} at ${ML.hub(order.hub).short}. Code ${order.code}.`, link: 'orders.html?id=' + order.id });
                ML.cart.clear(); ML.cart.clearPromo();
                success(order);
            }, wait);
        }).catch((err) => {
            placed = false;
            btn.classList.remove('loading');
            ML.toast(err.message || 'We could not place your order. Please try again.', { type: 'error' });
            if (err.code === 'stock_changed' || err.status === 409) { ML.emit('cart'); }
        });
    }

    function success(o) {
        const h = ML.hub(o.hub);
        const wrap = document.createElement('div');
        wrap.className = 'success';
        wrap.innerHTML = `<div class="success-card" role="dialog" aria-modal="true" aria-label="Order confirmed">
            <svg class="check-anim" viewBox="0 0 92 92"><circle cx="46" cy="46" r="44"/><path d="M27 48l13 13 26-28"/></svg>
            <h2>Basket reserved!</h2>
            <p>Order <b>${esc(o.id)}</b> is with the farmers. We will nudge you when it is packed.</p>
            <div class="code-ticket"><small>Your pickup code</small><b>${esc(o.code)}</b><span>${esc(o.slot.label)} · ${esc(o.slot.window)} · ${esc(h.short)}</span></div>
            <div class="success-actions"><a class="btn btn-primary btn-lg" href="orders.html?id=${esc(o.id)}"><i class='bx bx-receipt'></i> Track this order</a><a class="btn btn-ghost" href="marketplace.html">Keep shopping</a></div></div>`;
        document.body.appendChild(wrap);
        for (let i = 0; i < 26; i++) {
            const l = document.createElement('i');
            l.className = 'bx bxs-leaf leaf';
            l.style.left = Math.random() * 100 + 'vw';
            l.style.animationDuration = 2.4 + Math.random() * 2.6 + 's';
            l.style.animationDelay = Math.random() * 0.9 + 's';
            l.style.fontSize = 16 + Math.random() * 22 + 'px';
            l.style.color = ['var(--color-primary-light)', 'var(--color-secondary)', 'var(--color-accent)'][i % 3];
            document.body.appendChild(l);
            setTimeout(() => l.remove(), 6500);
        }
        history.replaceState(null, '', 'checkout.html');
    }

    renderHubs();
    renderSummary();
    go(1);
    document.addEventListener('ml:change', (e) => {
        const k = e.detail && e.detail.key;
        if (placed) return;
        if (k === 'cart' || k === '*') { if (guardEmpty()) return; renderSummary(); if (step === 4) { renderReview(); $('#coNext').innerHTML = `<i class='bx bx-lock-alt'></i> Place order · ${money(ML.cart.total())}`; } }
        if (k === 'promo') { renderSummary(); if (step === 4) go(4); }
    });
});

/**
 * MARKETLINK CUSTOMERS — HOME
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;

    /* ---------- greeting ---------- */
    function greet() {
        const h = new Date().getHours();
        const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        const icon = h < 12 ? 'bx-sun' : h < 17 ? 'bx-cloud-light-rain' : 'bx-moon';
        const u = ML.auth.user();
        $('#greet').innerHTML = `<i class='bx ${h < 17 ? 'bx-sun' : icon}' style="font-size:16px"></i> ${part}${u ? ', ' + esc(u.name.split(' ')[0]) : ''}`;
    }
    greet();

    /* ---------- ticket (depends on chosen hub) ---------- */
    let lastVals = {};
    function renderTicket() {
        const hubId = ML.prefs.get().hub;
        const hub = ML.hub(hubId) || ML.HUBS[0];
        const s = ML.nextSlots(hub.id, 1)[0];
        $('#heroHub').textContent = hub.short;
        $('#tkHub').textContent = hub.name;
        $('#tkDate').textContent = s ? ML.fmtDate(s.date) : 'Next week';
        $('#tkWindow').textContent = s ? s.window : ML.windowLabel(hub);
        const code = hub.id + (s ? s.iso : '');
        let seed = 0;
        for (const c of code) seed = (seed * 31 + c.charCodeAt(0)) % 997;
        $('#bars').style.backgroundSize = 12 + (seed % 5) + 'px 100%';
        tickFlip();
    }
    function tickFlip() {
        const p = ML.lockParts();
        if (!p) return;
        ['d', 'h', 'm', 's'].forEach((u) => {
            const el = $(`[data-u="${u}"]`);
            const v = u === 'd' ? String(p[u]) : ML.pad(p[u]);
            if (lastVals[u] !== v) {
                el.textContent = v;
                if (lastVals[u] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
                lastVals[u] = v;
            }
        });
    }
    renderTicket();
    setInterval(tickFlip, 1000);

    /* ---------- active order banner ---------- */
    function renderBanner() {
        const wrap = $('#activeBanner');
        const o = ML.auth.isIn() ? ML.orders.all().find((x) => x.status === 'ready') || ML.orders.all().find(ML.orders.isActive) : null;
        if (!o) { wrap.innerHTML = ''; return; }
        const st = ML.STAGES.find((s) => s.id === o.status);
        const hub = ML.hub(o.hub);
        wrap.innerHTML = `<div class="active-banner"><span class="ic"><i class='bx ${st.icon}'></i></span>
            <div><b>Order ${esc(o.id)} · ${esc(st.label)}</b><small>${o.status === 'ready' ? 'Waiting at ' + esc(hub.name) + '. Your code is ' : esc(o.slot.label) + ' at ' + esc(hub.short) + '. Code '} <b style="display:inline;font-size:inherit">${esc(o.code)}</b></small></div>
            <a class="btn btn-lime btn-sm" href="orders.html?id=${esc(o.id)}">Track order <i class='bx bx-right-arrow-alt go'></i></a></div>`;
    }
    renderBanner();

    /* ---------- marquee ---------- */
    const items = ML.PRODUCTS.map((p) => `<a href="product.html?id=${p.id}"><i class='bx bxs-leaf'></i>${esc(p.name.replace(/\s*\(.*\)/, ''))} <b>${money(p.price)}</b></a>`).join('');
    $('#marqueeTrack').innerHTML = items + items;

    /* ---------- stalls ---------- */
    $('#stalls').innerHTML = ML.CATEGORIES.map((c, i) => {
        const n = ML.PRODUCTS.filter((p) => p.cat === c.id).length;
        return `<a class="stall reveal" style="--i:${i}" href="marketplace.html?cat=${c.id}"><span class="n">${n} items</span><i class='bx ${c.icon} ic'></i><b>${esc(c.name)}</b><small>${esc(c.blurb)}</small></a>`;
    }).join('');

    /* ---------- rail ---------- */
    const picks = ML.PRODUCTS.filter((p) => p.tag === 'Still growing' || p.tag === 'Season peak' || p.tag === 'Popular');
    $('#rail').innerHTML = picks.map((p, i) => ML.productCard(p, i % 4)).join('');
    const rail = $('#rail');
    const step = () => Math.max(260, rail.clientWidth * 0.8);
    $('#railPrev').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#railNext').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

    /* ---------- pickup calendar ---------- */
    function renderCal() {
        const mine = ML.prefs.get().hub;
        const today = new Date();
        let html = '';
        for (let i = 0; i < 7; i++) {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
            const hubs = ML.HUBS.filter((h) => h.day === d.getDay());
            html += `<div class="cal-day reveal${i === 0 ? ' today' : ''}${hubs.length ? '' : ' off'}" style="--i:${i}">
                <span class="dn">${i === 0 ? 'Today' : ML.DAYS[d.getDay()]}</span>
                <span class="dd">${d.getDate()} <small style="font-size:13px;font-family:var(--font-body);opacity:.7">${ML.MONTHS[d.getMonth()]}</small></span>
                ${hubs.length ? hubs.map((h) => `<a class="cal-hub${h.id === mine ? ' mine' : ''}" href="map.html?hub=${h.id}"><i class='bx bx-store-alt'></i><span>${esc(h.short)}<small>${ML.fmtHour(h.start).replace(':00', '')}–${ML.fmtHour(h.end).replace(':00', '')}</small></span></a>`).join('') : '<span class="none">No pickups</span>'}
            </div>`;
        }
        $('#cal').innerHTML = html;
        ML.reveal($('#cal'));
    }
    renderCal();

    /* ---------- farms ---------- */
    function renderFarms() {
        const hub = ML.hub(ML.prefs.get().hub) || ML.HUBS[0];
        const farms = ML.FARMS.map((f) => ({ f, km: ML.distanceKm(hub, f) })).sort((a, b) => a.km - b.km);
        $('#farmSub').textContent = 'Verified growers, nearest to ' + hub.short + ' first.';
        $('#farms').innerHTML = farms.map(({ f, km }, i) => ML.farmCard(f, i, km)).join('');
        ML.reveal($('#farms'));
        document.dispatchEvent(new Event('ml:rendered'));
    }
    renderFarms();

    /* ---------- order again ---------- */
    function renderReorder() {
        const wrap = $('#reorderWrap');
        const done = ML.auth.isIn() ? ML.orders.all().filter((o) => o.status === 'collected').slice(0, 3) : [];
        if (!done.length) { wrap.innerHTML = ''; return; }
        wrap.innerHTML = `<div class="sec-head reveal"><div><h2>Order it <span class="hl">again</span></h2><p>One tap puts a past basket back in your cart.</p></div><a class="link" href="orders.html">All orders <i class='bx bx-right-arrow-alt'></i></a></div>
            <div class="rec-grid">${done.map((o, i) => `<div class="rec reveal" style="--i:${i}">
                <div class="rec-top"><b>${esc(o.id)}</b><small>${esc(ML.fmtDate(o.slot.iso.replace(/-/g, '/')))}</small></div>
                <div class="rec-imgs">${o.items.slice(0, 4).map((l) => `<img src="${esc(l.img)}" alt="${esc(l.name)}" data-fb="${esc(l.name)}">`).join('')}${o.items.length > 4 ? `<span class="more">+${o.items.length - 4}</span>` : ''}</div>
                <p>${o.items.map((l) => l.qty + '× ' + esc(l.name.replace(/\s*\(.*\)/, ''))).join(', ')}</p>
                <div class="rec-foot"><b>${money(o.total)}</b><button class="btn btn-soft btn-sm" data-reorder="${esc(o.id)}"><i class='bx bx-revision'></i> Reorder</button></div></div>`).join('')}</div>`;
        ML.reveal(wrap);
    }
    renderReorder();
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-reorder]');
        if (!b) return;
        const o = ML.orders.get(b.dataset.reorder);
        if (!o) return;
        let added = 0;
        o.items.forEach((l) => { if (ML.product(l.id) && ML.cart.add(l.id, l.qty).ok) added++; });
        ML.flyToCart(b);
        ML.toast(added ? `${added} item${added > 1 ? 's' : ''} from ${o.id} added` : 'Those items are unavailable right now', { icon: 'bx-basket', type: added ? '' : 'warn', action: added ? { label: 'View basket', fn: ML.openCart } : null });
    });

    document.addEventListener('ml:change', (e) => {
        const k = e.detail && e.detail.key;
        if (k === 'prefs' || k === '*') { renderTicket(); renderCal(); renderFarms(); }
        if (k === 'orders' || k === 'user' || k === '*') { renderBanner(); renderReorder(); greet(); }
    });
    document.dispatchEvent(new Event('ml:rendered'));
});

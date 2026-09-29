/**
 * MARKETLINK CUSTOMERS — MAP
 * Leaflet map of partner farms and pickup hubs. Works as a list even if
 * the map library or tiles fail to load.
 */
ML.onReady(() => {
    const { $, $$, esc } = ML;
    let mode = 'all', term = '', sel = null, me = null, map = null, meMarker = null;
    const markers = {};
    const myHubId = () => ML.prefs.get().hub;

    const origin = () => me || ML.hub(myHubId()) || ML.HUBS[0];
    const km = (o) => ML.distanceKm(origin(), o);

    function entries() {
        const list = [];
        if (mode !== 'hubs') ML.FARMS.forEach((f) => list.push({ kind: 'farm', id: f.id, o: f }));
        if (mode !== 'farms') ML.HUBS.forEach((h) => list.push({ kind: 'hub', id: h.id, o: h }));
        const t = term.toLowerCase();
        return list.filter((e) => !t || (e.o.name + ' ' + e.o.area + ' ' + (e.o.specialty || []).join(' ')).toLowerCase().includes(t))
            .sort((a, b) => km(a.o) - km(b.o));
    }

    /* ---------- list ---------- */
    function renderList() {
        const list = entries();
        const box = $('#mapList');
        if (!list.length) { box.innerHTML = `<div class="empty" style="padding:30px 10px"><div class="art"><i class='bx bx-map-pin'></i></div><h3>No matches</h3><p>Try a different name or area.</p></div>`; return; }
        box.innerHTML = list.map((e, i) => {
            const o = e.o, isHub = e.kind === 'hub';
            const meta = isHub
                ? `<span><i class='bx bx-calendar'></i> ${ML.DAYS[o.day]} ${ML.windowLabel(o)}</span><span><i class='bx bx-walk'></i> ${km(o).toFixed(1)} km</span>`
                : `<span><i class='bx bxs-star'></i> ${o.rating}</span><span><i class='bx bx-walk'></i> ${km(o).toFixed(1)} km</span><span><i class='bx bx-basket'></i> ${ML.PRODUCTS.filter((p) => p.farm === o.id).length} crops</span>`;
            return `<button class="m-item ${e.kind}${sel && sel.id === e.id && sel.kind === e.kind ? ' on' : ''}" data-kind="${e.kind}" data-id="${e.id}" style="--i:${i}">
                <span class="m-ic">${isHub ? `<i class='bx bx-store-alt'></i>` : `<img src="${esc(o.img)}" alt="" data-fb="${esc(o.name)}">`}</span>
                <span><b>${esc(o.name)}</b><small>${esc(isHub ? o.area : o.area + ' · ' + o.specialty.join(', '))}</small><span class="m-meta">${meta}</span></span>
                ${isHub && myHubId() === o.id ? '<em class="m-mine" style="font-style:normal">My hub</em>' : ''}</button>`;
        }).join('');
    }

    /* ---------- map ---------- */
    function icon(kind, glyph, sel) {
        return L.divIcon({ className: '', html: `<div class="mk ${kind}${sel ? ' sel' : ''}"><div class="pin"><i class='bx ${glyph}'></i></div></div>`, iconSize: [44, 44], iconAnchor: [22, 40], popupAnchor: [0, -38] });
    }
    function popupHTML(kind, o) {
        const dir = `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`;
        if (kind === 'farm') {
            const on = ML.favFarms.has(o.id);
            return `<div class="pop-cover" style="background-image:url('${esc(o.img)}')"></div><div class="pop-body"><h4>${esc(o.name)}</h4>
                <p><i class='bx bxs-star' style="color:var(--color-accent)"></i> ${o.rating} (${o.reviews}) · ${esc(o.area)} · since ${o.since}<br>${o.specialty.map(esc).join(' · ')}</p>
                <div class="pop-actions"><a class="btn btn-primary" href="marketplace.html?farm=${o.id}"><i class='bx bx-basket'></i> Crops</a>
                <button class="btn btn-soft" data-follow="${o.id}"><i class='bx ${on ? 'bxs-heart' : 'bx-heart'}'></i> ${on ? 'Following' : 'Follow'}</button>
                <a class="btn btn-ghost" target="_blank" rel="noopener" href="${dir}"><i class='bx bx-navigation'></i></a></div></div>`;
        }
        const mine = myHubId() === o.id;
        return `<div class="pop-cover hub"><i class='bx bx-store-alt'></i></div><div class="pop-body"><h4>${esc(o.name)}</h4>
            <p>${esc(o.area)}<br><b>${ML.DAYS[o.day]}s, ${ML.windowLabel(o)}</b><br>${esc(o.note)}</p>
            <div class="pop-actions"><button class="btn btn-primary" data-myhub="${o.id}"${mine ? ' disabled' : ''}><i class='bx bx-check'></i> ${mine ? 'My hub' : 'Set as my hub'}</button>
            <a class="btn btn-ghost" target="_blank" rel="noopener" href="${dir}"><i class='bx bx-navigation'></i> Directions</a></div></div>`;
    }
    function initMap() {
        if (typeof L === 'undefined') { $('#mapFallback').hidden = false; return; }
        map = L.map('map', { zoomControl: false, scrollWheelZoom: true }).setView([6.6, 3.4], 9);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        const tiles = L.tileLayer(ML.config.MAP_TILES || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
        let errs = 0;
        tiles.on('tileerror', () => { if (++errs === 6) ML.toast('Map tiles are slow to load. The list still works.', { type: 'warn' }); });
        ML.FARMS.forEach((f) => {
            const m = L.marker([f.lat, f.lng], { icon: icon('farm', 'bxs-leaf'), title: f.name, keyboard: true }).addTo(map).bindPopup(() => popupHTML('farm', f));
            m.on('click', () => select('farm', f.id, true));
            markers['farm:' + f.id] = m;
        });
        ML.HUBS.forEach((h) => {
            const m = L.marker([h.lat, h.lng], { icon: icon('hub', 'bx-store-alt'), title: h.name, keyboard: true }).addTo(map).bindPopup(() => popupHTML('hub', h));
            m.on('click', () => select('hub', h.id, true));
            markers['hub:' + h.id] = m;
        });
        fitAll();
        setTimeout(() => map.invalidateSize(), 250);
        window.addEventListener('resize', () => map.invalidateSize());
    }
    function fitAll() {
        if (!map) return;
        const pts = [].concat(ML.FARMS, ML.HUBS).map((p) => [p.lat, p.lng]);
        map.flyToBounds(pts, { padding: [60, 60], duration: 1.1 });
    }

    function select(kind, id, fromMap) {
        sel = { kind, id };
        const o = kind === 'farm' ? ML.farm(id) : ML.hub(id);
        Object.keys(markers).forEach((k) => { const el = markers[k].getElement(); if (el) { const mk = el.querySelector('.mk'); if (mk) mk.classList.toggle('sel', k === kind + ':' + id); } });
        renderList();
        const item = $(`.m-item[data-kind="${kind}"][data-id="${id}"]`);
        if (item && fromMap) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        if (map && !fromMap) { map.flyTo([o.lat, o.lng], 12, { duration: 1 }); setTimeout(() => markers[kind + ':' + id].openPopup(), 900); }
        if (!map) ML.toast(o.name + ' · ' + o.area, { icon: 'bx-map-pin' });
        if (window.innerWidth <= 960) $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ---------- events ---------- */
    $('#mapList').addEventListener('click', (e) => { const b = e.target.closest('.m-item'); if (b) select(b.dataset.kind, b.dataset.id); });
    $('#mapSeg').addEventListener('click', (e) => {
        const b = e.target.closest('[data-mode]'); if (!b) return;
        mode = b.dataset.mode;
        $$('#mapSeg button').forEach((x) => x.classList.toggle('on', x === b));
        Object.keys(markers).forEach((k) => { const show = mode === 'all' || (mode === 'farms') === (k.indexOf('farm:') === 0); show ? markers[k].addTo(map) : map.removeLayer(markers[k]); });
        renderList();
    });
    $('#mapSearch').addEventListener('input', (e) => { term = e.target.value.trim(); renderList(); });
    $('#btnReset').addEventListener('click', () => { sel = null; if (map) { map.closePopup(); fitAll(); } renderList(); });
    $('#btnList').addEventListener('click', () => $('#mapPanel').scrollIntoView({ behavior: 'smooth' }));
    $('#btnLocate').addEventListener('click', () => {
        if (!navigator.geolocation) return ML.toast('Location is not available in this browser', { type: 'warn' });
        const b = $('#btnLocate'); b.classList.add('loading');
        navigator.geolocation.getCurrentPosition((pos) => {
            b.classList.remove('loading');
            me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (map) {
                if (meMarker) map.removeLayer(meMarker);
                meMarker = L.marker([me.lat, me.lng], { icon: icon('me', 'bxs-user'), interactive: false }).addTo(map);
                const nearest = entries()[0];
                map.flyTo([me.lat, me.lng], 11, { duration: 1.2 });
                if (nearest) ML.toast(`Closest: ${nearest.o.name}, ${km(nearest.o).toFixed(1)} km away`, { icon: 'bx-current-location' });
            }
            renderList();
        }, () => { b.classList.remove('loading'); ML.toast('We could not get your location. Allow access and retry.', { type: 'warn' }); }, { timeout: 8000 });
    });
    document.addEventListener('click', (e) => {
        const f = e.target.closest('[data-follow]');
        if (f) { const on = ML.favFarms.toggle(f.dataset.follow); ML.toast(on ? 'Following ' + ML.farm(f.dataset.follow).name : 'Unfollowed', { icon: on ? 'bxs-heart' : 'bx-heart' }); f.innerHTML = `<i class='bx ${on ? 'bxs-heart' : 'bx-heart'}'></i> ${on ? 'Following' : 'Follow'}`; return; }
        const h = e.target.closest('[data-myhub]');
        if (h) { ML.prefs.set({ hub: h.dataset.myhub }); ML.toast(ML.hub(h.dataset.myhub).name + ' is now your hub', { icon: 'bx-store-alt' }); h.disabled = true; h.innerHTML = `<i class='bx bx-check'></i> My hub`; renderList(); }
    });

    initMap();
    renderList();
    const qf = ML.query.get('farm'), qh = ML.query.get('hub');
    if (qf && ML.farm(qf)) setTimeout(() => select('farm', qf), 500);
    else if (qh && ML.hub(qh)) setTimeout(() => select('hub', qh), 500);
});

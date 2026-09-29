/**
 * MARKETLINK CUSTOMERS — FAVORITES
 */
ML.onReady(() => {
    const { $, $$, esc } = ML;
    let tab = ML.query.get('tab') === 'farms' ? 'farms' : 'products';

    function render() {
        const prods = ML.favs.list().map(ML.product).filter(Boolean);
        const farms = ML.favFarms.list().map(ML.farm).filter(Boolean);
        $('#nProducts').textContent = prods.length;
        $('#nFarms').textContent = farms.length;
        $$('#favTabs .tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
        const body = $('#favBody');
        const acts = $('#favActions');

        if (tab === 'products') {
            acts.innerHTML = prods.length ? `<button class="btn btn-primary" id="addAll"><i class='bx bx-basket'></i> Add all to basket</button><button class="btn btn-ghost" id="clearFavs"><i class='bx bx-trash'></i> Clear</button>` : '';
            body.innerHTML = prods.length
                ? `<div class="pgrid">${prods.map((p, i) => ML.productCard(p, i % 6)).join('')}</div>`
                : `<div class="empty"><div class="art"><i class='bx bx-heart'></i></div><h3>No saved produce yet</h3><p>Tap the heart on anything you love and it will wait for you here.</p><a class="btn btn-primary" href="marketplace.html">Browse the market</a></div>`;
        } else {
            acts.innerHTML = '';
            body.innerHTML = farms.length
                ? `<div class="farms">${farms.map((f, i) => ML.farmCard(f, i, ML.distanceKm(ML.hub(ML.prefs.get().hub) || ML.HUBS[0], f))).join('')}</div>`
                : `<div class="empty"><div class="art"><i class='bx bx-leaf'></i></div><h3>You are not following any farms</h3><p>Follow a farm to keep track of its harvests and new arrivals.</p><a class="btn btn-primary" href="map.html">Discover farms</a></div>`;
        }
        ML.reveal(body);
        document.dispatchEvent(new Event('ml:rendered'));
    }

    $('#favTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; history.replaceState(null, '', tab === 'farms' ? '?tab=farms' : location.pathname); render(); });

    document.addEventListener('click', async (e) => {
        if (e.target.closest('#addAll')) {
            let n = 0, skipped = 0;
            ML.favs.list().forEach((id) => { const r = ML.cart.add(id, 1); if (r.ok) n++; else skipped++; });
            ML.flyToCart(e.target.closest('#addAll'));
            ML.toast(`${n} item${n === 1 ? '' : 's'} added to your basket${skipped ? ` (${skipped} unavailable)` : ''}`, { icon: 'bx-basket', action: { label: 'View', fn: ML.openCart } });
        }
        if (e.target.closest('#clearFavs')) {
            const prev = ML.favs.list();
            if (await ML.confirm({ title: 'Clear all favorites?', message: 'This removes every saved item from your shelf.', ok: 'Clear all', danger: true })) {
                prev.forEach((id) => ML.favs.remove(id));
                ML.toast('Favorites cleared', { icon: 'bx-trash', action: { label: 'Undo', fn: () => prev.slice().reverse().forEach((id) => ML.favs.toggle(id)) } });
            }
        }
    });

    /* un-favouriting a card: fade it out, then re-render so the shelf stays honest */
    document.addEventListener('ml:change', (e) => {
        const k = e.detail && e.detail.key;
        if (k !== 'favs' && k !== 'favfarms') return;
        clearTimeout(render.t);
        render.t = setTimeout(render, 420);
        $$('.pcard, .farm-card').forEach((c) => {
            const b = c.querySelector('[data-fav], [data-fav-farm]');
            if (b && b.dataset.fav && !ML.favs.has(b.dataset.fav)) c.style.cssText += ';opacity:.0;transform:scale(.92);transition:.35s';
            if (b && b.dataset.favFarm && !ML.favFarms.has(b.dataset.favFarm)) c.style.cssText += ';opacity:0;transform:scale(.92);transition:.35s';
        });
    });
    render();
});

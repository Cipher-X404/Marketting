/**
 * MARKETLINK CUSTOMERS — PRODUCT DETAIL
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;
    const p = ML.product(ML.query.get('id'));
    const root = $('#pdp');

    if (!p) {
        $('#crumbs').innerHTML = `<a href="marketplace.html">Marketplace</a><i class='bx bx-chevron-right'></i><b>Not found</b>`;
        root.innerHTML = `<div class="empty nf"><div class="art"><i class='bx bx-search-alt'></i></div><h3>We could not find that crop</h3><p>It may have been harvested out or the link is old. Browse what is growing right now.</p><a class="btn btn-primary" href="marketplace.html">Back to the market</a></div>`;
        return;
    }
    document.title = p.name + ' — MarketLink';
    const farm = ML.farm(p.farm), cat = ML.category(p.cat);
    let qty = 1;

    $('#crumbs').innerHTML = `<a href="home.html">Home</a><i class='bx bx-chevron-right'></i><a href="marketplace.html">Marketplace</a><i class='bx bx-chevron-right'></i><a href="marketplace.html?cat=${cat.id}">${esc(cat.name)}</a><i class='bx bx-chevron-right'></i><b>${esc(p.name)}</b>`;

    const allReviews = () => ML.reviews.forProduct(p.id).map((r) => Object.assign({ mine: true }, r)).concat(ML.seedReviews(p).map((r) => Object.assign({}, r)));

    function growth() {
        const hub = ML.prefs.get().hub;
        const s = ML.nextSlots(hub, 1)[0];
        const days = s ? Math.max(0, Math.ceil((s.lock - Date.now()) / 864e5)) : 0;
        return { s, days, pct: Math.min(76, Math.max(28, 76 - days * 8)) };
    }

    function render() {
        const g = growth();
        const hub = ML.hub(ML.prefs.get().hub) || ML.HUBS[0];
        const low = p.stock <= 5;
        root.innerHTML = `
        <div class="pdp">
            <div class="pdp-media reveal">
                <div class="zoom" id="zoom"><img src="${esc(p.img.replace('w=700', 'w=1100'))}" alt="${esc(p.name)}" data-fb="${esc(p.name)}">${p.tag ? `<span class="stamp${p.tag === 'Low stock' ? ' red' : ' lime'}">${esc(p.tag)}</span>` : ''}</div>
                <div class="pdp-perks">
                    <div class="perk"><i class='bx bx-sun'></i>Cut to order</div>
                    <div class="perk"><i class='bx bx-purchase-tag-alt'></i>Farm-gate price</div>
                    <div class="perk"><i class='bx bx-store-alt'></i>Collect at a hub</div>
                </div>
            </div>
            <div class="pdp-info reveal" style="--i:2">
                <a class="pdp-farm" href="map.html?farm=${farm.id}"><img src="${esc(farm.img)}" alt="" data-fb="${esc(farm.name)}">${esc(farm.name)} <i class='bx bxs-badge-check'></i></a>
                <h1>${esc(p.name)}</h1>
                <div class="pdp-rate"><span class="stars">${ML.stars(p.rating)}</span><b>${p.rating.toFixed(1)}</b><a href="#reviews" data-goto="reviews">${p.reviews + ML.reviews.forProduct(p.id).length} reviews</a>${p.organic ? '<span class="badge"><i class="bx bx-leaf"></i> Organic</span>' : ''}</div>
                <div class="pdp-price"><div class="tag-price"><b>${money(p.price)}</b><small>/ ${esc(p.unit)}</small></div><span class="stock-note${low ? '' : ' ok'}">${p.stock === 0 ? 'Sold out this week' : low ? 'Only ' + p.stock + ' left' : p.stock + ' available'}</span></div>
                <p class="pdp-desc">${esc(p.desc)}</p>
                <div class="pdp-facts">
                    <div class="fact"><small>Sold by</small><b>${esc(p.unit)}</b></div>
                    <div class="fact"><small>Grown in</small><b>${esc(farm.area)}</b></div>
                </div>
                <div class="pdp-buy">
                    <div class="qty" id="qty"><button data-d="-1" aria-label="Decrease quantity"><i class='bx bx-minus'></i></button><span id="qtyN">1</span><button data-d="1" aria-label="Increase quantity"><i class='bx bx-plus'></i></button></div>
                    <button class="btn btn-primary" id="addBtn"${p.stock === 0 ? ' disabled' : ''}><i class='bx bx-basket'></i> Add to basket · <span id="lineTotal">${money(p.price)}</span></button>
                    <button class="btn btn-lime" id="reserveBtn"${p.stock === 0 ? ' disabled' : ''}>Reserve now</button>
                    <div class="pdp-sub" style="width:100%">
                        <button class="btn btn-ghost btn-sm fav${ML.favs.has(p.id) ? ' active' : ''}" data-fav="${p.id}" style="width:auto;border-radius:99px;flex:1"><i class='bx ${ML.favs.has(p.id) ? 'bxs-heart' : 'bx-heart'}'></i> Save</button>
                        <button class="btn btn-ghost btn-sm" id="shareBtn" style="flex:1"><i class='bx bx-share-alt'></i> Share</button>
                    </div>
                </div>
                <div class="pdp-pickup"><span class="ic"><i class='bx bx-map-pin'></i></span><span><b>Collect at ${esc(hub.name)}</b><small>${g.s ? esc(g.s.label) + ' · ' + esc(g.s.window) : 'No slot this week'}</small></span><button class="btn btn-soft btn-sm" data-hub-picker>Change</button></div>
                <div>
                    <div class="growth" style="--gw:${g.pct}%">
                        <div class="g-step done"><i class='bx bx-leaf'></i>Planted</div>
                        <div class="g-step done"><i class='bx bx-leaf'></i>Growing</div>
                        <div class="g-step now"><i class='bx bx-lock-alt'></i>${g.days ? 'Locks in ' + g.days + 'd' : 'Locks today'}</div>
                        <div class="g-step"><i class='bx bx-store-alt'></i>Pickup</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="pdp-tabs reveal" id="tabsWrap">
            <div class="tabs" role="tablist">
                <button class="tab-btn active" data-pane="details" role="tab">Details</button>
                <button class="tab-btn" data-pane="reviews" role="tab" id="revTab">Reviews <span class="n">${allReviews().length}</span></button>
                <button class="tab-btn" data-pane="farm" role="tab">The farm</button>
            </div>
            <div class="pane" id="pane-details">
                <div class="pane-grid">
                    <div class="card"><h3 style="font-size:24px;margin-bottom:10px">About this crop</h3><p class="pdp-desc">${esc(p.desc)}</p>
                        <div class="pdp-facts" style="margin-top:16px"><div class="fact"><small>Category</small><b>${esc(cat.name)}</b></div><div class="fact"><small>Farming</small><b>${p.organic ? 'Certified organic' : 'Low-input, no synthetic dyes'}</b></div><div class="fact"><small>Harvest</small><b>On pickup morning</b></div><div class="fact"><small>Price unit</small><b>${esc(p.unit)}</b></div></div></div>
                    <div class="tip"><h4><i class='bx bx-bulb'></i> Storage &amp; prep</h4><p>${esc(p.tip)}</p></div>
                </div>
            </div>
            <div class="pane" id="pane-reviews" hidden></div>
            <div class="pane" id="pane-farm" hidden>
                <div class="card farm-pane"><img src="${esc(farm.img)}" alt="${esc(farm.name)}" data-fb="${esc(farm.name)}"><div>
                    <h3>${esc(farm.name)}</h3><p>${esc(farm.about)}</p>
                    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="marketplace.html?farm=${farm.id}"><i class='bx bx-store-alt'></i> All their crops</a><a class="btn btn-ghost btn-sm" href="map.html?farm=${farm.id}"><i class='bx bx-map-alt'></i> See on map</a><button class="btn btn-soft btn-sm" data-fav-farm="${farm.id}" data-label="1"><i class='bx bx-heart'></i> <span>Follow</span></button></div></div></div>
            </div>
        </div>`;
        renderReviews();
        wire();
        ML.reveal(root);
        document.dispatchEvent(new Event('ml:rendered'));
    }

    function renderReviews() {
        const list = allReviews();
        const avg = (list.reduce((n, r) => n + r.stars, 0) / list.length);
        $('#revTab .n').textContent = list.length;
        $('#pane-reviews').innerHTML = `
            <div class="rev-top"><div class="rev-score"><b>${p.rating.toFixed(1)}</b><div><div class="stars">${ML.stars(p.rating)}</div><small class="muted">Based on ${p.reviews + ML.reviews.forProduct(p.id).length} shoppers</small></div></div>
                <button class="btn btn-primary" id="writeRev"><i class='bx bx-edit'></i> Write a review</button></div>
            <div class="rev-list">${list.map((r, i) => `<div class="rev${r.mine ? ' mine' : ''}" style="animation-delay:${i * 60}ms"><div class="rev-h"><span class="avatar" style="width:38px;height:38px;font-size:13px">${esc(ML.initials(r.name))}</span><span><b>${esc(r.name)}${r.mine ? ' (you)' : ''}</b><small>${r.mine ? ML.ago(r.at) : r.days + ' days ago'}</small></span><span class="stars">${ML.stars(r.stars)}</span></div><p>${esc(r.text)}</p></div>`).join('')}</div>`;
        void avg;
    }

    function wire() {
        /* zoom follows the pointer */
        const z = $('#zoom');
        z.addEventListener('mousemove', (e) => { const r = z.getBoundingClientRect(); z.firstElementChild.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%'); z.firstElementChild.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%'); });
        z.firstElementChild.style.transformOrigin = 'var(--zx,50%) var(--zy,50%)';

        /* quantity */
        const paint = () => { $('#qtyN').textContent = qty; $('#lineTotal').textContent = money(p.price * qty); const [m, pl] = $$('#qty button'); m.disabled = qty <= 1; pl.disabled = qty >= p.stock; };
        $('#qty').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; qty = Math.max(1, Math.min(p.stock, qty + Number(b.dataset.d))); paint(); });
        paint();
        $('#addBtn').addEventListener('click', (e) => ML.addToCart(p.id, qty, e.currentTarget));
        $('#reserveBtn').addEventListener('click', () => { const r = ML.cart.add(p.id, qty); if (!r.ok && r.reason === 'stock') ML.toast(`Only ${r.max} available`, { type: 'warn' }); location.href = 'checkout.html'; });
        $('#shareBtn').addEventListener('click', async () => {
            const url = location.href;
            if (navigator.share) { try { await navigator.share({ title: p.name, text: `${p.name} from ${farm.name} on MarketLink`, url }); return; } catch (e) { return; } }
            try { await navigator.clipboard.writeText(url); ML.toast('Link copied. Share it with a friend.', { icon: 'bx-link' }); } catch (e) { ML.toast(url, { icon: 'bx-link', duration: 6000 }); }
        });

        /* tabs */
        const show = (name) => {
            $$('.pdp-tabs .tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.pane === name));
            $$('.pane').forEach((x) => { x.hidden = x.id !== 'pane-' + name; });
        };
        $('#tabsWrap .tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-pane]'); if (b) show(b.dataset.pane); });
        $('[data-goto="reviews"]').addEventListener('click', (e) => { e.preventDefault(); show('reviews'); $('#tabsWrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        if (location.hash === '#reviews') show('reviews');

        /* review form */
        $('#pane-reviews').addEventListener('click', (e) => { if (e.target.closest('#writeRev')) writeReview(); });
    }

    function writeReview() {
        if (!ML.auth.isIn()) {
            ML.confirm({ title: 'Sign in to review', message: 'Only signed-in shoppers can leave reviews, so farmers know they are real.', ok: 'Sign in' }).then((y) => { if (y) location.href = 'auth.html?next=' + encodeURIComponent('product.html?id=' + p.id + '#reviews'); });
            return;
        }
        let stars = 5;
        const m = ML.modal({
            title: 'Review ' + p.name, size: 'sm',
            html: `<p class="muted" style="margin-bottom:14px">How was it?</p>
                <div class="star-input" id="starIn">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="on" data-s="${n}" aria-label="${n} stars"><i class='bx bxs-star'></i></button>`).join('')}</div>
                <label class="field" id="rvField"><span>Your review</span><textarea class="textarea" id="rvText" placeholder="Freshness, taste, packing, pickup…"></textarea><em class="err">Write at least a few words.</em></label>`,
            actions: [
                { label: 'Cancel', cls: 'btn-ghost' },
                { label: 'Post review', cls: 'btn-primary', icon: 'bx-send', onClick: () => {
                    const t = $('#rvText', m.el).value.trim();
                    $('#rvField', m.el).classList.toggle('error', t.length < 5);
                    if (t.length < 5) return false;
                    ML.api.reviews.create(p.id, { name: ML.auth.user().name, stars, text: t })
                        .then(() => { ML.toast('Thanks! Your review is live.', { icon: 'bx-star' }); renderReviews(); })
                        .catch((err) => ML.toast(err.message, { type: 'error' }));
                } }
            ]
        });
        $('#starIn', m.el).addEventListener('click', (e) => {
            const b = e.target.closest('[data-s]'); if (!b) return;
            stars = Number(b.dataset.s);
            $$('#starIn button', m.el).forEach((x) => x.classList.toggle('on', Number(x.dataset.s) <= stars));
        });
    }

    render();
    document.addEventListener('ml:change', (e) => { const k = e.detail && e.detail.key; if (k === 'prefs') render(); });

    /* related */
    const rel = ML.PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(ML.PRODUCTS.filter((x) => x.cat !== p.cat && x.farm === p.farm && x.id !== p.id)).slice(0, 4);
    if (rel.length) {
        $('#related').innerHTML = `<div class="sec-head reveal"><div><h2>Goes well with</h2><p>More from ${esc(cat.name.toLowerCase())} and ${esc(farm.name)}.</p></div></div><div class="pgrid">${rel.map((x, i) => ML.productCard(x, i)).join('')}</div>`;
        ML.reveal($('#related'));
        document.dispatchEvent(new Event('ml:rendered'));
    }
});

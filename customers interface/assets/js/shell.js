/**
 * MARKETLINK CUSTOMERS — SHELL
 * Builds the shared chrome (awning, dock, topbar, tab bar, basket drawer)
 * around each page's <main id="page">, and provides the shared UI kit:
 * toast, modal, confirm, hub picker, product card, quick view, fly-to-basket.
 * Written once here so no page repeats the navigation markup.
 */
(function (ML) {
    'use strict';
    const { $, $$, esc, money } = ML;
    const body = document.body;
    const pageId = body.dataset.page || '';
    const navId = body.dataset.nav || pageId;
    ML.pageId = pageId;

    /* ---------- guard ---------- */
    if (body.dataset.guard === 'auth' && !ML.auth.isIn()) {
        location.replace('auth.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
        return;
    }


    /* ---------- nav model ---------- */
    const NAV = [
        { id: 'home',          href: 'home.html',          icon: 'bx-home-smile',  label: 'Home' },
        { id: 'marketplace',   href: 'marketplace.html',   icon: 'bx-store-alt',   label: 'Marketplace' },
        { id: 'map',           href: 'map.html',           icon: 'bx-map-alt',     label: 'Farms & Hubs' },
        { id: 'favorites',     href: 'favorites.html',     icon: 'bx-heart',       label: 'Favorites' },
        { id: 'cart',          href: 'cart.html',          icon: 'bx-basket',      label: 'Basket',      badge: 'cart' },
        { id: 'orders',        href: 'orders.html',        icon: 'bx-receipt',     label: 'My Orders' },
        { id: 'notifications', href: 'notifications.html', icon: 'bx-bell',        label: 'Notifications', badge: 'notifs' },
        { id: 'chatbot',       href: 'chatbot.html',       icon: 'bx-bot',         label: 'eGreen Assistant' },
        { id: 'profile',       href: 'profile.html',       icon: 'bx-user',        label: 'Profile' },
        { id: 'settings',      href: 'settings.html',      icon: 'bx-cog',         label: 'Settings' }
    ];

    ML.avatarHTML = function (u) {
        if (u && u.avatar) return `<span class="avatar"><img src="${esc(u.avatar)}" alt=""></span>`;
        return `<span class="avatar">${esc(ML.initials(u ? u.name : 'Guest'))}</span>`;
    };

    /* ============================================================
       BUILD SHELL
       ============================================================ */
    const main = $('#page');
    const app = document.createElement('div');
    app.className = 'ml-app';
    const collapsed = (function () { try { return localStorage.getItem('marketlink_c_dock') === '1'; } catch (e) { return false; } })();
    if (collapsed && window.innerWidth >= 1024) body.classList.add('dock-collapsed');

    app.innerHTML = `
    <aside class="dock" id="dock" aria-label="Main navigation">
        <div class="dock-brand">
            <a class="brand" href="home.html" aria-label="MarketLink home">
                <span class="brand-mark"><i class='bx bx-basket'></i></span>
                <span class="brand-name">Market<em>Link</em></span>
            </a>
            <button class="dock-collapse" id="dockCollapse" aria-label="Collapse sidebar"><i class='bx bx-chevrons-left'></i></button>
            <button class="dock-close" id="dockClose" aria-label="Close menu"><i class='bx bx-x'></i></button>
        </div>
        <div id="dockUser"></div>
        <nav class="dock-nav">
            ${NAV.map((n) => `
            <a class="dock-link${n.id === navId ? ' active' : ''}" href="${n.href}" data-tip="${esc(n.label)}"${n.id === navId ? ' aria-current="page"' : ''}>
                <i class='bx ${n.icon}'></i><span class="dock-label">${esc(n.label)}</span>
                ${n.badge ? `<b class="dock-badge" data-badge="${n.badge}" data-zero="1">0</b>` : ''}
            </a>`).join('')}
        </nav>
        <div class="dock-card">
            <small>Next harvest locks in</small>
            <strong id="lockClock">--</strong>
            <a href="marketplace.html">Reserve now <i class='bx bx-right-arrow-alt'></i></a>
        </div>
        <a class="dock-sell" href="../farmers%20interface/auth.html" data-tip="Sell on MarketLink"><i class='bx bx-leaf'></i><span class="dock-label">Sell on MarketLink</span></a>
    </aside>
    <div class="dock-overlay" id="dockOverlay"></div>

    <div class="stage">
        <div class="awning" aria-hidden="true"></div>
        <header class="topbar">
            <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu"><i class='bx bx-menu-alt-left'></i></button>
            <button class="hub-chip" data-hub-picker aria-label="Change pickup hub">
                <span class="pin"><i class='bx bx-map-pin'></i></span>
                <div><small>Pickup at</small><b id="hubName">Yaba Hub</b></div>
                <i class='bx bx-chevron-down'></i>
            </button>
            <form class="search" id="searchForm" action="marketplace.html" role="search" autocomplete="off">
                <i class='bx bx-search lead'></i>
                <input type="search" name="q" id="searchInput" placeholder="Search tomatoes, yam, farms…" aria-label="Search the marketplace">
                <kbd>/</kbd>
                <div class="suggest" id="suggest" hidden></div>
            </form>
            <div class="tb-actions">
                <button class="icon-btn hide-m" data-theme-toggle aria-label="Toggle light and dark theme"><i class='bx bx-sun' id="themeIcon"></i></button>
                <div class="has-dd hide-m" id="bellWrap">
                    <button class="icon-btn" id="bellBtn" aria-label="Notifications" aria-haspopup="true"><i class='bx bx-bell'></i><span class="count" data-badge="notifs" data-zero="1">0</span></button>
                </div>
                <button class="icon-btn" data-cart-open id="cartBtn" aria-label="Open basket"><i class='bx bx-basket'></i><span class="count" data-badge="cart" data-zero="1">0</span></button>
                <div class="has-dd" id="userWrap"></div>
            </div>
        </header>
        <div id="pageSlot"></div>
    </div>

    <nav class="tabbar" aria-label="Quick navigation">
        <a class="tab${navId === 'home' ? ' active' : ''}" href="home.html"><i class='bx bx-home-smile'></i>Home</a>
        <a class="tab${navId === 'marketplace' ? ' active' : ''}" href="marketplace.html"><i class='bx bx-store-alt'></i>Market</a>
        <button class="tab center" data-cart-open aria-label="Open basket"><i class='bx bx-basket'></i><span class="count" data-badge="cart" data-zero="1">0</span></button>
        <a class="tab${navId === 'orders' ? ' active' : ''}" href="orders.html"><i class='bx bx-receipt'></i>Orders</a>
        <button class="tab" id="tabMenu"><i class='bx bx-grid-alt'></i>Menu</button>
    </nav>

    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer" aria-label="Basket" aria-hidden="true">
        <div class="drawer-head">
            <h3>Your basket <span class="pill" id="drawerPill">0 items</span></h3>
            <button class="modal-x" data-cart-close aria-label="Close basket"><i class='bx bx-x'></i></button>
        </div>
        <div class="drawer-body" id="drawerBody"></div>
        <div class="drawer-foot" id="drawerFoot"></div>
    </aside>`;

    document.body.insertBefore(app, document.body.firstChild);
    if (main) {
        main.classList.add('page');
        $('#pageSlot', app).replaceWith(main);
        const foot = document.createElement('footer');
        foot.className = 'foot';
        foot.innerHTML = `<span>© 2026 MarketLink · eGreen Basket · Fair trade agriculture</span>
            <nav><a href="marketplace.html">Marketplace</a><a href="map.html">Farms &amp; hubs</a><a href="chatbot.html">Help</a><a href="../farmers%20interface/auth.html">Sell with us</a><a href="../index.html">About</a></nav>`;
        main.appendChild(foot);
    }

    /* ============================================================
       HUB PICKER
       ============================================================ */
    ML.hubPicker = function () {
        const cur = ML.prefs.get().hub;
        const m = ML.modal({
            title: 'Where will you collect?',
            html: `<p class="muted" style="margin-bottom:6px">Pick the hub nearest to you. Prices are the same everywhere, only the pickup window changes.</p>
            <div class="hub-list">${ML.HUBS.map((h) => {
                const s = ML.nextSlots(h.id, 1)[0];
                return `<button class="hub-opt${h.id === cur ? ' active' : ''}" data-hub="${h.id}">
                    <span class="pin"><i class='bx bx-store-alt'></i></span>
                    <span><b>${esc(h.name)}</b><small>${esc(h.area)}</small><small><i class='bx bx-calendar'></i> ${s ? esc(s.label) + ' · ' + esc(s.window) : 'No slot this week'}</small></span>
                    <i class='bx bxs-check-circle tick'></i></button>`;
            }).join('')}</div>`,
            actions: [{ label: 'See them on the map', cls: 'btn-ghost', icon: 'bx-map-alt', onClick: () => { location.href = 'map.html'; return false; } }]
        });
        m.body.addEventListener('click', (e) => {
            const b = e.target.closest('[data-hub]');
            if (!b) return;
            ML.prefs.set({ hub: b.dataset.hub });
            ML.toast('Pickup hub set to ' + ML.hub(b.dataset.hub).name, { icon: 'bx-map-pin' });
            m.close();
        });
        return m;
    };

    /* ============================================================
       PRODUCT CARD + QUICK VIEW
       ============================================================ */
    ML.productCard = function (p, i) {
        const farm = ML.farm(p.farm);
        const low = p.stock <= 5;
        return `<article class="pcard reveal" style="--i:${i || 0}" data-id="${p.id}">
            <a class="pcard-media" href="product.html?id=${p.id}" aria-label="View ${esc(p.name)}">
                <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" data-fb="${esc(p.name)}">
                ${p.tag ? `<span class="stamp${p.tag === 'Low stock' ? ' red' : p.tag === 'Still growing' ? ' lime' : ''}">${esc(p.tag)}</span>` : ''}
            </a>
            <button class="fav${ML.favs.has(p.id) ? ' active' : ''}" data-fav="${p.id}" aria-label="Save ${esc(p.name)} to favorites"><i class='bx ${ML.favs.has(p.id) ? 'bxs-heart' : 'bx-heart'}'></i></button>
            <button class="pcard-quick" data-quick="${p.id}"><i class='bx bx-show'></i> Quick view</button>
            <div class="pcard-body">
                <a class="pcard-farm" href="map.html?farm=${farm.id}"><i class='bx bxs-badge-check'></i> ${esc(farm.name)}</a>
                <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
                <div class="pcard-meta">
                    <span class="stars"><i class='bx bxs-star'></i> ${p.rating.toFixed(1)} <small>(${p.reviews})</small></span>
                    <span class="stock-note${low ? '' : ' ok'}">${p.stock === 0 ? 'Sold out' : low ? 'Only ' + p.stock + ' left' : p.organic ? 'Organic' : 'In season'}</span>
                </div>
                <div class="pcard-foot">
                    <div class="tag-price"><b>${money(p.price)}</b><small>/ ${esc(p.unit)}</small></div>
                    <button class="add" data-add="${p.id}"${p.stock === 0 ? ' disabled' : ''}><i class='bx bx-plus'></i><span>Add</span></button>
                </div>
            </div>
        </article>`;
    };


    ML.farmCard = function (f, i, km) {
        const crops = ML.PRODUCTS.filter((p) => p.farm === f.id).length;
        const on = ML.favFarms.has(f.id);
        return `<article class="farm-card reveal" style="--i:${i || 0}">
            <div class="farm-cover"><img src="${esc(f.img)}" alt="${esc(f.name)} fields" loading="lazy" data-fb="${esc(f.name)}">
                ${km != null ? `<span class="dist"><i class='bx bx-map-pin'></i> ${km.toFixed(1)} km</span>` : ''}
                <button class="follow fav${on ? ' active' : ''}" data-fav-farm="${f.id}" aria-label="Follow ${esc(f.name)}"><i class='bx ${on ? 'bxs-heart' : 'bx-heart'}'></i></button></div>
            <div class="farm-body">
                <h3>${esc(f.name)} <i class='bx bxs-badge-check' title="Verified"></i></h3>
                <span class="where"><i class='bx bx-map'></i> ${esc(f.area)} · ${crops} crops listed</span>
                <div class="spec">${f.specialty.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
                <div class="farm-foot"><span class="stars"><i class='bx bxs-star'></i> ${f.rating} <small>(${f.reviews})</small></span>
                    <span style="display:flex;gap:8px"><a class="btn btn-soft btn-sm" href="map.html?farm=${f.id}"><i class='bx bx-map-alt'></i> Map</a><a class="btn btn-primary btn-sm" href="marketplace.html?farm=${f.id}">Crops</a></span></div>
            </div></article>`;
    };


    /* the paper receipt used by basket and checkout */
    ML.receiptHTML = function (o) {
        o = o || {};
        const items = ML.cart.items();
        const disc = ML.cart.discount();
        const promo = ML.cart.promo();
        return `<div class="receipt">
            <h3>${esc(o.title || 'Basket receipt')}</h3>
            <div class="rc-sub">MarketLink · eGreen Basket</div>
            ${items.map(({ product: p, qty }) => `<div class="rc-row item"><span>${qty} × ${esc(p.name.replace(/\s*\(.*\)/, ''))}</span><span>${money(p.price * qty)}</span></div>`).join('')}
            <hr class="rc-sep">
            <div class="rc-row"><span>Subtotal</span><b>${money(ML.cart.subtotal())}</b></div>
            <div class="rc-row"><span>Pickup at hub</span><b>Free</b></div>
            ${disc ? `<div class="rc-row disc"><span>Promo ${esc(promo)}</span><b>− ${money(disc)}</b></div>` : ''}
            <hr class="rc-sep">
            <div class="rc-total"><span>Total</span><strong>${money(ML.cart.total())}</strong></div>
            ${o.promo ? (promo
                ? `<div class="promo-on"><i class='bx bxs-purchase-tag-alt'></i><span>${esc(ML.PROMOS[promo].label)}</span><button id="promoRemove" aria-label="Remove promo code"><i class='bx bx-x'></i></button></div>`
                : `<form class="promo" id="promoForm"><input id="promoInput" placeholder="Promo code" aria-label="Promo code" autocomplete="off"><button class="btn btn-soft" type="submit">Apply</button></form><p class="promo-hint">Try <button type="button" data-try="FRESH10">FRESH10</button> or <button type="button" data-try="HARVEST5">HARVEST5</button></p>`) : ''}
            ${o.note ? `<div class="rc-note"><i class='bx bx-time-five'></i><span>${o.note}</span></div>` : ''}
            ${o.cta ? `<div class="rc-cta">${o.cta}</div>` : ''}
            <div class="rc-barcode" aria-hidden="true"></div>
        </div>`;
    };
    ML.bindPromo = function (root, rerender) {
        const form = root.querySelector('#promoForm');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = root.querySelector('#promoInput').value;
            ML.api.promo.validate(v, ML.cart.subtotal()).then((r) => {
                if (r && r.valid && (!ML.remote || ML.cart.applyPromo(r.code || v))) { ML.toast('Promo applied: ' + ML.PROMOS[ML.cart.promo()].label, { icon: 'bxs-purchase-tag-alt' }); rerender(); }
                else throw new Error('invalid');
            }).catch(() => { form.classList.remove('bad'); void form.offsetWidth; form.classList.add('bad'); ML.toast('That code is not valid', { type: 'error' }); });
        });
        root.querySelectorAll('[data-try]').forEach((b) => b.addEventListener('click', () => { root.querySelector('#promoInput').value = b.dataset.try; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }));
        const rm = root.querySelector('#promoRemove');
        if (rm) rm.addEventListener('click', () => { ML.cart.clearPromo(); ML.toast('Promo removed', { icon: 'bx-x' }); rerender(); });
    };

    ML.quickView = function (id) {
        const p = ML.product(id);
        if (!p) return;
        const farm = ML.farm(p.farm);
        let qty = 1;
        const m = ML.modal({
            title: '', size: 'lg',
            html: `<div class="qv">
                <div class="qv-media"><img src="${esc(p.img)}" alt="${esc(p.name)}" data-fb="${esc(p.name)}">${p.tag ? `<span class="stamp">${esc(p.tag)}</span>` : ''}</div>
                <div class="qv-info">
                    <button class="modal-x qv-x" data-x aria-label="Close"><i class='bx bx-x'></i></button>
                    <a class="pcard-farm" href="map.html?farm=${farm.id}"><i class='bx bxs-badge-check'></i> ${esc(farm.name)} · ${esc(farm.area)}</a>
                    <h3>${esc(p.name)}</h3>
                    <div class="stars">${ML.stars(p.rating)}<small>${p.rating.toFixed(1)} · ${p.reviews} reviews</small></div>
                    <p class="qv-desc">${esc(p.desc)}</p>
                    <div class="tag-price"><b>${money(p.price)}</b><small>/ ${esc(p.unit)}</small></div>
                    <div class="qv-row">
                        <div class="qty" id="qvQty"><button aria-label="Less" data-d="-1"><i class='bx bx-minus'></i></button><span>1</span><button aria-label="More" data-d="1"><i class='bx bx-plus'></i></button></div>
                        <button class="btn btn-primary" id="qvAdd"${p.stock === 0 ? ' disabled' : ''}><i class='bx bx-basket'></i> Add to basket</button>
                    </div>
                    <div class="qv-links"><a class="link" href="product.html?id=${p.id}">Full details <i class='bx bx-right-arrow-alt'></i></a>
                    <button class="link" data-fav="${p.id}"><i class='bx ${ML.favs.has(p.id) ? 'bxs-heart' : 'bx-heart'}'></i> Save</button></div>
                </div></div>`
        });
        m.el.querySelector('.modal').style.width = 'min(860px,100%)';
        const q = $('#qvQty', m.el);
        q.addEventListener('click', (e) => {
            const b = e.target.closest('[data-d]');
            if (!b) return;
            qty = Math.max(1, Math.min(p.stock, qty + Number(b.dataset.d)));
            $('span', q).textContent = qty;
        });
        $('#qvAdd', m.el).addEventListener('click', (e) => { ML.addToCart(p.id, qty, e.currentTarget); m.close(); });
        return m;
    };

    /* ============================================================
       BASKET ACTIONS
       ============================================================ */
    ML.flyToCart = function (srcEl) {
        if (!srcEl || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
        const target = $$('[data-cart-open]').find((el) => el.offsetParent !== null);
        if (!target) return;
        const card = srcEl.closest('.pcard, .pdp, .qv, .rec, .chat-prod');
        const img = card && card.querySelector('img');
        const a = (img || srcEl).getBoundingClientRect();
        const b = target.getBoundingClientRect();
        if (!a.width) return;
        const el = document.createElement(img ? 'img' : 'div');
        el.className = 'fly';
        if (img) el.src = img.src; else el.style.background = 'var(--color-secondary)';
        const size = 84;
        Object.assign(el.style, { left: a.left + a.width / 2 - size / 2 + 'px', top: a.top + a.height / 2 - size / 2 + 'px', width: size + 'px', height: size + 'px' });
        document.body.appendChild(el);
        const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
        if (!el.animate) { el.remove(); return; }
        const anim = el.animate([
            { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
            { transform: `translate(${dx * 0.55}px,${dy * 0.55 - 90}px) scale(.7) rotate(120deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${dx}px,${dy}px) scale(.12) rotate(300deg)`, opacity: .4 }
        ], { duration: 780, easing: 'cubic-bezier(.5,.05,.6,.9)' });
        anim.onfinish = () => { el.remove(); target.classList.remove('bump'); void target.offsetWidth; target.classList.add('bump'); };
    };

    ML.addToCart = function (id, qty, srcEl) {
        const p = ML.product(id);
        const res = ML.cart.add(id, qty || 1);
        if (!res.ok) {
            ML.toast(res.reason === 'stock' ? `Only ${res.max} of ${p.name} available` : 'That item is no longer available', { type: 'warn' });
            return res;
        }
        ML.flyToCart(srcEl);
        ML.toast(`${p.name} added`, { icon: 'bx-basket', action: { label: 'View basket', fn: () => ML.openCart() } });
        if (srcEl && srcEl.classList && srcEl.classList.contains('add')) {
            srcEl.classList.add('added');
            const ic = $('i', srcEl), tx = $('span', srcEl);
            if (ic) ic.className = 'bx bx-check';
            if (tx) tx.textContent = 'Added';
            setTimeout(() => { srcEl.classList.remove('added'); if (ic) ic.className = 'bx bx-plus'; if (tx) tx.textContent = 'Add'; }, 1400);
        }
        return res;
    };

    /* ---------- drawer ---------- */
    const drawer = $('#drawer'), scrim = $('#scrim');
    ML.openCart = function () { renderDrawer(); drawer.classList.add('open'); scrim.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); };
    ML.closeCart = function () { drawer.classList.remove('open'); scrim.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); };

    function renderDrawer() {
        const items = ML.cart.items();
        const n = ML.cart.count();
        $('#drawerPill').textContent = n + (n === 1 ? ' item' : ' items');
        const bodyEl = $('#drawerBody'), foot = $('#drawerFoot');
        if (!items.length) {
            bodyEl.innerHTML = `<div class="empty"><div class="art"><i class='bx bx-basket'></i></div><h3>Basket is empty</h3><p>Fresh harvests are waiting. Reserve some before the next lock.</p><a class="btn btn-primary" href="marketplace.html">Browse the market</a></div>`;
            foot.style.display = 'none';
            return;
        }
        foot.style.display = '';
        bodyEl.innerHTML = items.map(({ product: p, qty }, i) => `
            <div class="drawer-line" style="animation-delay:${i * 50}ms">
                <a href="product.html?id=${p.id}"><img src="${esc(p.img)}" alt="" data-fb="${esc(p.name)}"></a>
                <div><h4>${esc(p.name)}</h4><small>${money(p.price)} / ${esc(p.unit)}</small>
                    <div class="qty sm" data-line="${p.id}"><button data-d="-1" aria-label="Less"><i class='bx bx-minus'></i></button><span>${qty}</span><button data-d="1" aria-label="More"><i class='bx bx-plus'></i></button></div></div>
                <div class="lp">${money(p.price * qty)}<button data-remove="${p.id}" aria-label="Remove ${esc(p.name)}"><i class='bx bx-trash'></i></button></div>
            </div>`).join('');
        const slot = ML.nextSlots(ML.prefs.get().hub, 1)[0];
        foot.innerHTML = `
            <div class="drawer-lock"><i class='bx bx-time-five'></i> ${slot ? 'Harvest locks ' + esc(ML.fmtDate(slot.lock)) + ' at 6 PM for ' + esc(slot.label) + ' pickup' : 'Choose a pickup hub at checkout'}</div>
            ${ML.cart.discount() ? `<div class="row"><span class="muted">Promo ${esc(ML.cart.promo())}</span><b style="color:var(--color-primary)">− ${money(ML.cart.discount())}</b></div>` : ''}
            <div class="row"><span>Basket total</span><strong>${money(ML.cart.total())}</strong></div>
            <div class="foot-actions"><a class="btn btn-ghost" href="cart.html">View basket</a><a class="btn btn-primary" href="checkout.html">Checkout <i class='bx bx-right-arrow-alt go'></i></a></div>`;
    }
    drawer.addEventListener('click', (e) => {
        const line = e.target.closest('[data-line]');
        const step = e.target.closest('[data-d]');
        if (line && step) { const id = line.dataset.line; ML.cart.setQty(id, ML.cart.qty(id) + Number(step.dataset.d)); return; }
        const rm = e.target.closest('[data-remove]');
        if (rm) {
            const id = rm.dataset.remove, q = ML.cart.qty(id), p = ML.product(id);
            ML.cart.remove(id);
            ML.toast(p.name + ' removed', { icon: 'bx-trash', action: { label: 'Undo', fn: () => ML.cart.add(id, q) } });
        }
        if (e.target.closest('a')) ML.closeCart();
    });
    scrim.addEventListener('click', ML.closeCart);

    /* ============================================================
       GLOBAL DELEGATED CLICKS
       ============================================================ */
    document.addEventListener('click', (e) => {
        const t = e.target;
        let el;
        if ((el = t.closest('[data-add]'))) { e.preventDefault(); ML.addToCart(el.dataset.add, Number(el.dataset.qty) || 1, el); return; }
        if ((el = t.closest('[data-fav]'))) {
            e.preventDefault(); e.stopPropagation();
            const on = ML.favs.toggle(el.dataset.fav);
            ML.toast(on ? 'Saved to favorites' : 'Removed from favorites', { icon: on ? 'bxs-heart' : 'bx-heart' });
            return;
        }
        if ((el = t.closest('[data-fav-farm]'))) {
            e.preventDefault(); e.stopPropagation();
            const on = ML.favFarms.toggle(el.dataset.favFarm);
            ML.toast(on ? 'Farm followed' : 'Farm unfollowed', { icon: on ? 'bxs-heart' : 'bx-heart' });
            return;
        }
        if ((el = t.closest('[data-quick]'))) { e.preventDefault(); ML.quickView(el.dataset.quick); return; }
        if (t.closest('[data-cart-open]')) { e.preventDefault(); ML.openCart(); return; }
        if (t.closest('[data-cart-close]')) { ML.closeCart(); return; }
        if (t.closest('[data-hub-picker]')) { e.preventDefault(); ML.hubPicker(); return; }
        if (t.closest('[data-theme-toggle]')) { ML.theme.toggle(); return; }
        if (t.closest('[data-signout]')) { e.preventDefault(); ML.api.auth.signOut().then(() => { ML.flash('Signed out. See you at the next harvest.', { icon: 'bx-log-out' }); location.href = 'auth.html'; }); return; }
        if ((el = t.closest('[data-copy]'))) {
            const txt = el.dataset.copy;
            (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => ML.toast('Copied to clipboard', { icon: 'bx-copy' })).catch(() => ML.toast('Copy failed. Select and copy manually.', { type: 'warn' }));
            return;
        }
        if (!t.closest('.has-dd')) closeDropdowns();
        if (!t.closest('.search')) hideSuggest();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { ML.closeCart(); closeDropdowns(); closeDock(); hideSuggest(); }
        if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
            e.preventDefault(); $('#searchInput').focus();
        }
    });

    /* ---------- dock behaviour ---------- */
    const dock = $('#dock'), dockOverlay = $('#dockOverlay');
    function openDock() { dock.classList.add('open'); dockOverlay.classList.add('show'); }
    function closeDock() { dock.classList.remove('open'); dockOverlay.classList.remove('show'); }
    $('#menuBtn').addEventListener('click', openDock);
    $('#tabMenu').addEventListener('click', openDock);
    $('#dockClose').addEventListener('click', closeDock);
    dockOverlay.addEventListener('click', closeDock);
    $('#dockCollapse').addEventListener('click', () => {
        const c = body.classList.toggle('dock-collapsed');
        try { localStorage.setItem('marketlink_c_dock', c ? '1' : '0'); } catch (e) { /* ignore */ }
        setTimeout(() => window.dispatchEvent(new Event('resize')), 450);
    });
    $$('.dock-link').forEach((a) => a.addEventListener('click', closeDock));

    /* ---------- dropdowns ---------- */
    function closeDropdowns() { $$('.dropdown').forEach((d) => d.remove()); }
    function openDropdown(wrap, html, cls) {
        const had = $('.dropdown', wrap);
        closeDropdowns();
        if (had) return null;
        const d = document.createElement('div');
        d.className = 'dropdown ' + (cls || '');
        d.innerHTML = html;
        wrap.appendChild(d);
        return d;
    }

    function renderNotifDD() {
        const list = ML.notifs.all().slice(0, 4);
        return `<h4>Notifications <button data-mark-all>Mark all read</button></h4>
            ${list.length ? list.map((n) => `<a class="dd-item${n.read ? '' : ' unread'}" href="${esc(n.link || 'notifications.html')}" data-nid="${n.id}"><span class="ic"><i class='bx ${esc(n.icon)}'></i></span><span><b>${esc(n.title)}</b><small>${esc(n.text.slice(0, 70))}${n.text.length > 70 ? '…' : ''}</small><small>${ML.ago(n.at)}</small></span></a>`).join('') : '<div class="dd-empty"><i class="bx bx-bell-off" style="font-size:30px"></i><br>You are all caught up</div>'}
            <a class="dd-foot" href="notifications.html">View all notifications</a>`;
    }
    $('#bellBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!ML.auth.isIn()) { location.href = 'auth.html?next=notifications.html'; return; }
        const d = openDropdown($('#bellWrap'), renderNotifDD());
        if (d) d.addEventListener('click', (ev) => {
            const nid = ev.target.closest('[data-nid]');
            if (nid) ML.notifs.markRead(nid.dataset.nid);
            if (ev.target.closest('[data-mark-all]')) { ML.notifs.markAll(); d.innerHTML = renderNotifDD(); }
        });
    });

    function renderUser() {
        const u = ML.auth.user();
        const wrap = $('#userWrap');
        $('#dockUser').innerHTML = u
            ? `<a class="dock-user" href="profile.html">${ML.avatarHTML(u)}<div class="dock-user-info"><b>${esc(u.name)}</b><span><i class='bx bxs-badge-check'></i> Customer${u.area ? ' · ' + esc(u.area.split(',')[0]) : ''}</span></div></a>`
            : `<a class="dock-user" href="auth.html"><span class="avatar"><i class='bx bx-user'></i></span><div class="dock-user-info"><b>Welcome, guest</b><span>Sign in or join free <i class='bx bx-right-arrow-alt'></i></span></div></a>`;
        wrap.innerHTML = u
            ? `<button class="avatar-btn" id="avatarBtn" aria-label="Account menu" aria-haspopup="true">${ML.avatarHTML(u)}</button>`
            : `<a class="btn btn-primary btn-sm" href="auth.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}">Sign in</a>`;
        const ab = $('#avatarBtn');
        if (ab) ab.addEventListener('click', (e) => {
            e.stopPropagation();
            const cur = ML.auth.user();
            openDropdown(wrap, `<div class="dd-head-user">${ML.avatarHTML(cur)}<div><b>${esc(cur.name)}</b><br><small>${esc(cur.email)}</small></div></div><div class="dd-sep"></div>
                <a class="dd-item" href="profile.html"><span class="ic"><i class='bx bx-user'></i></span><span><b>Profile</b></span></a>
                <a class="dd-item" href="orders.html"><span class="ic"><i class='bx bx-receipt'></i></span><span><b>My orders</b></span></a>
                <a class="dd-item" href="favorites.html"><span class="ic"><i class='bx bx-heart'></i></span><span><b>Favorites</b></span></a>
                <a class="dd-item" href="settings.html"><span class="ic"><i class='bx bx-cog'></i></span><span><b>Settings</b></span></a>
                <div class="dd-sep"></div>
                <button class="dd-item danger" data-signout><span class="ic"><i class='bx bx-log-out'></i></span><span><b>Sign out</b></span></button>`, 'narrow');
        });
    }

    /* ---------- search + suggestions ---------- */
    const searchInput = $('#searchInput'), suggest = $('#suggest');
    if (ML.query.get('q') && pageId === 'marketplace') searchInput.value = ML.query.get('q');
    function hideSuggest() { suggest.hidden = true; }
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 1 || pageId === 'marketplace') return hideSuggest();
        const hits = ML.PRODUCTS.filter((p) => (p.name + ' ' + ML.farm(p.farm).name + ' ' + (ML.category(p.cat) || {}).name).toLowerCase().includes(q)).slice(0, 5);
        suggest.innerHTML = hits.length
            ? hits.map((p) => `<a href="product.html?id=${p.id}"><img src="${esc(p.img)}" alt="" data-fb="${esc(p.name)}"><span><b>${esc(p.name)}</b><small>${esc(ML.farm(p.farm).name)} · ${money(p.price)} / ${esc(p.unit)}</small></span></a>`).join('') + `<a class="all" href="marketplace.html?q=${encodeURIComponent(q)}">See all results for “${esc(q)}”</a>`
            : `<div class="none">No matches for “${esc(q)}” yet.</div><a class="all" href="chatbot.html?ask=${encodeURIComponent('Do you have ' + q + '?')}">Ask eGreen Assistant</a>`;
        suggest.hidden = false;
    });
    searchInput.addEventListener('keydown', (e) => {
        if (suggest.hidden) return;
        const items = $$('a', suggest);
        let idx = items.findIndex((a) => a.classList.contains('hl'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx >= 0) items[idx].classList.remove('hl');
            idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
            items[idx].classList.add('hl');
        } else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); location.href = items[idx].getAttribute('href'); }
    });
    searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) searchInput.dispatchEvent(new Event('input')); });

    /* ============================================================
       LIVE BADGES / STATE SYNC
       ============================================================ */
    function syncBadges() {
        const vals = { cart: ML.cart.count(), notifs: ML.auth.isIn() ? ML.notifs.unread() : 0 };
        $$('[data-badge]').forEach((b) => {
            const v = vals[b.dataset.badge] || 0;
            if (b.textContent !== String(v)) b.textContent = v;
            b.dataset.zero = v ? '0' : '1';
        });
        $$('[data-cart-count]').forEach((b) => { b.textContent = vals.cart; });
    }
    function syncFavs() {
        $$('[data-fav]').forEach((b) => {
            const on = ML.favs.has(b.dataset.fav);
            b.classList.toggle('active', on);
            const ic = $('i', b);
            if (ic) ic.className = 'bx ' + (on ? 'bxs-heart' : 'bx-heart');
        });
        $$('[data-fav-farm]').forEach((b) => {
            const on = ML.favFarms.has(b.dataset.favFarm);
            b.classList.toggle('active', on);
            const ic = $('i', b);
            if (ic) ic.className = 'bx ' + (on ? 'bxs-heart' : 'bx-heart');
            const tx = $('span', b);
            if (tx && b.dataset.label) tx.textContent = on ? 'Following' : 'Follow';
        });
    }
    function syncHub() {
        const h = ML.hub(ML.prefs.get().hub) || ML.HUBS[0];
        $('#hubName').textContent = h.short;
    }
    function syncTheme() { $('#themeIcon').className = 'bx ' + (ML.theme.resolved() === 'dark' ? 'bx-moon' : 'bx-sun'); }
    function tickLock() {
        const s = ML.nextSlots(ML.prefs.get().hub, 1)[0];
        const el = $('#lockClock');
        if (!s) { el.textContent = 'Next week'; return; }
        const ms = s.lock - Date.now();
        const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
        el.textContent = (d ? d + 'd ' : '') + h + 'h ' + ML.pad(m) + 'm';
    }
    ML.lockParts = function (hubId) {
        const s = ML.nextSlots(hubId || ML.prefs.get().hub, 1)[0];
        if (!s) return null;
        const ms = Math.max(0, s.lock - Date.now());
        return { d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4), s: Math.floor((ms % 6e4) / 1e3), slot: s };
    };

    document.addEventListener('ml:change', (e) => {
        const k = e.detail && e.detail.key;
        syncBadges();
        if (!k || k === 'cart' || k === 'promo' || k === '*') { if (drawer.classList.contains('open')) renderDrawer(); }
        if (!k || k === 'favs' || k === 'favfarms' || k === '*') syncFavs();
        if (!k || k === 'prefs' || k === '*') { syncHub(); tickLock(); }
        if (!k || k === 'user' || k === '*') renderUser();
        if ((k === 'user' || k === '*') && document.body.dataset.guard === 'auth' && !ML.auth.isIn()) location.replace('auth.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
        if (k === 'theme' || k === '*') syncTheme();
    });
    document.addEventListener('ml:rendered', () => { syncFavs(); syncBadges(); });

    /* ============================================================
       GLOBAL HELPERS FOR PAGES
       ============================================================ */
    /* ---------- init ---------- */
    renderUser(); syncBadges(); syncFavs(); syncHub(); syncTheme(); tickLock();
    setInterval(tickLock, 30000);
    ML.reveal();
})(window.ML);

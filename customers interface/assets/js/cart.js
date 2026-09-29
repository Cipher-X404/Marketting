/**
 * MARKETLINK CUSTOMERS — BASKET PAGE
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;

    function render() {
        const items = ML.cart.items();
        const n = ML.cart.count();
        const layout = $('#cartLayout');
        $('#clearCart').hidden = !items.length;
        $('#cartLead').textContent = items.length ? `${n} ${n === 1 ? 'item' : 'items'} from ${new Set(items.map((l) => l.product.farm)).size} farm${new Set(items.map((l) => l.product.farm)).size > 1 ? 's' : ''}. Review before the harvest locks.` : 'Nothing reserved yet.';

        if (!items.length) {
            layout.style.display = 'block';
            $('#lines').innerHTML = `<div class="empty"><div class="art"><i class='bx bx-basket'></i></div><h3>Your basket is empty</h3><p>Fresh harvests are waiting. Reserve something before the next lock and it is cut just for you.</p>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="marketplace.html">Browse the market</a>${ML.favs.list().length ? `<a class="btn btn-ghost" href="favorites.html"><i class='bx bx-heart'></i> From favorites</a>` : ''}</div></div>`;
            $('#summary').innerHTML = '';
            suggestions();
            return;
        }
        layout.style.display = '';
        $('#lines').innerHTML = items.map(({ product: p, qty }, i) => `
            <article class="line" data-id="${p.id}" style="animation:line-in .45s ${i * 60}ms var(--ease) both">
                <a href="product.html?id=${p.id}"><img src="${esc(p.img)}" alt="${esc(p.name)}" data-fb="${esc(p.name)}"></a>
                <div>
                    <a class="from" href="map.html?farm=${p.farm}"><i class='bx bxs-badge-check'></i> ${esc(ML.farm(p.farm).name)}</a>
                    <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
                    <div class="per">${money(p.price)} / ${esc(p.unit)}${p.stock <= 5 ? ` · <b style="color:var(--color-danger)">only ${p.stock} left</b>` : ''}</div>
                    <div class="line-ctrl">
                        <div class="qty" data-qty="${p.id}"><button data-d="-1" aria-label="Decrease ${esc(p.name)}"><i class='bx bx-minus'></i></button><span>${qty}</span><button data-d="1" aria-label="Increase ${esc(p.name)}"${qty >= p.stock ? ' disabled' : ''}><i class='bx bx-plus'></i></button></div>
                        <button class="mini" data-save="${p.id}"><i class='bx bx-heart'></i> Save for later</button>
                        <button class="mini rm" data-rm="${p.id}"><i class='bx bx-trash'></i> Remove</button>
                    </div>
                </div>
                <div class="line-total">${money(p.price * qty)}<small>${qty} × ${esc(p.unit)}</small></div>
            </article>`).join('');
        renderSummary();
        suggestions();
        document.dispatchEvent(new Event('ml:rendered'));
    }

    function renderSummary() {
        const s = ML.nextSlots(ML.prefs.get().hub, 1)[0];
        const box = $('#summary');
        box.innerHTML = ML.receiptHTML({
            title: 'Basket receipt', promo: true,
            note: s ? `Harvest locks ${esc(ML.fmtDate(s.lock))} at 6 PM. Cancel free until then.` : 'Pick a hub at checkout.',
            cta: `<a class="btn btn-primary btn-lg btn-block" href="checkout.html">Checkout <i class='bx bx-right-arrow-alt go'></i></a><a class="btn btn-ghost btn-block" href="marketplace.html" style="margin-top:10px"><i class='bx bx-plus'></i> Keep shopping</a>`
        });
        ML.bindPromo(box, renderSummary);
    }

    function suggestions() {
        const inCart = new Set(ML.cart.raw().map((l) => l.id));
        const cats = new Set(ML.cart.items().map((l) => l.product.cat));
        let list = ML.PRODUCTS.filter((p) => !inCart.has(p.id) && p.stock > 0);
        list.sort((a, b) => (cats.has(a.cat) ? 1 : 0) - (cats.has(b.cat) ? 1 : 0) || b.rating - a.rating);
        list = list.slice(0, 4);
        $('#suggest2').innerHTML = `<div class="sec-head reveal"><div><h2>Round it off</h2><p>Popular with shoppers who reserved the same crops.</p></div></div><div class="pgrid">${list.map((p, i) => ML.productCard(p, i)).join('')}</div>`;
        ML.reveal($('#suggest2'));
    }

    $('#lines').addEventListener('click', (e) => {
        const line = e.target.closest('.line');
        const step = e.target.closest('[data-qty] [data-d]');
        if (step) {
            const id = step.closest('[data-qty]').dataset.qty;
            const cur = ML.cart.qty(id);
            const p = ML.product(id);
            if (cur === 1 && step.dataset.d === '-1') return removeLine(id, line);
            if (step.dataset.d === '1' && cur >= p.stock) return ML.toast(`Only ${p.stock} available`, { type: 'warn' });
            ML.cart.setQty(id, cur + Number(step.dataset.d));
            return;
        }
        const rm = e.target.closest('[data-rm]');
        if (rm) return removeLine(rm.dataset.rm, line);
        const sv = e.target.closest('[data-save]');
        if (sv) {
            const id = sv.dataset.save, q = ML.cart.qty(id), p = ML.product(id);
            if (!ML.favs.has(id)) ML.favs.toggle(id);
            leave(line, () => ML.cart.remove(id));
            ML.toast(`${p.name} saved to favorites`, { icon: 'bxs-heart', action: { label: 'Undo', fn: () => ML.cart.add(id, q) } });
        }
    });
    function leave(line, done) { if (!line) return done(); line.classList.add('leaving'); setTimeout(done, 320); }
    function removeLine(id, line) {
        const q = ML.cart.qty(id), p = ML.product(id);
        leave(line, () => ML.cart.remove(id));
        ML.toast(p.name + ' removed', { icon: 'bx-trash', action: { label: 'Undo', fn: () => ML.cart.add(id, q) } });
    }

    $('#clearCart').addEventListener('click', async () => {
        const prev = ML.cart.raw();
        if (await ML.confirm({ title: 'Empty your basket?', message: 'All reserved items will be removed.', ok: 'Empty basket', danger: true })) {
            ML.cart.clear();
            ML.toast('Basket emptied', { icon: 'bx-trash', action: { label: 'Undo', fn: () => prev.forEach((l) => ML.cart.add(l.id, l.qty)) } });
        }
    });

    document.addEventListener('ml:change', (e) => { const k = e.detail && e.detail.key; if (k === 'cart' || k === '*') render(); });
    render();
});

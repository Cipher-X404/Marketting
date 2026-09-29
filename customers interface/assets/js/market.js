/**
 * MARKETLINK CUSTOMERS — MARKETPLACE
 * Search, category, farm, price and toggle filters with URL sync,
 * sorting, grid/list view and progressive "show more".
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;
    const PAGE = 9;
    const state = {
        q: (ML.query.get('q') || '').trim(),
        cat: ML.query.get('cat') || 'all',
        farms: (ML.query.get('farm') || '').split(',').filter(Boolean),
        max: Number(ML.query.get('max')) || 20000,
        organic: ML.query.get('organic') === '1',
        stock: ML.query.get('stock') === '1',
        rating: ML.query.get('rating') === '1',
        sort: ML.query.get('sort') || 'featured',
        list: (function () { try { return localStorage.getItem('marketlink_c_view') === 'list'; } catch (e) { return false; } })(),
        shown: PAGE
    };
    if (!ML.category(state.cat)) state.cat = 'all';

    /* ---------- static bits ---------- */
    $('#catRail').innerHTML = [{ id: 'all', name: 'Everything', icon: 'bx-grid-alt' }].concat(ML.CATEGORIES).map((c) => {
        const n = c.id === 'all' ? ML.PRODUCTS.length : ML.PRODUCTS.filter((p) => p.cat === c.id).length;
        return `<button class="chip" role="tab" data-cat="${c.id}"><i class='bx ${c.icon}'></i>${esc(c.name)} <span class="n">${n}</span></button>`;
    }).join('');
    $('#farmChecks').innerHTML = ML.FARMS.map((f) => `<label class="f-check"><input type="checkbox" value="${f.id}"><span class="box"></span>${esc(f.name)}<em>${ML.PRODUCTS.filter((p) => p.farm === f.id).length}</em></label>`).join('');

    /* ---------- sync UI from state ---------- */
    function paintControls() {
        $$('#catRail .chip').forEach((c) => { const on = c.dataset.cat === state.cat; c.classList.toggle('active', on); c.setAttribute('aria-selected', on); });
        $$('#farmChecks input').forEach((i) => { i.checked = state.farms.includes(i.value); });
        $('#price').value = state.max;
        $('#fOrganic').checked = state.organic; $('#fStock').checked = state.stock; $('#fRating').checked = state.rating;
        $('#sort').value = state.sort;
        $('#viewGrid').classList.toggle('on', !state.list); $('#viewList').classList.toggle('on', state.list);
        $('#viewGrid').setAttribute('aria-pressed', String(!state.list)); $('#viewList').setAttribute('aria-pressed', String(state.list));
        paintRange();
    }
    function paintRange() {
        const r = $('#price');
        r.style.setProperty('--pct', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
        $('#priceOut').textContent = Number(r.value) >= 20000 ? 'Any' : money(r.value);
    }

    /* ---------- filtering ---------- */
    function filtered() {
        const q = state.q.toLowerCase();
        let list = ML.PRODUCTS.filter((p) => {
            if (state.cat !== 'all' && p.cat !== state.cat) return false;
            if (state.farms.length && !state.farms.includes(p.farm)) return false;
            if (p.price > state.max) return false;
            if (state.organic && !p.organic) return false;
            if (state.stock && p.stock === 0) return false;
            if (state.rating && p.rating < 4.7) return false;
            if (q) {
                const hay = (p.name + ' ' + p.desc + ' ' + ML.farm(p.farm).name + ' ' + (ML.category(p.cat) || {}).name).toLowerCase();
                return q.split(/\s+/).every((w) => hay.includes(w));
            }
            return true;
        });
        const by = {
            featured: (a, b) => b.rating * Math.log(b.reviews + 2) - a.rating * Math.log(a.reviews + 2),
            newest: (a, b) => a.added - b.added,
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews
        };
        return list.sort(by[state.sort] || by.featured);
    }

    function activeTags() {
        const t = [];
        if (state.q) t.push(['q', `“${state.q}”`]);
        if (state.cat !== 'all') t.push(['cat', ML.category(state.cat).name]);
        state.farms.forEach((f) => t.push(['farm:' + f, ML.farm(f) ? ML.farm(f).name : f]));
        if (state.max < 20000) t.push(['max', 'Under ' + money(state.max)]);
        if (state.organic) t.push(['organic', 'Organic']);
        if (state.stock) t.push(['stock', 'In stock']);
        if (state.rating) t.push(['rating', '4.7★ +']);
        return t;
    }

    function syncUrl() {
        const p = new URLSearchParams();
        if (state.q) p.set('q', state.q);
        if (state.cat !== 'all') p.set('cat', state.cat);
        if (state.farms.length) p.set('farm', state.farms.join(','));
        if (state.max < 20000) p.set('max', state.max);
        if (state.organic) p.set('organic', '1');
        if (state.stock) p.set('stock', '1');
        if (state.rating) p.set('rating', '1');
        if (state.sort !== 'featured') p.set('sort', state.sort);
        const s = p.toString();
        history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
        const si = $('#searchInput');
        if (si && document.activeElement !== si) si.value = state.q;
    }

    /* ---------- render ---------- */
    function render(reset) {
        if (reset) state.shown = PAGE;
        const list = filtered();
        const tags = activeTags();
        const grid = $('#grid');
        grid.classList.toggle('list', state.list);

        const cat = state.cat !== 'all' ? ML.category(state.cat).name : 'produce';
        $('#resultCount').innerHTML = `${list.length} ${list.length === 1 ? 'item' : 'items'} <span>in ${esc(cat.toLowerCase())}</span>`;
        $('#mkLead').textContent = state.q ? `Showing matches for “${state.q}”.` : 'Straight from the farm. Reserve now, collect at your hub.';
        const fc = tags.filter((t) => t[0] !== 'q' && t[0] !== 'cat').length;
        $('#filterN').hidden = !fc; $('#filterN').textContent = fc;
        $('#activeTags').innerHTML = tags.map(([k, l]) => `<span class="tag-x">${esc(l)}<button data-untag="${esc(k)}" aria-label="Remove filter ${esc(l)}"><i class='bx bx-x'></i></button></span>`).join('') + (tags.length > 1 ? `<button class="link" data-clear style="font-size:13px">Clear all</button>` : '');

        if (!list.length) {
            grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="art"><i class='bx bx-search-alt'></i></div><h3>Nothing matches yet</h3><p>Try a broader search, or ask eGreen Assistant whether a farmer can grow it for you.</p>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" data-clear><i class='bx bx-reset'></i> Clear filters</button><a class="btn btn-ghost" href="chatbot.html?ask=${encodeURIComponent('Do you have ' + (state.q || 'something special') + '?')}"><i class='bx bx-bot'></i> Ask the assistant</a></div></div>`;
            $('#loadMore').hidden = true;
        } else {
            grid.innerHTML = list.slice(0, state.shown).map((p, i) => ML.productCard(p, i % 6)).join('');
            $('#loadMore').hidden = list.length <= state.shown;
            $('#loadMore').innerHTML = `<i class='bx bx-down-arrow-alt'></i> Show ${Math.min(PAGE, list.length - state.shown)} more`;
        }
        ML.reveal(grid);
        document.dispatchEvent(new Event('ml:rendered'));
        paintControls();
        syncUrl();
    }

    /* first paint with a brief skeleton so the page feels alive */
    $('#grid').innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton sk-card"></div>').join('');
    setTimeout(() => render(true), 320);

    /* ---------- events ---------- */
    $('#catRail').addEventListener('click', (e) => { const c = e.target.closest('[data-cat]'); if (!c) return; state.cat = c.dataset.cat; render(true); });
    $('#farmChecks').addEventListener('change', () => { state.farms = $$('#farmChecks input:checked').map((i) => i.value); render(true); });
    $('#price').addEventListener('input', () => { state.max = Number($('#price').value); paintRange(); });
    $('#price').addEventListener('change', () => render(true));
    $('#fOrganic').addEventListener('change', (e) => { state.organic = e.target.checked; render(true); });
    $('#fStock').addEventListener('change', (e) => { state.stock = e.target.checked; render(true); });
    $('#fRating').addEventListener('change', (e) => { state.rating = e.target.checked; render(true); });
    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(true); });
    $('#loadMore').addEventListener('click', () => { state.shown += PAGE; render(false); });
    const setView = (list) => { state.list = list; try { localStorage.setItem('marketlink_c_view', list ? 'list' : 'grid'); } catch (e) { /* ignore */ } render(false); };
    $('#viewGrid').addEventListener('click', () => setView(false));
    $('#viewList').addEventListener('click', () => setView(true));

    function reset() { Object.assign(state, { q: '', cat: 'all', farms: [], max: 20000, organic: false, stock: false, rating: false, sort: 'featured' }); $('#searchInput').value = ''; render(true); }
    $('#resetFilters').addEventListener('click', reset);
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-clear]')) return reset();
        const u = e.target.closest('[data-untag]');
        if (!u) return;
        const k = u.dataset.untag;
        if (k === 'q') { state.q = ''; $('#searchInput').value = ''; }
        else if (k === 'cat') state.cat = 'all';
        else if (k.startsWith('farm:')) state.farms = state.farms.filter((f) => f !== k.slice(5));
        else if (k === 'max') state.max = 20000;
        else state[k] = false;
        render(true);
    });

    /* header search box on this page filters live instead of reloading */
    $('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); state.q = $('#searchInput').value.trim(); $('#suggest').hidden = true; render(true); });
    let deb;
    $('#searchInput').addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(() => { state.q = $('#searchInput').value.trim(); render(true); }, 350); });

    /* mobile filter sheet */
    const openF = () => { $('#filters').classList.add('open'); $('#filtersScrim').classList.add('show'); };
    const closeF = () => { $('#filters').classList.remove('open'); $('#filtersScrim').classList.remove('show'); };
    $('#openFilters').addEventListener('click', openF);
    $('#closeFilters').addEventListener('click', closeF);
    $('#filtersScrim').addEventListener('click', closeF);
});

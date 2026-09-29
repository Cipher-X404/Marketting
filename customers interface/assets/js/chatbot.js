/**
 * MARKETLINK CUSTOMERS — eGreen Assistant
 * A small rule-based helper. Messages are stored as structured data and
 * rendered through escaping, never as raw HTML.
 */
ML.onReady(() => {
    const { $, esc, money } = ML;
    const KEY = 'chat';
    const TOPICS = [
        { icon: 'bx-receipt', t: 'Track my order', s: 'Status and pickup code', q: 'Where is my order?' },
        { icon: 'bx-store-alt', t: 'Pickup times & hubs', s: 'When and where to collect', q: 'When can I pick up?' },
        { icon: 'bx-wallet', t: 'Payments', s: 'Cash, transfer or card', q: 'How do I pay?' },
        { icon: 'bx-purchase-tag-alt', t: 'Promo codes', s: 'Save on your basket', q: 'Any promo codes?' },
        { icon: 'bx-leaf', t: 'How fresh is it?', s: 'The harvest lock explained', q: 'How does the harvest lock work?' },
        { icon: 'bx-x-circle', t: 'Cancel an order', s: 'Free until the lock', q: 'How do I cancel an order?' }
    ];
    const CHIPS = ['What is fresh this week?', 'Cheapest tomatoes', 'Do you deliver?', 'Sell on MarketLink'];

    const load = () => ML.store.get(KEY, []);
    const save = (l) => ML.store.set(KEY, l.slice(-60));
    const b = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    const cleanName = (n) => n.replace(/\s*\(.*\)/, '');
    const stLabel = (o) => (o.status === 'cancelled' ? 'Cancelled' : ML.STAGES.find((s) => s.id === o.status).label);
    const timeStr = (iso) => new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });

    /* ---------- knowledge ---------- */
    function searchProducts(text) {
        const t = text.toLowerCase();
        const words = t.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['the', 'and', 'any', 'you', 'have', 'sell', 'buy', 'want', 'get', 'for', 'with', 'what', 'fresh', 'this', 'week', 'cheapest', 'cheap', 'price', 'much', 'how', 'does', 'cost', 'under', 'some', 'are', 'there'].includes(w));
        const catHit = ML.CATEGORIES.find((c) => t.includes(c.name.toLowerCase().split(' ')[0]) && c.name.toLowerCase().split(' ')[0].length > 3);
        let list = ML.PRODUCTS.filter((p) => {
            const hay = (p.name + ' ' + p.cat + ' ' + ML.farm(p.farm).name).toLowerCase();
            return words.some((w) => hay.includes(w.replace(/s$/, '')));
        });
        if (!list.length && catHit) list = ML.PRODUCTS.filter((p) => p.cat === catHit.id);
        const under = /under\s*₦?\s*(\d[\d,]*)/.exec(t);
        if (under) list = (list.length ? list : ML.PRODUCTS).filter((p) => p.price <= Number(under[1].replace(/,/g, '')));
        if (/cheap|lowest|budget/.test(t)) list = list.slice().sort((a, b2) => a.price - b2.price);
        return list.slice(0, 3);
    }
    const hubLines = () => ML.HUBS.map((h) => { const s = ML.nextSlots(h.id, 1)[0]; return `**${h.short}**: ${ML.DAYS[h.day]}s, ${ML.windowLabel(h)}${s ? ` (next: ${s.label})` : ''}`; });

    function reply(text) {
        const t = text.toLowerCase();
        const user = ML.auth.user();
        const id = /ml-\d{3,5}/i.exec(text);
        if (id) {
            const o = ML.orders.get(id[0].toUpperCase());
            if (!user) return { t: 'Sign in first and I can look up your orders.', actions: [{ label: 'Sign in', href: 'auth.html?next=chatbot.html' }] };
            if (!o) return { t: `I could not find **${id[0].toUpperCase()}** on your account. Check the ID in your confirmation.`, actions: [{ label: 'My orders', href: 'orders.html' }] };
            const st = stLabel(o);
            return { t: `**${o.id}** is **${st}**. Collect at ${ML.hub(o.hub).name} on ${o.slot.label}, ${o.slot.window}. Pickup code: **${o.code}**.`, orders: [o.id], actions: [{ label: 'Track it', href: 'orders.html?id=' + o.id }] };
        }
        if (/hello|^hi\b|^hey|good (morning|afternoon|evening)/.test(t)) return { t: `Hello${user ? ' ' + user.name.split(' ')[0] : ''}! I can help with orders, pickups, payments and finding produce. What do you need?` };
        if (/thank/.test(t)) return { t: 'Any time! Enjoy the harvest. 🌱' };
        if (/(my|track|where|status).*(order|basket|pickup code)|order status|where is my/.test(t)) {
            if (!user) return { t: 'Sign in and I will pull up your baskets.', actions: [{ label: 'Sign in', href: 'auth.html?next=chatbot.html' }] };
            const act = ML.orders.all().filter(ML.orders.isActive);
            if (!act.length) return { t: 'You have no active orders right now. Ready to reserve something?', actions: [{ label: 'Browse the market', href: 'marketplace.html' }] };
            return { t: `You have **${act.length}** active ${act.length > 1 ? 'orders' : 'order'}:`, orders: act.map((o) => o.id), actions: [{ label: 'All orders', href: 'orders.html' }] };
        }
        if (/cancel/.test(t)) return { t: 'You can cancel **free** until the harvest lock at **6 PM the evening before pickup**, while the order is still Reserved. After that the farmer has started cutting, so it cannot be cancelled.', actions: [{ label: 'Go to my orders', href: 'orders.html' }] };
        if (/refund|rotten|bad|damag|complain|wrong|missing|problem|issue/.test(t)) return { t: 'I am sorry about that. Inspect your basket at the hub before you leave and tell the hub host straight away, they can swap or refund on the spot. You can also rate the order so the farm sees your feedback.', actions: [{ label: 'Rate an order', href: 'orders.html?tab=collected' }] };
        if (/deliver|ship|courier|dispatch/.test(t)) return { t: 'We do **pickup only**. Your basket is packed and chilled at a community hub near you. That keeps prices fair and produce fresher, with no delivery fees.', actions: [{ label: 'Find a hub', href: 'map.html' }] };
        if (/pick ?up|hub|collect|opening|what time|when can/.test(t)) return { t: 'Pickup windows by hub:', list: hubLines(), actions: [{ label: 'Open the map', href: 'map.html' }, { label: 'Choose my hub', href: 'settings.html#hub' }] };
        if (/pay|card|transfer|cash|naira|price of delivery/.test(t) && !/tomato|pepper|yam/.test(t)) return { t: 'You can **pay at pickup** (cash or transfer at the hub), by **bank transfer** to MarketLink Escrow, or with a **debit card**. Reserving never charges you upfront, and farmers are paid only after you collect.', actions: [{ label: 'Go to basket', href: 'cart.html' }] };
        if (/promo|coupon|discount|voucher|offer|code|save/.test(t)) return { t: 'Active codes:', list: Object.keys(ML.PROMOS).map((k) => `**${k}**: ${ML.PROMOS[k].label}`), actions: [{ label: 'Apply in basket', href: 'cart.html' }] };
        if (/lock|harvest|fresh|how long|cut/.test(t) && !/tomato|pepper|yam|ugu|this week|in season/.test(t)) return { t: 'Farms only cut what has been reserved. Each pickup has a **harvest lock at 6 PM the day before**. After the lock the farmer harvests, packs and delivers to your hub. That is why greens often reach you within hours of being cut.', actions: [{ label: 'See the next pickup', href: 'home.html' }] };
        if (/sell|become a farmer|grow|farmer portal|my farm|list my/.test(t)) return { t: 'Farmers list crops, manage pickup slots and track sales in the **Farmers portal**.', actions: [{ label: 'Open Farmers portal', href: '../farmers%20interface/auth.html' }] };
        if (/farm|grower/.test(t) && !/tomato|pepper/.test(t)) return { t: 'Our partner farms right now:', list: ML.FARMS.map((f) => `**${f.name}**, ${f.area} (${f.rating}★)`), actions: [{ label: 'Meet them on the map', href: 'map.html' }] };
        if (/password|profile|account|email|phone|sign ?out|log ?out|settings|theme|dark/.test(t)) return { t: 'You can change your details in Profile and your preferences (hub, notifications, theme) in Settings.', actions: [{ label: 'Profile', href: 'profile.html' }, { label: 'Settings', href: 'settings.html' }] };
        if (/fresh this week|in season|new|arrivals|popular|best/.test(t)) {
            const list = ML.PRODUCTS.slice().sort((a, b2) => a.added - b2.added).slice(0, 3);
            return { t: 'Newest on the market this week:', products: list.map((p) => p.id), actions: [{ label: 'See everything', href: 'marketplace.html' }] };
        }
        const found = searchProducts(text);
        if (found.length) return { t: `Here ${found.length > 1 ? 'are ' + found.length + ' matches' : 'is a match'}:`, products: found.map((p) => p.id), actions: [{ label: 'Search the market', href: 'marketplace.html?q=' + encodeURIComponent(text.slice(0, 40)) }] };
        return { t: 'I am not sure I got that. I can help with **orders**, **pickup times**, **payments**, **promo codes** and **finding produce**. Try one of the topics on the left.', actions: [{ label: 'Browse the market', href: 'marketplace.html' }] };
    }

    /* ---------- render ---------- */
    function bubble(m) {
        const bot = m.r === 'bot';
        const u = ML.auth.user();
        const av = bot ? `<i class='bx bxs-leaf'></i>` : esc(u ? ML.initials(u.name) : 'You');
        let html = m.r === 'user' ? `<p>${esc(m.t)}</p>` : `<p>${b(m.t)}</p>`;
        if (m.list) html += `<ul>${m.list.map((l) => `<li>${b(l)}</li>`).join('')}</ul>`;
        if (m.products) html += `<div class="b-cards">${m.products.map((id) => ML.product(id)).filter(Boolean).map((p) => `<div class="b-card"><a href="product.html?id=${p.id}"><img src="${esc(p.img)}" alt="" data-fb="${esc(p.name)}"></a><a href="product.html?id=${p.id}"><b>${esc(cleanName(p.name))}</b><small>${money(p.price)} / ${esc(p.unit)} · ${esc(ML.farm(p.farm).name)}</small></a><button class="btn btn-primary btn-sm" data-add="${p.id}" aria-label="Add ${esc(p.name)} to basket"><i class='bx bx-plus'></i></button></div>`).join('')}</div>`;
        if (m.orders) html += `<div class="b-cards">${m.orders.map((id) => ML.orders.get(id)).filter(Boolean).map((o) => `<div class="b-card"><a href="orders.html?id=${esc(o.id)}"><img src="${esc(o.items[0].img)}" alt="" data-fb="${esc(o.items[0].name)}"></a><a href="orders.html?id=${esc(o.id)}"><b>${esc(o.id)} · ${esc(stLabel(o))}</b><small>${esc(o.slot.label)} · ${esc(ML.hub(o.hub).short)} · ${money(o.total)}</small></a><a class="btn btn-soft btn-sm" href="orders.html?id=${esc(o.id)}">Track</a></div>`).join('')}</div>`;
        if (m.actions) html += `<div class="b-actions">${m.actions.map((a) => `<a href="${esc(a.href)}">${esc(a.label)} <i class='bx bx-right-arrow-alt'></i></a>`).join('')}</div>`;
        return `<div class="msg ${bot ? 'bot' : 'user'}"><span class="av">${av}</span><div class="bubble">${html}<time>${timeStr(m.at)}</time></div></div>`;
    }
    function scrollDown() { const f = $('#feed'); f.scrollTop = f.scrollHeight; }
    function renderAll() {
        const list = load();
        if (!list.length) { list.push({ r: 'bot', at: new Date().toISOString(), t: `Hi${ML.auth.user() ? ' ' + ML.auth.user().name.split(' ')[0] : ''}! I am the **eGreen Assistant**. Ask me about your order, pickup times, payments or what is fresh right now.` }); save(list); }
        $('#feed').innerHTML = list.map(bubble).join('');
        scrollDown();
        document.dispatchEvent(new Event('ml:rendered'));
    }
    function push(m) { const l = load(); l.push(m); save(l); $('#feed').insertAdjacentHTML('beforeend', bubble(m)); scrollDown(); }

    let busy = false;
    function ask(text) {
        text = String(text || '').trim().slice(0, 300);
        if (!text || busy) return;
        busy = true;
        push({ r: 'user', t: text, at: new Date().toISOString() });
        const typing = document.createElement('div');
        typing.className = 'msg bot';
        typing.innerHTML = `<span class="av"><i class='bx bxs-leaf'></i></span><div class="bubble typing"><i></i><i></i><i></i></div>`;
        $('#feed').appendChild(typing); scrollDown();
        setTimeout(() => {
            typing.remove();
            push(Object.assign({ r: 'bot', at: new Date().toISOString() }, reply(text)));
            busy = false;
        }, 550 + Math.random() * 500);
    }

    /* ---------- wire up ---------- */
    $('#topics').innerHTML = TOPICS.map((x) => `<button class="topic" data-q="${esc(x.q)}"><i class='bx ${x.icon}'></i><span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span></button>`).join('');
    $('#chips').innerHTML = CHIPS.map((c) => `<button data-q="${esc(c)}">${esc(c)}</button>`).join('');
    document.addEventListener('click', (e) => { const q = e.target.closest('[data-q]'); if (q) ask(q.dataset.q); });
    $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#chatInput'); ask(i.value); i.value = ''; i.focus(); });
    $('#chatClear').addEventListener('click', async () => {
        if (await ML.confirm({ title: 'Clear conversation?', message: 'This removes the chat history from this device.', ok: 'Clear', danger: true })) { ML.store.remove(KEY); renderAll(); ML.toast('Conversation cleared', { icon: 'bx-trash' }); }
    });
    document.addEventListener('ml:change', (e) => { if (e.detail && e.detail.key === 'user') renderAll(); });

    renderAll();
    const pre = ML.query.get('ask');
    if (pre) { history.replaceState(null, '', 'chatbot.html'); setTimeout(() => ask(pre), 400); }
});

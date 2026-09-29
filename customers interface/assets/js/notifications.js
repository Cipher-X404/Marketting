/**
 * MARKETLINK CUSTOMERS — NOTIFICATIONS
 */
ML.onReady(() => {
    const { $, $$, esc } = ML;
    let tab = 'all';

    const dayKey = (iso) => {
        const d = new Date(iso), t = new Date();
        const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()), b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        const diff = Math.round((b - a) / 864e5);
        return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff < 7 ? 'This week' : 'Earlier';
    };
    const LABEL = { orders: 'View order', pickup: 'See pickup details', offers: 'Shop the offer', system: 'Open' };

    function render() {
        const all = ML.notifs.all();
        const unread = all.filter((n) => !n.read).length;
        $('#nLead').textContent = unread ? `You have ${unread} unread ${unread === 1 ? 'message' : 'messages'}.` : all.length ? 'You are all caught up.' : 'Order updates, pickup reminders and news from your farms.';
        $('#markAll').disabled = !unread;
        $('#clearAll').disabled = !all.length;
        $$('#nTabs .tab-btn').forEach((b) => {
            b.classList.toggle('active', b.dataset.tab === tab);
            const n = b.querySelector('.n'); if (n) n.textContent = all.length;
        });
        const list = tab === 'all' ? all : all.filter((n) => n.type === tab);
        const box = $('#nList');
        if (!list.length) {
            box.innerHTML = `<div class="empty"><div class="art"><i class='bx bx-bell-off'></i></div><h3>${all.length ? 'Nothing in this filter' : 'No notifications'}</h3><p>${all.length ? 'Try another tab to see the rest.' : 'Reserve a basket and we will keep you posted at every step.'}</p>${all.length ? '' : `<a class="btn btn-primary" href="marketplace.html">Browse the market</a>`}</div>`;
            return;
        }
        let last = '', i = 0;
        box.innerHTML = list.map((n) => {
            const g = dayKey(n.at);
            const head = g !== last ? `<div class="n-day">${g}</div>` : '';
            last = g;
            return `${head}<article class="n-item${n.read ? '' : ' unread'}" data-id="${esc(n.id)}" data-type="${esc(n.type)}" data-link="${esc(n.link || '')}" tabindex="0" role="link" style="--i:${i++}">
                <div class="n-ic"><i class='bx ${esc(n.icon)}'></i></div>
                <div class="n-body"><h3>${!n.read ? '<span class="dot" aria-label="Unread"></span>' : ''}${esc(n.title)}</h3><p>${esc(n.text)}</p><time datetime="${esc(n.at)}">${ML.ago(n.at)}</time>${n.link ? `<div class="go-link">${LABEL[n.type] || 'Open'} <i class='bx bx-right-arrow-alt'></i></div>` : ''}</div>
                <div class="n-tools"><button data-toggle="${esc(n.id)}" aria-label="${n.read ? 'Mark as unread' : 'Mark as read'}" title="${n.read ? 'Mark unread' : 'Mark read'}"><i class='bx ${n.read ? 'bx-envelope' : 'bx-envelope-open'}'></i></button><button class="del" data-del="${esc(n.id)}" aria-label="Delete notification" title="Delete"><i class='bx bx-trash'></i></button></div>
            </article>`;
        }).join('');
        document.dispatchEvent(new Event('ml:rendered'));
    }

    function open(item) {
        const id = item.dataset.id, link = item.dataset.link;
        ML.notifs.markRead(id);
        if (link) location.href = link;
    }

    $('#nTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#nList').addEventListener('click', (e) => {
        const t = e.target.closest('[data-toggle]'), d = e.target.closest('[data-del]');
        if (t) { const n = ML.notifs.all().find((x) => x.id === t.dataset.toggle); n.read ? ML.notifs.markUnread(n.id) : ML.notifs.markRead(n.id); return; }
        if (d) {
            const n = ML.notifs.all().find((x) => x.id === d.dataset.del);
            const item = d.closest('.n-item'); item.classList.add('leaving');
            setTimeout(() => { ML.notifs.remove(n.id); ML.toast('Notification deleted', { icon: 'bx-trash', action: { label: 'Undo', fn: () => ML.notifs.add(n) } }); }, 300);
            return;
        }
        const item = e.target.closest('.n-item');
        if (item) open(item);
    });
    $('#nList').addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('n-item')) { e.preventDefault(); open(e.target); } });
    $('#markAll').addEventListener('click', () => { ML.notifs.markAll(); ML.toast('All caught up', { icon: 'bx-check-double' }); });
    $('#clearAll').addEventListener('click', async () => {
        const prev = ML.notifs.all();
        if (await ML.confirm({ title: 'Clear all notifications?', message: 'Every message will be removed from your inbox.', ok: 'Clear all', danger: true })) {
            ML.notifs.clear();
            ML.toast('Inbox cleared', { icon: 'bx-trash', action: { label: 'Undo', fn: () => prev.forEach((n) => ML.notifs.add(n)) } });
        }
    });
    document.addEventListener('ml:change', (e) => { const k = e.detail && e.detail.key; if (k === 'notifs' || k === '*') render(); });
    render();
});

/**
 * MARKETLINK CUSTOMERS — PROFILE & SETTINGS
 * One script drives both pages, switching on <body data-page>.
 */
ML.onReady(() => {
    const { $, $$, esc, money } = ML;
    const page = document.body.dataset.page;

    /* ============================================================
       PROFILE
       ============================================================ */
    function profile() {
        const u0 = () => ML.auth.user();
        const cleanName = (n) => n.replace(/\s*\(.*\)/, '');

        function hero() {
            const u = u0();
            const orders = ML.orders.all();
            const done = orders.filter((o) => o.status === 'collected').length;
            const farms = new Set(orders.filter((o) => o.status !== 'cancelled').flatMap((o) => o.items.map((l) => l.farm))).size;
            const saved = orders.reduce((n, o) => n + (o.discount || 0), 0);
            const joined = new Date(u.joined || Date.now());
            $('#pfHero').innerHTML = `
                <div class="pf-av">${ML.avatarHTML(u)}<button id="avUpload" aria-label="Change profile photo" title="Change photo"><i class='bx bx-camera'></i></button><input type="file" id="avFile" accept="image/*" hidden></div>
                <div class="pf-id"><span class="eyebrow" style="color:var(--color-secondary)">My profile</span><h1>${esc(u.name)}</h1><p>${esc(u.email)}${u.phone ? ' · ' + esc(u.phone) : ''}</p>
                    <div class="pf-tags"><span><i class='bx bx-map'></i> ${esc(u.area || 'Add your area')}</span><span><i class='bx bx-calendar-heart'></i> Member since ${ML.MONTHS[joined.getMonth()]} ${joined.getFullYear()}</span><span><i class='bx bxs-badge-check'></i> Local food supporter</span></div>
                    ${u.avatar ? `<button class="pf-remove" id="avRemove">Remove photo</button>` : ''}</div>
                <div class="pf-stats"><div><b data-cu="${orders.length}">0</b><small>Orders</small></div><div><b data-cu="${farms}">0</b><small>Farms backed</small></div><div><b data-cu="${done}">0</b><small>Collected</small></div></div>`;
            $$('#pfHero [data-cu]').forEach((el) => ML.countUp(el, Number(el.dataset.cu)));
            void saved;
        }
        function side() {
            const h = ML.hub(ML.prefs.get().hub) || ML.HUBS[0];
            const s = ML.nextSlots(h.id, 1)[0];
            $('#pfHub').innerHTML = `<h3><i class='bx bx-store-alt'></i> My pickup hub</h3>
                <div class="pf-hubline"><i class='bx bxs-map-pin'></i><div><b>${esc(h.name)}</b><small>${esc(h.area)}${s ? ' · next ' + esc(s.label) : ''}</small></div></div>
                <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><a class="btn btn-soft btn-sm" href="settings.html#hub"><i class='bx bx-edit'></i> Change</a><a class="btn btn-ghost btn-sm" href="map.html?hub=${h.id}"><i class='bx bx-map-alt'></i> View on map</a></div>`;
            const recent = ML.orders.all().slice(0, 3);
            $('#pfRecent').innerHTML = `<h3><i class='bx bx-receipt'></i> Recent orders</h3>` + (recent.length
                ? recent.map((o) => `<a class="pf-mini" href="orders.html?id=${esc(o.id)}"><img src="${esc(o.items[0].img)}" alt="" data-fb="${esc(o.items[0].name)}"><span><b>${esc(o.id)}</b><small>${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${money(o.total)}</small></span><span class="badge ${o.status === 'cancelled' ? 'danger' : o.status === 'collected' ? 'muted' : ''}">${o.status === 'cancelled' ? 'Cancelled' : ML.STAGES.find((s2) => s2.id === o.status).label}</span></a>`).join('') + `<a class="link" href="orders.html" style="margin-top:12px">All orders <i class='bx bx-right-arrow-alt'></i></a>`
                : `<p class="muted">No orders yet. <a class="link" href="marketplace.html">Start shopping</a></p>`);
        }
        function fill() {
            const u = u0();
            $('#pName').value = u.name || ''; $('#pEmail').value = u.email || ''; $('#pPhone').value = u.phone || ''; $('#pArea').value = u.area || '';
            $$('.field').forEach((f) => f.classList.remove('error'));
        }
        const setErr = (f, bad) => { $(`[data-f="${f}"]`).classList.toggle('error', bad); return bad; };
        $$('.field .input').forEach((i) => i.addEventListener('input', () => i.closest('.field').classList.remove('error')));

        $('#pfForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#pName').value.trim(), phone = $('#pPhone').value.trim(), area = $('#pArea').value.trim();
            const bad = [setErr('name', name.length < 2), setErr('phone', phone && phone.replace(/\D/g, '').length < 10), setErr('area', !area)].some(Boolean);
            if (bad) return ML.toast('Please fix the highlighted fields', { type: 'error' });
            const btn = $('#pfForm button[type=submit]'); btn.classList.add('loading');
            ML.api.profile.update({ name, phone, area }).then(() => {
                ML.toast('Profile updated', { icon: 'bx-check-circle' });
                hero();
                document.dispatchEvent(new CustomEvent('ml:change', { detail: { key: 'user' } }));
            }).catch((err) => {
                if (err.fields) Object.keys(err.fields).forEach((k) => { const f = $(`[data-f="${k}"]`); if (f) f.classList.add('error'); });
                ML.toast(err.message, { type: 'error' });
            }).finally(() => btn.classList.remove('loading'));
        });
        $('#pfReset').addEventListener('click', () => { fill(); ML.toast('Changes discarded', { icon: 'bx-revision' }); });

        /* avatar */
        document.addEventListener('click', (e) => {
            if (e.target.closest('#avUpload')) $('#avFile').click();
            if (e.target.closest('#avRemove')) { ML.api.profile.update({ avatar: '' }).then(() => { hero(); ML.toast('Photo removed', { icon: 'bx-trash' }); }).catch((err) => ML.toast(err.message, { type: 'error' })); }
        });
        document.addEventListener('change', (e) => {
            if (e.target.id !== 'avFile') return;
            const file = e.target.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) return ML.toast('Please choose an image file', { type: 'error' });
            if (file.size > 8 * 1024 * 1024) return ML.toast('That image is too large (8 MB max)', { type: 'error' });
            const rd = new FileReader();
            rd.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas'), n = 256, s = Math.min(img.width, img.height);
                    c.width = c.height = n;
                    c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, n, n);
                    ML.api.profile.uploadAvatar(c.toDataURL('image/jpeg', 0.85))
                        .then(() => { hero(); ML.toast('Profile photo updated', { icon: 'bx-camera' }); })
                        .catch((err) => ML.toast(err.message, { type: 'error' }));
                };
                img.onerror = () => ML.toast('Could not read that image', { type: 'error' });
                img.src = rd.result;
            };
            rd.readAsDataURL(file);
        });

        hero(); side(); fill();
        document.dispatchEvent(new Event('ml:rendered'));
        document.addEventListener('ml:change', (e) => { const k = e.detail && e.detail.key; if (k === 'orders' || k === 'prefs') { side(); } });
    }

    /* ============================================================
       SETTINGS
       ============================================================ */
    function settings() {
        const pr = () => ML.prefs.get();

        function hubs() {
            $('#stHubs').innerHTML = ML.HUBS.map((h) => {
                const s = ML.nextSlots(h.id, 1)[0];
                return `<label><input type="radio" name="hub" value="${h.id}"${pr().hub === h.id ? ' checked' : ''}><span class="hub-card"><span class="pin"><i class='bx bx-store-alt'></i></span><span><b>${esc(h.name)}</b><small>${esc(h.area)}</small></span><span class="day">${ML.DAYS[h.day]}s<br><small>${esc(ML.windowLabel(h))}${s ? '' : ''}</small></span></span></label>`;
            }).join('');
            $$('#stSub input').forEach((i) => { i.checked = i.value === pr().substitute; });
        }
        const NOTIFY = [
            { k: 'orders', t: 'Order updates', s: 'Reserved, packed and ready for pickup.' },
            { k: 'pickup', t: 'Pickup reminders', s: 'A nudge before the harvest lock and on pickup day.' },
            { k: 'offers', t: 'Offers and promo codes', s: 'Seasonal deals from your favourite farms.' },
            { k: 'tips', t: 'Tips and recipes', s: 'What to cook with this week’s harvest.' }
        ];
        function notify() {
            const p = pr();
            const row = (id, t, s, on) => `<div class="st-row"><div><b>${t}</b><small>${s}</small></div><label class="toggle"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${esc(t)}"><i></i></label></div>`;
            $('#stNotify').innerHTML = NOTIFY.map((n) => row('nt-' + n.k, n.t, n.s, p.notify[n.k])).join('')
                + row('nt-sms', 'SMS alerts', 'Text messages to your phone number.', p.sms)
                + row('nt-email', 'Email alerts', 'Receipts and updates to your inbox.', p.email);
        }
        function theme() { $$('#stTheme input').forEach((i) => { i.checked = i.value === ML.theme.mode(); }); }

        $('#stHubs').addEventListener('change', (e) => { ML.prefs.set({ hub: e.target.value }); ML.toast(ML.hub(e.target.value).name + ' is now your hub', { icon: 'bx-store-alt' }); });
        $('#stSub').addEventListener('change', (e) => { ML.prefs.set({ substitute: e.target.value }); ML.toast('Saved', { icon: 'bx-check' }); });
        $('#stNotify').addEventListener('change', (e) => {
            const id = e.target.id || '';
            if (id === 'nt-sms') ML.prefs.set({ sms: e.target.checked });
            else if (id === 'nt-email') ML.prefs.set({ email: e.target.checked });
            else if (id.indexOf('nt-') === 0) ML.prefs.setNotify(id.slice(3), e.target.checked);
            ML.toast('Preference saved', { icon: 'bx-bell' });
        });
        $('#stTheme').addEventListener('change', (e) => { ML.theme.set(e.target.value); ML.toast(e.target.value === 'system' ? 'Following your device theme' : 'Switched to ' + e.target.value + ' mode', { icon: e.target.value === 'dark' ? 'bx-moon' : 'bx-sun' }); });
        document.addEventListener('ml:change', (e) => { if (e.detail && e.detail.key === 'theme') theme(); });

        $('#btnExport').addEventListener('click', () => {
            const dump = { exportedAt: new Date().toISOString(), profile: ML.auth.user(), preferences: pr(), orders: ML.orders.all(), favorites: { produce: ML.favs.list(), farms: ML.favFarms.list() }, notifications: ML.notifs.all() };
            ML.download('marketlink-my-data.json', JSON.stringify(dump, null, 2), 'application/json');
            ML.toast('Your data was downloaded', { icon: 'bx-download' });
        });
        $('#btnReset').addEventListener('click', async () => {
            if (await ML.confirm({ title: 'Reset demo data?', message: 'Your basket, chat and any orders you placed will be replaced by the sample data.', ok: 'Reset', danger: true })) {
                ML.resetDemo(); hubs(); notify(); ML.toast('Demo data restored', { icon: 'bx-revision' });
            }
        });
        $('#btnDelete').addEventListener('click', async () => {
            if (await ML.confirm({ title: 'Delete your account?', message: 'This erases your profile, orders and favorites from this device. It cannot be undone.', ok: 'Delete everything', danger: true })) {
                ML.store.wipe();
                ML.flash('Your account was deleted from this device.', { icon: 'bx-trash' });
                location.href = 'auth.html';
            }
        });

        /* section nav + scroll spy */
        const links = $$('#stNav a');
        const secs = links.map((a) => $(a.getAttribute('href')));
        links.forEach((a) => a.addEventListener('click', (e) => {
            e.preventDefault();
            const t = $(a.getAttribute('href'));
            t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', a.getAttribute('href'));
            t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
        }));
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-25% 0px -65% 0px' });
            secs.forEach((s) => io.observe(s));
        }
        hubs(); notify(); theme();
        document.dispatchEvent(new Event('ml:rendered'));
        if (location.hash && $(location.hash)) setTimeout(() => { const t = $(location.hash); t.scrollIntoView({ behavior: 'smooth' }); t.classList.add('flash'); }, 350);
    }

    if (page === 'profile') profile(); else if (page === 'settings') settings();
});

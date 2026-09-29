/**
 * MARKETLINK CUSTOMERS — AUTH
 * Sign in / create account (demo: the profile is kept on this device,
 * passwords are validated but never stored).
 */
ML.onReady(() => {
    const { $, $$, esc } = ML;
    const card = $('#authCard');
    const form = $('#authForm');
    const alertBox = $('#authAlert');
    let signup = false;

    /* where to go after signing in — only same-folder pages are allowed */
    function nextUrl() {
        const n = ML.query.get('next') || '';
        return /^[a-z0-9-]+\.html(\?[^#]*)?$/i.test(n) ? n : 'home.html';
    }
    if (ML.auth.isIn() && !ML.query.get('switch')) { location.replace(nextUrl()); return; }

    /* ---------- mode switch ---------- */
    function setMode(isSignup) {
        signup = isSignup;
        card.classList.toggle('signup', signup);
        $('#tabIn').classList.toggle('active', !signup);
        $('#tabUp').classList.toggle('active', signup);
        $('#tabIn').setAttribute('aria-selected', String(!signup));
        $('#tabUp').setAttribute('aria-selected', String(signup));
        $('#authTitle').textContent = signup ? 'Join the market. It is free.' : 'Welcome back to the market.';
        $('#authSub').textContent = signup ? 'Create an account to reserve harvests, follow farms and track pickups.' : "Sign in to see this week's harvests and your reservations.";
        $('#submitText').textContent = signup ? 'Create my account' : 'Sign in';
        $('#password').autocomplete = signup ? 'new-password' : 'current-password';
        clearErrors();
        alertBox.hidden = true;
    }
    $('#tabIn').addEventListener('click', () => setMode(false));
    $('#tabUp').addEventListener('click', () => setMode(true));
    setMode(ML.query.get('mode') === 'signup');

    /* ---------- password eye + strength ---------- */
    $('#eye').addEventListener('click', () => {
        const pw = $('#password');
        const show = pw.type === 'password';
        pw.type = show ? 'text' : 'password';
        $('#eye i').className = show ? 'bx bx-hide' : 'bx bx-show';
        $('#eye').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    $('#password').addEventListener('input', () => {
        const v = $('#password').value;
        let s = 0;
        if (v.length >= 6) s++;
        if (v.length >= 8) s++;
        if (/[0-9]/.test(v) && /[a-zA-Z]/.test(v)) s++;
        if (/[^a-zA-Z0-9]/.test(v) || v.length >= 12) s++;
        if (!v) s = 0;
        $('#meter').dataset.s = s;
        $('#meterText').textContent = ['Use 8+ characters with a number', 'Too short', 'Okay, add a number or symbol', 'Good', 'Strong'][s];
        clearField('password');
    });

    /* ---------- validation ---------- */
    const rules = {
        name: (v) => !signup || v.trim().length >= 2,
        area: (v) => !signup || v.trim().length >= 2,
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        password: (v) => v.length >= 6
    };
    function clearField(name) { const f = $(`[data-field="${name}"]`); if (f) f.classList.remove('error'); }
    function clearErrors() { $$('.field.error').forEach((f) => f.classList.remove('error')); $('.terms').classList.remove('error'); }
    ['name', 'area', 'email'].forEach((n) => $('#' + n).addEventListener('input', () => clearField(n)));

    function validate() {
        let ok = true, firstBad = null;
        Object.keys(rules).forEach((n) => {
            const good = rules[n]($('#' + n).value);
            const f = $(`[data-field="${n}"]`);
            f.classList.toggle('error', !good);
            if (!good) { ok = false; firstBad = firstBad || $('#' + n); }
        });
        if (signup && !$('#terms').checked) { $('.terms').classList.add('error'); ok = false; firstBad = firstBad || $('#terms'); }
        if (firstBad) firstBad.focus();
        return ok;
    }

    function showAlert(msg, ok) {
        alertBox.className = 'auth-alert' + (ok ? ' ok' : '');
        alertBox.innerHTML = `<i class='bx ${ok ? 'bx-check-circle' : 'bx-error-circle'}'></i><span>${esc(msg)}</span>`;
        alertBox.hidden = false;
        void alertBox.offsetWidth;
    }

    function finish(profile, welcome) {
        const call = signup ? ML.api.auth.signUp(profile) : ML.api.auth.signIn(profile);
        return call.then((u) => {
            ML.flash(welcome || (signup ? `Welcome to the market, ${u.name.split(' ')[0]}!` : `Good to see you, ${u.name.split(' ')[0]}.`), { icon: 'bx-leaf' });
            location.href = nextUrl();
        }).catch((err) => {
            btnBusy(false);
            if (err.fields) Object.keys(err.fields).forEach((n) => { const f = $(`[data-field="${n}"]`); if (f) f.classList.add('error'); });
            showAlert(err.message || 'We could not sign you in. Please try again.');
        });
    }
    function btnBusy(on) { $('#submit').classList.toggle('loading', on); $('#submit').disabled = on; }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alertBox.hidden = true;
        if (!validate()) return;
        btnBusy(true);
        const email = $('#email').value.trim().toLowerCase();
        const guess = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const go = () => finish({
            email,
            password: $('#password').value,
            remember: !!($('#remember') && $('#remember').checked),
            name: signup ? $('#name').value.trim() : guess,
            area: signup ? $('#area').value.trim() : ''
        });
        if (ML.remote) go(); else setTimeout(go, 700);
    });

    /* ---------- forgot password ---------- */
    $('#forgot').addEventListener('click', () => {
        const m = ML.modal({
            title: 'Reset your password', size: 'sm',
            html: `<p class="muted" style="margin-bottom:16px">Enter the email you signed up with and we will send a reset link.</p>
                <label class="field" id="fpField"><span>Email address</span><div class="input-wrap"><i class='bx bx-envelope lead'></i><input class="input" id="fpEmail" type="email" placeholder="you@example.com" value="${esc($('#email').value)}"></div><em class="err">Enter a valid email address.</em></label>`,
            actions: [
                { label: 'Cancel', cls: 'btn-ghost' },
                { label: 'Send reset link', cls: 'btn-primary', icon: 'bx-send', onClick: () => {
                    const v = $('#fpEmail', m.el).value.trim();
                    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
                    $('#fpField', m.el).classList.toggle('error', !ok);
                    if (!ok) return false;
                    ML.toast('If ' + v + ' has an account, a reset link is on its way.', { icon: 'bx-envelope', duration: 4200 });
                } }
            ]
        });
    });

    /* ---------- legal ---------- */
    const LEGAL = {
        terms: ['Terms of Exchange', '<p>MarketLink connects you directly with farms. When you reserve a basket you agree to collect it during your chosen pickup window with your pickup code.</p><p style="margin-top:10px">Reservations can be cancelled free of charge until the harvest lock (6 PM the evening before pickup). After that the farmer has already begun cutting, so the order can no longer be cancelled.</p><p style="margin-top:10px">Produce is natural, so size and colour vary. If something is not right, tell us within 24 hours of collection and we will make it right.</p>'],
        privacy: ['Privacy Policy', '<p>We keep only what we need to run your orders: your name, contact details, pickup hub and order history.</p><p style="margin-top:10px">This prototype stores everything on your own device. You can export or erase it at any time from Settings.</p>']
    };
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-legal]');
        if (!b) return;
        const [title, html] = LEGAL[b.dataset.legal];
        ML.modal({ title, html, actions: [{ label: 'Got it', cls: 'btn-primary' }] });
    });

    /* ---------- social + demo ---------- */
    $$('[data-social]').forEach((b) => b.addEventListener('click', () => {
        b.classList.add('loading');
        setTimeout(() => finish({ email: 'adaeze.okafor@example.com', name: 'Adaeze Okafor', area: 'Yaba, Lagos', phone: '+234 801 234 5678' }, 'Signed in with ' + b.dataset.social + ' (demo account)'), 900);
    }));
    $('#demo').addEventListener('click', () => {
        setMode(false);
        $('#email').value = 'adaeze.okafor@example.com';
        $('#password').value = 'freshharvest';
        $('#password').dispatchEvent(new Event('input'));
        ML.toast('Demo details filled in. Press Sign in.', { icon: 'bx-bulb' });
        $('#submit').focus();
    });

    /* ---------- quote rotator ---------- */
    const QUOTES = [
        ['I stopped buying week-old vegetables. My tomatoes were still on the vine yesterday morning.', 'Adaeze Okafor', 'Home cook, Ikeja', 'AO'],
        ['I run a small restaurant. Reserving from Green Valley cut my food cost and my waste in half.', 'Tunde Bakare', 'Chef, Lekki', 'TB'],
        ['The eggs alone are worth it. My kids can taste the difference and I know the farmer by name.', 'Halima Sani', 'Mum of three, Ikorodu', 'HS']
    ];
    let qi = 0, qt;
    const quote = $('#quote'), dots = $$('#quoteDots button');
    function showQuote(i) {
        qi = i;
        quote.classList.add('swap');
        setTimeout(() => {
            const q = QUOTES[i];
            $('#quoteText').textContent = q[0]; $('#quoteName').textContent = q[1]; $('#quoteRole').textContent = q[2]; $('#quoteAv').textContent = q[3];
            dots.forEach((d, k) => d.classList.toggle('on', k === i));
            quote.classList.remove('swap');
        }, 320);
    }
    function loop() { clearInterval(qt); qt = setInterval(() => showQuote((qi + 1) % QUOTES.length), 6500); }
    dots.forEach((d, i) => d.addEventListener('click', () => { showQuote(i); loop(); }));
    loop();

    /* keep the theme icon honest */
    const syncIcon = () => { $('#themeIcon').className = 'bx ' + (ML.theme.resolved() === 'dark' ? 'bx-moon' : 'bx-sun'); };
    syncIcon();
    document.addEventListener('ml:change', syncIcon);
    document.addEventListener('click', (e) => { if (e.target.closest('[data-theme-toggle]')) ML.theme.toggle(); });
});

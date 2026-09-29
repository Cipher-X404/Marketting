/**
 * MARKETLINK CUSTOMERS — UI KIT
 * Toast, modal, confirm, reveal-on-scroll, count-up, download helper and
 * image fallback. Loaded on every page (including auth, which has no shell).
 */
(function (ML) {
    'use strict';
    const { $, $$, esc } = ML;

    ML.query = new URLSearchParams(location.search);
    /* remember a message across a page navigation */
    ML.flash = (msg, opts) => { try { sessionStorage.setItem('ml_flash', JSON.stringify({ msg, opts })); } catch (e) { /* ignore */ } };

    /* the toast stack lives on every page, shell or not */
    if (!document.getElementById('toasts')) {
        const t = document.createElement('div');
        t.className = 'toasts'; t.id = 'toasts'; t.setAttribute('aria-live', 'polite');
        document.body.appendChild(t);
    }

    /* ============================================================
       TOAST
       ============================================================ */
    ML.toast = function (msg, opts) {
        opts = opts || {};
        const wrap = $('#toasts');
        const el = document.createElement('div');
        el.className = 'toast ' + (opts.type || '');
        el.setAttribute('role', 'status');
        el.innerHTML = `<i class='bx ${opts.icon || (opts.type === 'error' ? 'bx-error-circle' : opts.type === 'warn' ? 'bx-info-circle' : 'bx-check-circle')}'></i><span>${esc(msg)}</span>`;
        if (opts.action) {
            const b = document.createElement('button');
            b.textContent = opts.action.label;
            b.addEventListener('click', () => { opts.action.fn(); dismiss(); });
            el.appendChild(b);
        }
        wrap.appendChild(el);
        while (wrap.children.length > 3) wrap.firstChild.remove();
        let t = setTimeout(dismiss, opts.duration || 3200);
        function dismiss() { clearTimeout(t); el.classList.add('out'); setTimeout(() => el.remove(), 300); }
        return dismiss;
    };
    try {
        const f = JSON.parse(sessionStorage.getItem('ml_flash') || 'null');
        if (f) { sessionStorage.removeItem('ml_flash'); setTimeout(() => ML.toast(f.msg, f.opts), 500); }
    } catch (e) { /* ignore */ }

    /* ============================================================
       MODAL / CONFIRM
       ============================================================ */
    ML.modal = function (opts) {
        const prevFocus = document.activeElement;
        const root = document.createElement('div');
        root.className = 'modal-root';
        root.innerHTML = `<div class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.title || 'Dialog')}">
            ${opts.title ? `<div class="modal-head"><h3>${esc(opts.title)}</h3><button class="modal-x" data-x aria-label="Close"><i class='bx bx-x'></i></button></div>` : ''}
            <div class="modal-body"></div>
            ${opts.actions && opts.actions.length ? '<div class="modal-foot"></div>' : ''}
        </div>`;
        const bodyEl = $('.modal-body', root);
        if (typeof opts.html === 'string') bodyEl.innerHTML = opts.html; else if (opts.node) bodyEl.appendChild(opts.node);
        const api = { el: root, body: bodyEl, close };
        (opts.actions || []).forEach((a) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn ' + (a.cls || 'btn-ghost');
            b.innerHTML = a.icon ? `<i class='bx ${a.icon}'></i><span>${esc(a.label)}</span>` : `<span>${esc(a.label)}</span>`;
            b.addEventListener('click', async (ev) => {
                const r = a.onClick ? await a.onClick(close, ev, api) : undefined;
                if (r !== false && !a.keepOpen) close(a.value);
            });
            $('.modal-foot', root).appendChild(b);
        });
        function onKey(e) {
            if (e.key === 'Escape') close();
            if (e.key === 'Tab') {
                const f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', root).filter((x) => x.offsetParent !== null);
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
        function close(val) {
            if (root.dataset.closing) return;
            root.dataset.closing = '1';
            document.removeEventListener('keydown', onKey);
            root.classList.add('closing');
            document.body.style.overflow = '';
            setTimeout(() => { root.remove(); if (prevFocus && prevFocus.focus) prevFocus.focus(); if (opts.onClose) opts.onClose(val); }, 190);
        }
        root.addEventListener('mousedown', (e) => { if (e.target === root && opts.dismissible !== false) close(); });
        root.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(root);
        document.body.style.overflow = 'hidden';
        setTimeout(() => { const f = $('[autofocus], input, select, textarea, .btn-primary, .btn', root); if (f) f.focus(); }, 60);
        return api;
    };

    ML.confirm = function (o) {
        return new Promise((resolve) => {
            let answer = false;
            ML.modal({
                title: o.title || 'Are you sure?', size: 'sm',
                html: `<p style="color:var(--color-text-secondary)">${o.message || ''}</p>`,
                actions: [
                    { label: o.cancel || 'Cancel', cls: 'btn-ghost', onClick: () => { answer = false; } },
                    { label: o.ok || 'Confirm', cls: o.danger ? 'btn-danger' : 'btn-primary', onClick: () => { answer = true; } }
                ],
                onClose: () => resolve(answer)
            });
        });
    };


    ML.reveal = function (root) {
        const els = $$('.reveal:not(.in)', root || document);
        if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        els.forEach((el) => io.observe(el));
    };
    ML.countUp = function (el, to, opts) {
        opts = opts || {};
        const dur = opts.duration || 1100, start = performance.now(), fmt = opts.format || ((v) => Math.round(v).toLocaleString('en-NG'));
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
        (function step(now) {
            const t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 4);
            el.textContent = fmt(to * eased);
            if (t < 1) requestAnimationFrame(step);
        })(start);
    };
    ML.download = function (name, text, type) {
        const blob = new Blob([text], { type: type || 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    /* image fallback for every remote photo */
    document.addEventListener('error', (e) => {
        const im = e.target;
        if (im && im.tagName === 'IMG' && !im.dataset.failed && im.dataset.fb !== undefined) {
            im.dataset.failed = '1';
            im.src = ML.fallbackImg(im.dataset.fb);
        }
    }, true);

})(window.ML);

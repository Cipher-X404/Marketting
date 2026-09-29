/**
 * MARKETLINK — LANDING PAGE
 * Theme toggle, scroll header, mobile nav.
 */

document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const header = document.querySelector('.site-header');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileNav = document.getElementById('mobileNav');

    /* ======================================================================
       THEME
       ====================================================================== */
    const saved = localStorage.getItem('marketlink_theme') || 'light';
    setTheme(saved);

    function setTheme(t) {
        html.setAttribute('data-theme', t);
        localStorage.setItem('marketlink_theme', t);
        if (themeIcon) {
            themeIcon.className = t === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
            themeBtn?.setAttribute('aria-label',
                t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }

    themeBtn?.addEventListener('click', () => {
        const next = (html.getAttribute('data-theme') || 'light') === 'dark'
            ? 'light' : 'dark';
        setTheme(next);
    });

    /* ======================================================================
       SCROLL HEADER
       ====================================================================== */
    const onScroll = () => {
        if (window.scrollY > 40) {
            header?.classList.add('is-scrolled');
        } else {
            header?.classList.remove('is-scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ======================================================================
       MOBILE NAV
       ====================================================================== */
    function openMobile() {
        mobileNav?.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobile() {
        mobileNav?.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    mobileMenuBtn?.addEventListener('click', openMobile);
    mobileCloseBtn?.addEventListener('click', closeMobile);

    // Close on backdrop click
    mobileNav?.addEventListener('click', (e) => {
        if (e.target === mobileNav) closeMobile();
    });

    // Close on nav link click
    mobileNav?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobile);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobile();
    });
});

/* --------------------------------------------------------------------------
   Hero background video: browsers sometimes ignore the `muted` attribute, and
   autoplay can be blocked. Force-mute, start playback, retry on first touch.
   Visitors who prefer reduced motion get the still poster instead.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.removeAttribute('autoplay');
        video.pause();
        return;
    }

    const start = () => {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    start();

    // Autoplay blocked (e.g. low-power mode): try again on the first interaction.
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((evt) =>
        window.addEventListener(evt, () => { if (video.paused) start(); }, { once: true, passive: true })
    );

    // Save battery: pause while the hero is off-screen.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? start() : video.pause()));
        }, { threshold: 0.05 }).observe(video);
    }
});

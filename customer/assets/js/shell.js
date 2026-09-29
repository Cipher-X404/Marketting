/* =========================================
   CUSTOMER — SHARED JS
   Cart state, drawer, theme toggle, toast
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---- THEME TOGGLE ----
    const themeBtn = document.getElementById('cThemeToggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('marketlink_theme') || 'light';
    html.setAttribute('data-theme', saved);

    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (icon) icon.className = saved === 'dark' ? 'bx bx-moon' : 'bx bx-sun';

        themeBtn.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('marketlink_theme', next);
            const ic = themeBtn.querySelector('i');
            if (ic) ic.className = next === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
        });
    }

    // ---- CART STATE ----
    window.cart = JSON.parse(localStorage.getItem('ml_cart') || '[]');

    function saveCart() {
        localStorage.setItem('ml_cart', JSON.stringify(window.cart));
        updateCartUI();
    }

    function updateCartUI() {
        // Update all cart count badges
        document.querySelectorAll('.c-cart-count').forEach(el => {
            el.textContent = window.cart.length;
            el.style.display = window.cart.length > 0 ? 'grid' : 'none';
        });

        // Render cart drawer items
        const body = document.querySelector('.c-cart-body');
        if (!body) return;

        if (window.cart.length === 0) {
            body.innerHTML = `
                <div class="c-cart-empty">
                    <i class='bx bx-basket'></i>
                    <p>Your basket is empty</p>
                </div>`;
            const totalEl = document.querySelector('.c-cart-total strong');
            if (totalEl) totalEl.textContent = '₦0';
            return;
        }

        let total = 0;
        body.innerHTML = window.cart.map((item, i) => {
            total += item.price * (item.qty || 1);
            return `
                <div class="c-cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="c-cart-item-info">
                        <h4>${item.name}</h4>
                        <span>${item.unit} × ${item.qty || 1}</span>
                    </div>
                    <span class="c-cart-item-price">₦${(item.price * (item.qty || 1)).toLocaleString()}</span>
                    <button class="c-cart-item-remove" data-idx="${i}"><i class='bx bx-trash'></i></button>
                </div>`;
        }).join('');

        const totalEl = document.querySelector('.c-cart-total strong');
        if (totalEl) totalEl.textContent = '₦' + total.toLocaleString();

        // Remove buttons
        body.querySelectorAll('.c-cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                window.cart.splice(+btn.dataset.idx, 1);
                saveCart();
            });
        });
    }

    window.addToCart = function(item) {
        const existing = window.cart.find(c => c.name === item.name);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            window.cart.push({ ...item, qty: 1 });
        }
        saveCart();
        showToast(`${item.name} added to basket`);
        openCartDrawer();
    };

    // ---- CART DRAWER ----
    const cartOverlay = document.querySelector('.c-cart-overlay');
    const cartDrawer = document.querySelector('.c-cart-drawer');

    function openCartDrawer() {
        if (cartOverlay) cartOverlay.classList.add('open');
        if (cartDrawer) cartDrawer.classList.add('open');
    }
    function closeCartDrawer() {
        if (cartOverlay) cartOverlay.classList.remove('open');
        if (cartDrawer) cartDrawer.classList.remove('open');
    }

    document.querySelectorAll('.c-open-cart').forEach(el =>
        el.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); })
    );
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
    document.querySelectorAll('.c-close-cart').forEach(el =>
        el.addEventListener('click', closeCartDrawer)
    );

    // ---- TOAST ----
    const toast = document.getElementById('cToast');
    window.showToast = function(msg) {
        if (!toast) return;
        toast.innerHTML = `<i class='bx bx-check-circle'></i> ${msg}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    };

    // Init
    updateCartUI();
});

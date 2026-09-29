/**
 * MARKETLINK — DASHBOARD SCRIPT
 * Handles sidebar collapse, mobile drawer, active page states,
 * header dropdowns, and theme switching with localStorage persistence.
 */

document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const htmlElem = document.documentElement;
    const sidebar = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('mainWrapper');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    // Buttons
    const desktopCollapseBtn = document.getElementById('desktopCollapseBtn');
    const collapseIcon = document.getElementById('collapseIcon');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    
    // Profile Dropdown Elements
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');


    /* =========================================
       1. THEME SWITCHER (LIGHT / DARK MODE)
       ========================================= */
    const savedTheme = localStorage.getItem('marketlink_theme') || 'light';
    applyTheme(savedTheme);

    function applyTheme(theme) {
        htmlElem.setAttribute('data-theme', theme);
        localStorage.setItem('marketlink_theme', theme);

        if (theme === 'dark') {
            themeIcon.className = 'bx bx-moon';
        } else {
            themeIcon.className = 'bx bx-sun';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElem.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });


    /* =========================================
       2. DESKTOP SIDEBAR COLLAPSE / EXPAND
       ========================================= */
    const savedCollapseState = localStorage.getItem('marketlink_sidebar_collapsed') === 'true';
    if (savedCollapseState && window.innerWidth >= 992) {
        sidebar.classList.add('collapsed');
        mainWrapper.classList.add('expanded');
        collapseIcon.className = 'bx bx-chevron-right';
    }

    desktopCollapseBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        mainWrapper.classList.toggle('expanded', isCollapsed);

        if (isCollapsed) {
            collapseIcon.className = 'bx bx-chevron-right';
            localStorage.setItem('marketlink_sidebar_collapsed', 'true');
        } else {
            collapseIcon.className = 'bx bx-chevron-left';
            localStorage.setItem('marketlink_sidebar_collapsed', 'false');
        }
    });


    /* =========================================
       3. MOBILE DRAWER NAVIGATION
       ========================================= */
    function openMobileSidebar() {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent main scrolling when menu is open
    }

    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);


    /* =========================================
       4. DYNAMIC ACTIVE NAVIGATION LINK STATE
       ========================================= */
    // Use the current page filename to maintain active navigation state
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    setActiveNavItem(currentPage);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageTarget = link.getAttribute('data-page');
            setActiveNavItem(pageTarget);

            // Automatically close drawer on mobile upon link click
            if (window.innerWidth < 992) {
                closeMobileSidebar();
            }
        });
    });

    function setActiveNavItem(pageTarget) {
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageTarget) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }


    /* =========================================
       5. HEADER PROFILE DROPDOWN
       ========================================= */
    if (profileDropdownBtn && dropdownMenu) {
        profileDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
            const arrow = profileDropdownBtn.querySelector('.dropdown-arrow');
            if (arrow) {
                arrow.style.transform = dropdownMenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdownBtn.contains(e.target)) {
                dropdownMenu.classList.remove('active');
                const arrow = profileDropdownBtn.querySelector('.dropdown-arrow');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        });
    }

});


// Main Section starts here
/* =========================================
   PRODUCTS PAGE FUNCTIONALITY
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Animated Number Counters for Stats
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    if(Number.isInteger(target)) {
                         counter.innerText = Math.ceil(count + inc);
                    } else {
                         counter.innerText = (count + inc).toFixed(2);
                    }
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            setTimeout(updateCount, 400); // Delayed start to match CSS fade-in
        });
    };
    animateCounters();

    // 2. Delete Product Functionality
    const productGrid = document.getElementById('productGrid');
    
    productGrid.addEventListener('click', function(e) {
        // Find if a delete button was clicked (or icon inside it)
        const deleteBtn = e.target.closest('.btn-delete');
        
        if (deleteBtn) {
            e.preventDefault(); // Prevent default if it was converted to an anchor later
            
            const card = deleteBtn.closest('.product-card');
            const productName = card.querySelector('.product-title').innerText;
            
            // Custom confirmation dialog
            if (confirm(`Are you sure you want to delete "${productName}" from your inventory?`)) {
                // Apply leaving animation
                card.classList.add('deleting');
                
                // Remove from DOM after animation completes (400ms)
                setTimeout(() => {
                    card.remove();
                    updateTotalProductsCount();
                }, 400);
            }
        }
    });

    // Function to visually update the total products count when one is deleted
    function updateTotalProductsCount() {
        const totalProductsEl = document.querySelector('.counter[data-target="12"]');
        if (totalProductsEl) {
            let currentTotal = parseInt(totalProductsEl.innerText);
            if (currentTotal > 0) {
                totalProductsEl.innerText = currentTotal - 1;
                // Also update the target attribute in case animation re-runs
                totalProductsEl.setAttribute('data-target', currentTotal - 1);
            }
        }
    }

    // 3. Search Filtering (Basic Visual Implementation)
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            const title = card.querySelector('.product-title').innerText.toLowerCase();
            const category = card.querySelector('.product-category').innerText.toLowerCase();
            
            if (title.includes(term) || category.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });

});
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
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Account Information Tab Switching Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding pane
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- 2. Security Settings Modal Logic ---
    const securityItems = document.querySelectorAll('.security-item');
    const modalOverlay = document.getElementById('securityModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    // Data to populate the modal based on what is clicked
    const modalData = {
        'change-password': {
            title: 'Change Password',
            content: `
                <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Enter your current password and a new one to update your security credentials.</p>
                <input type="password" placeholder="Current Password" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <input type="password" placeholder="New Password" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text);">
                <button class="btn-primary" style="width: 100%; margin-top: 10px;">Update Password</button>
            `
        },
        'two-factor': {
            title: 'Two-Factor Authentication',
            content: `
                <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Two-Factor Authentication is currently <strong style="color: var(--color-success);">Enabled</strong>.</p>
                <p>Use an authenticator app to generate one-time security codes.</p>
                <button class="btn-outline" style="width: 100%; margin-top: 16px; border-color: var(--color-danger); color: var(--color-danger);">Disable 2FA</button>
            `
        },
        'sessions': {
            title: 'Active Sessions',
            content: `
                <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Here are the devices currently logged into your account.</p>
                <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px;">
                    <strong>Windows PC - Chrome</strong><br><span style="font-size: 0.8rem; color: var(--color-success);">Active Now</span>
                </div>
                <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 8px;">
                    <strong>iPhone 13 - Safari</strong><br><span style="font-size: 0.8rem; color: var(--color-text-muted);">Last active 2 days ago</span>
                </div>
            `
        },
        'privacy': {
            title: 'Privacy Settings',
            content: `
                <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Manage who can see your farm profile and contact details.</p>
                <label style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
                    <input type="checkbox" checked> Make farm profile public
                </label>
                <label style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox"> Share contact data with partners
                </label>
                <button class="btn-primary" style="width: 100%; margin-top: 20px;">Save Preferences</button>
            `
        }
    };

    // Open Modal
    securityItems.forEach(item => {
        item.addEventListener('click', () => {
            const modalType = item.getAttribute('data-modal');
            const data = modalData[modalType];
            
            if(data) {
                modalTitle.textContent = data.title;
                modalBody.innerHTML = data.content;
                modalOverlay.classList.add('active');
            }
        });
    });

    // Close Modal when clicking X or outside the box
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

});

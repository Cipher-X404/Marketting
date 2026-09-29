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
// Tab Switching Functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 2. Remove active class from all tab content panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 3. Add active class to the clicked button
            button.classList.add('active');
            
            // 4. Find the target tab pane based on data-tab attribute
            const targetId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            
            // 5. Add active class to the corresponding tab pane
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Optional: Add smooth scrolling for anchor tags inside the main component
    const actionLinks = document.querySelectorAll('.profile-main-container a[href^="#"]');
    actionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement any custom link logic here (modals, routing, etc.)
            console.log(`Action clicked: ${this.getAttribute('href')}`);
        });
    });
});
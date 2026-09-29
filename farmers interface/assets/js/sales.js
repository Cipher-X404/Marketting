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
// Helper to get CSS root variables for seamless Dark/Light mode integration
function getCSSVar(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Date Filter Toggle
    const dateFilterBtn = document.getElementById('dateFilterBtn');
    const dateDropdown = document.getElementById('dateDropdown');
    
    dateFilterBtn.addEventListener('click', (e) => {
        if (e.target.closest('li')) return; // handled by inline onclick
        dateDropdown.style.display = dateDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown on outside click
    window.addEventListener('click', (e) => {
        if (!dateFilterBtn.contains(e.target)) {
            dateDropdown.style.display = 'none';
        }
    });

    // 2. Download Report Button (Exports dummy CSV for functionality)
    document.getElementById('downloadReportBtn').addEventListener('click', () => {
        const csvData = "Metric,Value,Trend\nTotal Sales,$1248.50,+18%\nTotal Orders,28,+12%\nAverage Order Value,$44.59,+6%\nUnique Customers,21,+31%";
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sales_Insights_Report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    });

    // --- CHART.JS CONFIGURATIONS ---
    // Chart.js comes from a CDN; skip the charts (rest of the page still works) if it failed to load
    if (typeof Chart === 'undefined') return;

    // Theme Colors based on your roots
    const colPrimary = getCSSVar('--color-primary') || '#16A34A';
    const colSecondary = getCSSVar('--color-secondary') || '#84CC16';
    const colAccent = getCSSVar('--color-accent') || '#F59E0B';
    const colTextMuted = getCSSVar('--color-text-muted') || '#7A8A7A';
    const colBorder = getCSSVar('--color-border') || '#DDE8DE';

    // Shared options for mini sparkline charts
    const sparklineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } }
    };

    // Sparklines Generation
    new Chart(document.getElementById('sparklineSales').getContext('2d'), {
        type: 'line',
        data: { labels: ['1','2','3','4','5','6','7'], datasets: [{ data: [10, 20, 15, 30, 25, 40, 50], borderColor: colPrimary }] },
        options: sparklineOptions
    });
    new Chart(document.getElementById('sparklineOrders').getContext('2d'), {
        type: 'line',
        data: { labels: ['1','2','3','4','5','6','7'], datasets: [{ data: [5, 10, 8, 15, 12, 18, 22], borderColor: colAccent }] },
        options: sparklineOptions
    });
    new Chart(document.getElementById('sparklineAOV').getContext('2d'), {
        type: 'line',
        data: { labels: ['1','2','3','4','5','6','7'], datasets: [{ data: [40, 42, 41, 45, 43, 44, 46], borderColor: '#2563EB' }] },
        options: sparklineOptions
    });
    new Chart(document.getElementById('sparklineCustomers').getContext('2d'), {
        type: 'line',
        data: { labels: ['1','2','3','4','5','6','7'], datasets: [{ data: [2, 5, 4, 8, 7, 12, 15], borderColor: '#9333EA' }] },
        options: sparklineOptions
    });

    // Sales Overview Chart (Bar + Line combo)
    new Chart(document.getElementById('salesOverviewChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27'],
            datasets: [
                {
                    type: 'line',
                    label: 'Orders',
                    data: [100, 120, 105, 140, 160, 180, 210],
                    borderColor: colAccent,
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    type: 'bar',
                    label: 'Sales ($)',
                    data: [150, 180, 160, 210, 240, 270, 310],
                    backgroundColor: colPrimary,
                    borderRadius: 4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: colTextMuted } },
                y: { grid: { color: colBorder, drawBorder: false }, ticks: { color: colTextMuted } },
                y1: { display: false, position: 'right' }
            }
        }
    });

    // Sales by Category (Doughnut Chart)
    const catData = [42, 24, 14, 10, 6, 4];
    const catLabels = ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables', 'Herbs', 'Others'];
    const catColors = [colPrimary, colSecondary, colAccent, '#2563EB', '#9333EA', '#D1D5DB'];
    
    new Chart(document.getElementById('categoryChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 0, cutout: '75%' }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } } // Custom legend created in HTML
        }
    });

    // Populate Custom Legend for Doughnut
    const legendContainer = document.getElementById('categoryLegend');
    catLabels.forEach((label, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <span class="legend-color" style="background-color: ${catColors[index]}"></span>
                ${label}
            </div>
            <strong>${catData[index]}%</strong>
        `;
        legendContainer.appendChild(li);
    });

    // Sales Performance (Grouped Bar Chart)
    new Chart(document.getElementById('performanceChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Veg', 'Others'],
            datasets: [
                {
                    label: 'This Week',
                    data: [180, 140, 110, 90, 80],
                    backgroundColor: colPrimary,
                    borderRadius: 3
                },
                {
                    label: 'Last Week',
                    data: [150, 120, 95, 75, 65],
                    backgroundColor: getCSSVar('--color-border') || '#E5E7EB',
                    borderRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'top', 
                    align: 'end',
                    labels: { boxWidth: 10, usePointStyle: true, color: colTextMuted }
                } 
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: colTextMuted, font: {size: 10} } },
                y: { grid: { color: colBorder, drawBorder: false }, ticks: { color: colTextMuted, maxTicksLimit: 5 } }
            }
        }
    });
});

// Update Date Function for Dropdown
window.updateDate = function(text) {
    document.getElementById('dateRangeText').innerText = text;
    document.getElementById('dateDropdown').style.display = 'none';
};
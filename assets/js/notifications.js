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

    // --- Sample Notification Data ---
    let notifications = [
        { id: 1, category: 'Orders', type: 'Order', icon: 'bx-cart', iconClass: 'ml-icon-success', title: 'New Order Received', text: 'Order #ORD-1042 for 2kg Tomatoes, 1kg Carrots from Sarah Johnson.', time: '10:24 AM', statusText: 'New', statusClass: 'ml-icon-success', unread: true },
        { id: 2, category: 'Messages', type: 'Message', icon: 'bx-message-rounded', iconClass: 'ml-icon-info', title: 'Customer Message', text: 'Michael Brown sent you a message: "Is the organic lettuce still available?"', time: '09:41 AM', statusText: 'Unread', statusClass: 'ml-icon-info', unread: true },
        { id: 3, category: 'System', type: 'System / Pickup', icon: 'bx-calendar', iconClass: 'ml-icon-primary', title: 'Pickup Slot Confirmed', text: 'Your pickup slot for Apr 29, 2025 (8:00 AM – 12:00 PM) has been confirmed.', time: '08:15 AM', statusText: 'Info', statusClass: 'ml-icon-primary', unread: true },
        { id: 4, category: 'System', type: 'Review', icon: 'bx-star', iconClass: 'ml-icon-success', title: 'New Review', text: 'Emily Davis rated your Fresh Tomatoes 5 stars: "Excellent quality! Very fresh!"', time: 'Yesterday', statusText: 'Positive', statusClass: 'ml-icon-success', unread: true },
        { id: 5, category: 'System', type: 'Warning', icon: 'bx-error', iconClass: 'ml-icon-warning', title: 'Low Stock Alert', text: 'Your Carrots stock is running low (2kg remaining).', time: 'Yesterday', statusText: 'Warning', statusClass: 'ml-icon-warning', unread: false },
        { id: 6, category: 'Orders', type: 'Order', icon: 'bx-cart', iconClass: 'ml-icon-primary', title: 'Order Delivered', text: 'Order #ORD-1039 has been marked as delivered.', time: 'Apr 26, 2025', statusText: 'Info', statusClass: 'ml-icon-primary', unread: false },
        { id: 7, category: 'System', type: 'Success', icon: 'bx-check-circle', iconClass: 'ml-icon-success', title: 'Product Approved', text: 'Your new product "Sweet Potatoes" has been approved and is now live.', time: 'Apr 25, 2025', statusText: 'Success', statusClass: 'ml-icon-success', unread: false },
        { id: 8, category: 'System', type: 'System', icon: 'bx-cog', iconClass: 'ml-icon-info', title: 'System Notification', text: 'Your sales report for Apr 21 – Apr 27 is now available.', time: 'Apr 24, 2025', statusText: 'Info', statusClass: 'ml-icon-info', unread: false },
        { id: 9, category: 'System', type: 'Reminder', icon: 'bx-time', iconClass: 'ml-icon-warning', title: 'Pickup Slot Reminder', text: 'Your pickup slot for Apr 28, 2025 (8:00 AM – 12:00 PM) is tomorrow.', time: 'Apr 27, 2025', statusText: 'Reminder', statusClass: 'ml-icon-warning', unread: false },
        { id: 10, category: 'Orders', type: 'Order', icon: 'bx-cart', iconClass: 'ml-icon-success', title: 'New Order Received', text: 'Order #ORD-1038 for 1kg Bananas from Linda Martinez.', time: 'Apr 24, 2025', statusText: 'New', statusClass: 'ml-icon-success', unread: false },
        { id: 11, category: 'Messages', type: 'Message', icon: 'bx-message-rounded', iconClass: 'ml-icon-info', title: 'Customer Message', text: 'David Lee replied to your message regarding the bulk order.', time: 'Apr 23, 2025', statusText: 'Read', statusClass: 'ml-icon-info', unread: false },
        { id: 12, category: 'Orders', type: 'Order', icon: 'bx-cart', iconClass: 'ml-icon-primary', title: 'Order Cancelled', text: 'Order #ORD-1035 was cancelled by the customer.', time: 'Apr 22, 2025', statusText: 'Alert', statusClass: 'ml-icon-danger', unread: false }
    ];

    // --- State Variables ---
    let currentFilter = 'All';
    let searchQuery = '';
    let currentPage = 1;
    const itemsPerPage = 10;

    // --- DOM Elements ---
    const listContainer = document.getElementById('ml-noti-list');
    const emptyState = document.getElementById('ml-noti-empty');
    const searchInput = document.getElementById('ml-noti-search-input');
    const markAllBtn = document.getElementById('ml-noti-mark-all');
    const mainTabsContainer = document.getElementById('ml-noti-main-tabs');
    const sidebarTabsContainer = document.getElementById('ml-noti-sidebar-filters');
    const paginationContainer = document.getElementById('ml-noti-pagination');
    const pageInfo = document.getElementById('ml-noti-page-info');
    const pageNumbers = document.getElementById('ml-noti-page-numbers');
    const prevBtn = document.getElementById('ml-noti-prev');
    const nextBtn = document.getElementById('ml-noti-next');
    const toast = document.getElementById('ml-toast');

    // Init
    renderApp();

    // --- Event Listeners ---

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        currentPage = 1;
        renderApp();
    });

    // Mark all as read
    markAllBtn.addEventListener('click', () => {
        let hasUnread = false;
        notifications.forEach(n => {
            if(n.unread) {
                n.unread = false;
                hasUnread = true;
            }
        });
        
        if (hasUnread) {
            renderApp();
            showToast('All notifications marked as read');
        }
    });

    // Filter Tabs (Main Header)
    mainTabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.ml-noti-tab');
        if (tab) {
            currentFilter = tab.getAttribute('data-filter');
            currentPage = 1;
            renderApp();
        }
    });

    // Filter Tabs (Sidebar)
    sidebarTabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('li');
        if (tab) {
            currentFilter = tab.getAttribute('data-filter');
            currentPage = 1;
            renderApp();
        }
    });

    // Pagination
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderApp();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        const maxPages = Math.ceil(getFilteredData().length / itemsPerPage);
        if (currentPage < maxPages) {
            currentPage++;
            renderApp();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Dynamic document clicks for Action Menus and Item Clicks
    document.addEventListener('click', (e) => {
        
        // 1. Close all dropdowns if clicking outside
        if (!e.target.closest('.ml-noti-menu-container')) {
            document.querySelectorAll('.ml-noti-dropdown.show').forEach(menu => {
                menu.classList.remove('show');
                menu.previousElementSibling.classList.remove('active');
            });
        }

        // 2. Three dot menu toggle
        const menuBtn = e.target.closest('.ml-noti-menu-btn');
        if (menuBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close others
            document.querySelectorAll('.ml-noti-dropdown.show').forEach(menu => {
                if(menu !== menuBtn.nextElementSibling) {
                    menu.classList.remove('show');
                    menu.previousElementSibling.classList.remove('active');
                }
            });

            // Toggle current
            const dropdown = menuBtn.nextElementSibling;
            dropdown.classList.toggle('show');
            menuBtn.classList.toggle('active');
            return;
        }

        // 3. Dropdown Actions
        const actionBtn = e.target.closest('.ml-noti-action-btn');
        if (actionBtn) {
            e.stopPropagation();
            const id = parseInt(actionBtn.getAttribute('data-id'));
            const action = actionBtn.getAttribute('data-action');
            
            handleItemAction(id, action, actionBtn.closest('.ml-noti-item'));
            return;
        }

        // 4. Click notification to view (marks as read)
        const item = e.target.closest('.ml-noti-item');
        if (item && !e.target.closest('.ml-noti-menu-container')) {
            const id = parseInt(item.getAttribute('data-id'));
            handleItemAction(id, 'view', item);
        }

        // 5. Quick Actions sidebar
        const quickAction = e.target.closest('.ml-action-btn');
        if (quickAction) {
            const text = quickAction.querySelector('span').innerText;
            showToast(`Opening: ${text}...`);
        }

        // 6. Promo button
        const promoBtn = e.target.closest('.ml-noti-btn-promo');
        if (promoBtn) {
            showToast('Navigating to Farm settings...');
        }
    });

    // --- Core Functions ---

    function renderApp() {
        updateCountsAndSyncTabs();
        
        const filteredData = getFilteredData();
        
        if (filteredData.length === 0) {
            listContainer.style.display = 'none';
            paginationContainer.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            listContainer.style.display = 'flex';
            paginationContainer.style.display = 'flex';
            
            renderList(filteredData);
            renderPagination(filteredData.length);
        }
    }

    function getFilteredData() {
        return notifications.filter(n => {
            const matchFilter = currentFilter === 'All' || n.category === currentFilter;
            const matchSearch = n.title.toLowerCase().includes(searchQuery) || 
                                n.text.toLowerCase().includes(searchQuery) ||
                                n.category.toLowerCase().includes(searchQuery);
            return matchFilter && matchSearch;
        });
    }

    function updateCountsAndSyncTabs() {
        // Calculate
        const counts = {
            All: notifications.length,
            Orders: notifications.filter(n => n.category === 'Orders').length,
            Messages: notifications.filter(n => n.category === 'Messages').length,
            System: notifications.filter(n => n.category === 'System').length,
            Unread: notifications.filter(n => n.unread).length
        };

        // Update Badges
        document.querySelectorAll('.ml-total-badge').forEach(el => el.innerText = counts.All);
        document.querySelectorAll('.ml-orders-badge').forEach(el => el.innerText = counts.Orders);
        document.querySelectorAll('.ml-msgs-badge').forEach(el => el.innerText = counts.Messages);
        document.querySelectorAll('.ml-sys-badge').forEach(el => el.innerText = counts.System);

        // Update Summary Card
        document.getElementById('summary-total').innerText = counts.All;
        document.getElementById('summary-unread').innerText = counts.Unread;
        document.getElementById('summary-orders').innerText = counts.Orders;
        document.getElementById('summary-system').innerText = counts.System;

        // Sync Active Tabs visually
        document.querySelectorAll('.ml-noti-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-filter') === currentFilter);
        });
        document.querySelectorAll('.ml-noti-sidebar-filters li').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-filter') === currentFilter);
        });
    }

    function renderList(data) {
        listContainer.innerHTML = '';
        
        // Paginate slice
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);

        paginatedData.forEach(item => {
            const notiEl = document.createElement('div');
            notiEl.className = `ml-noti-item ${item.unread ? 'unread' : ''}`;
            notiEl.setAttribute('data-id', item.id);
            
            notiEl.innerHTML = `
                <div class="ml-noti-item-icon ${item.iconClass}">
                    <i class='bx ${item.icon}'></i>
                </div>
                <div class="ml-noti-content">
                    <div class="ml-noti-title">
                        <h4>${item.title}</h4>
                        ${item.unread ? `<span class="ml-unread-dot"></span>` : ''}
                    </div>
                    <p>${item.text}</p>
                </div>
                <div class="ml-noti-meta">
                    <span class="ml-noti-time">${item.time}</span>
                    <span class="ml-status-pill ${item.statusClass}" style="color: inherit; background: transparent; padding: 0;">${item.statusText}</span>
                    
                    <div class="ml-noti-menu-container">
                        <button class="ml-noti-menu-btn" title="More options">
                            <i class='bx bx-dots-vertical-rounded'></i>
                        </button>
                        <div class="ml-noti-dropdown">
                            <button class="ml-noti-action-btn" data-id="${item.id}" data-action="toggle-read">
                                <i class='bx ${item.unread ? 'bx-envelope-open' : 'bx-envelope'}'></i>
                                Mark as ${item.unread ? 'read' : 'unread'}
                            </button>
                            <button class="ml-noti-action-btn" data-id="${item.id}" data-action="view">
                                <i class='bx bx-right-top-arrow-circle'></i> View details
                            </button>
                            <button class="ml-noti-action-btn ml-delete-action" data-id="${item.id}" data-action="delete">
                                <i class='bx bx-trash'></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            listContainer.appendChild(notiEl);
        });
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Hide/Show logic
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }

        // Info text
        const start = ((currentPage - 1) * itemsPerPage) + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        pageInfo.innerText = `Showing ${start} – ${end} of ${totalItems} notifications`;

        // Buttons state
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        // Render Numbers
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `ml-noti-page-num ${i === currentPage ? 'active' : ''}`;
            btn.innerText = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderApp();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pageNumbers.appendChild(btn);
        }
    }

    function handleItemAction(id, action, DOMElement) {
        const index = notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        if (action === 'delete') {
            // Animation
            DOMElement.classList.add('deleting');
            
            setTimeout(() => {
                notifications.splice(index, 1);
                
                // Adjust pagination if deleted last item on current page
                const filtered = getFilteredData();
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                if (currentPage > totalPages && currentPage > 1) {
                    currentPage = totalPages;
                }
                
                renderApp();
                showToast('Notification deleted');
            }, 300); // Matches CSS animation duration
        } 
        else if (action === 'toggle-read') {
            notifications[index].unread = !notifications[index].unread;
            renderApp();
        }
        else if (action === 'view') {
            // Mark read if unread
            if (notifications[index].unread) {
                notifications[index].unread = false;
                renderApp();
            }
            showToast(`Opening details for: ${notifications[index].title}`);
        }
    }

    // --- Utilities ---
    let toastTimeout;
    function showToast(message) {
        toast.innerText = message;
        toast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

});
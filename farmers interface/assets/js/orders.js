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
// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initial Dataset matching screenshot details exactly
    const ordersData = [
        {
            id: "#ORD-1042",
            date: "Apr 28, 2025",
            time: "10:24 AM",
            customer: {
                name: "Sarah Johnson",
                email: "sarah@email.com",
                phone: "+234 801 234 5678",
                avatar: "../assets/images/avatars/avatar-01.jpg"
            },
            productsSummary: "Tomatoes (2kg), Lettuce (1 bunch) +1 more",
            productsCategory: "Tomatoes",
            productsThumb: "../assets/images/products/plum-tomato.jpg",
            total: 28.50,
            status: "Pending",
            pickupDate: "Apr 28, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Green Valley Farm Stall",
            items: [
                { name: "Tomatoes", qty: "2 kg × $4.00", price: 8.00, img: "../assets/images/products/plum-tomato.jpg" },
                { name: "Lettuce", qty: "1 bunch × $2.50", price: 2.50, img: "../assets/images/products/lettuce-heads.jpg" },
                { name: "Carrots", qty: "1 kg × $3.00", price: 3.00, img: "../assets/images/products/carrots.jpg" },
                { name: "Fresh Eggs", qty: "1 dozen × $4.00", price: 4.00, img: "../assets/images/products/brown-eggs.jpg" }
            ]
        },
        {
            id: "#ORD-1041",
            date: "Apr 27, 2025",
            time: "02:15 PM",
            customer: {
                name: "Michael Brown",
                email: "michael@email.com",
                phone: "+234 802 345 6789",
                avatar: "../assets/images/avatars/avatar-02.jpg"
            },
            productsSummary: "Carrots (3kg), Eggs (1 dozen)",
            productsCategory: "Carrots",
            productsThumb: "../assets/images/products/carrots.jpg",
            total: 22.00,
            status: "Accepted",
            pickupDate: "Apr 29, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Main Market Stall",
            items: [
                { name: "Carrots", qty: "3 kg × $3.00", price: 9.00, img: "../assets/images/products/carrots.jpg" },
                { name: "Fresh Eggs", qty: "1 dozen × $4.00", price: 4.00, img: "../assets/images/products/brown-eggs.jpg" }
            ]
        },
        {
            id: "#ORD-1040",
            date: "Apr 27, 2025",
            time: "11:30 AM",
            customer: {
                name: "Emily Davis",
                email: "emily@email.com",
                phone: "+234 803 456 7890",
                avatar: "../assets/images/avatars/avatar-03.jpg"
            },
            productsSummary: "Lettuce (2kg), Spinach (1kg)",
            productsCategory: "Lettuce",
            productsThumb: "../assets/images/products/lettuce-heads.jpg",
            total: 16.75,
            status: "Completed",
            pickupDate: "Apr 27, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Green Valley Farm Stall",
            items: [
                { name: "Lettuce", qty: "2 kg × $2.50", price: 5.00, img: "../assets/images/products/lettuce-heads.jpg" }
            ]
        },
        {
            id: "#ORD-1039",
            date: "Apr 26, 2025",
            time: "09:10 AM",
            customer: {
                name: "James Wilson",
                email: "james@email.com",
                phone: "+234 804 567 8901",
                avatar: "../assets/images/avatars/avatar-04.jpg"
            },
            productsSummary: "Potatoes (5kg), Onions (2kg)",
            productsCategory: "Potatoes",
            productsThumb: "../assets/images/products/potatoes.jpg",
            total: 24.50,
            status: "Accepted",
            pickupDate: "Apr 28, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Main Market Stall",
            items: [
                { name: "Potatoes", qty: "5 kg × $2.50", price: 12.50, img: "../assets/images/products/potatoes.jpg" }
            ]
        },
        {
            id: "#ORD-1038",
            date: "Apr 26, 2025",
            time: "04:05 PM",
            customer: {
                name: "Linda Martinez",
                email: "linda@email.com",
                phone: "+234 805 678 9012",
                avatar: "../assets/images/avatars/avatar-05.jpg"
            },
            productsSummary: "Bananas (2kg), Apples (1kg)",
            productsCategory: "Bananas",
            productsThumb: "../assets/images/products/bananas.jpg",
            total: 12.00,
            status: "Pending",
            pickupDate: "Apr 29, 2025",
            pickupTime: "1:00 PM - 4:00 PM",
            pickupLocation: "Green Valley Farm Stall",
            items: [
                { name: "Bananas", qty: "2 kg × $3.00", price: 6.00, img: "../assets/images/products/bananas.jpg" }
            ]
        },
        {
            id: "#ORD-1037",
            date: "Apr 25, 2025",
            time: "01:20 PM",
            customer: {
                name: "David Clark",
                email: "david@email.com",
                phone: "+234 806 789 0123",
                avatar: "../assets/images/avatars/avatar-06.jpg"
            },
            productsSummary: "Cabbage (2kg), Green Pepper (1kg)",
            productsCategory: "Tomatoes",
            productsThumb: "../assets/images/products/plum-tomato.jpg",
            total: 18.50,
            status: "Cancelled",
            pickupDate: "Apr 26, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Main Market Stall",
            items: [
                { name: "Cabbage", qty: "2 kg × $4.00", price: 8.00, img: "../assets/images/products/plum-tomato.jpg" }
            ]
        },
        {
            id: "#ORD-1036",
            date: "Apr 25, 2025",
            time: "10:00 AM",
            customer: {
                name: "Sophia Lee",
                email: "sophia@email.com",
                phone: "+234 807 890 1234",
                avatar: "../assets/images/avatars/avatar-01.jpg"
            },
            productsSummary: "Sweet Potatoes (3kg), Carrots (1kg)",
            productsCategory: "Carrots",
            productsThumb: "../assets/images/products/carrots.jpg",
            total: 15.75,
            status: "Completed",
            pickupDate: "Apr 25, 2025",
            pickupTime: "8:00 AM - 12:00 PM",
            pickupLocation: "Green Valley Farm Stall",
            items: [
                { name: "Carrots", qty: "1 kg × $3.00", price: 3.00, img: "../assets/images/products/carrots.jpg" }
            ]
        },
        {
            id: "#ORD-1035",
            date: "Apr 24, 2025",
            time: "03:45 PM",
            customer: {
                name: "Daniel Harris",
                email: "daniel@email.com",
                phone: "+234 808 901 2345",
                avatar: "../assets/images/avatars/avatar-02.jpg"
            },
            productsSummary: "Green Pepper (2kg), Tomatoes (1kg)",
            productsCategory: "Tomatoes",
            productsThumb: "../assets/images/products/plum-tomato.jpg",
            total: 14.20,
            status: "Pending",
            pickupDate: "Apr 27, 2025",
            pickupTime: "1:00 PM - 4:00 PM",
            pickupLocation: "Main Market Stall",
            items: [
                { name: "Tomatoes", qty: "1 kg × $4.00", price: 4.00, img: "../assets/images/products/plum-tomato.jpg" }
            ]
        }
    ];

    let selectedOrderId = "#ORD-1042";

    // DOM Elements
    const tableBody = document.getElementById('ordersTableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const productFilter = document.getElementById('productFilter');
    const detailPanel = document.getElementById('orderDetailPanel');

    // Filter Logic
    function getFilteredOrders() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;
        const selectedProduct = productFilter.value;

        return ordersData.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(query) ||
                                  order.customer.name.toLowerCase().includes(query) ||
                                  order.productsSummary.toLowerCase().includes(query);

            const matchesStatus = (selectedStatus === 'All') || (order.status === selectedStatus);
            const matchesProduct = (selectedProduct === 'All') || (order.productsCategory === selectedProduct);

            return matchesSearch && matchesStatus && matchesProduct;
        });
    }

    // Render Orders Table
    function renderTable() {
        const filtered = getFilteredOrders();
        tableBody.innerHTML = '';

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: var(--color-text-muted);">
                        <i class='bx bx-search-alt' style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                        No orders found matching your criteria.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(order => {
            const tr = document.createElement('tr');
            if (order.id === selectedOrderId) {
                tr.classList.add('selected-row');
            }

            const badgeClass = `badge-${order.status.toLowerCase()}`;

            tr.innerHTML = `
                <td>
                    <div class="order-id-cell">
                        <strong>${order.id}</strong>
                        <span>${order.date}</span>
                    </div>
                </td>
                <td>
                    <div class="customer-cell">
                        <img class="customer-avatar" src="${order.customer.avatar}" alt="${order.customer.name}">
                        <div class="customer-info">
                            <strong>${order.customer.name}</strong>
                            <span>${order.customer.email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="product-cell">
                        <img class="product-thumb" src="${order.productsThumb}" alt="Product">
                        <span class="product-desc">${order.productsSummary}</span>
                    </div>
                </td>
                <td><strong>$${order.total.toFixed(2)}</strong></td>
                <td><span class="status-badge ${badgeClass}">${order.status}</span></td>
                <td>
                    <div class="pickup-cell">
                        <strong>${order.pickupDate}</strong>
                        <span>${order.pickupTime}</span>
                    </div>
                </td>
                <td>
                    <button class="btn-view" onclick="selectOrder('${order.id}')">View</button>
                </td>
            `;

            tr.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-view')) {
                    selectOrder(order.id);
                }
            });

            tableBody.appendChild(tr);
        });

        document.getElementById('paginationInfo').innerText = `Showing 1 - ${filtered.length} of ${ordersData.length} orders`;
    }

    // Select and Render Right Side Detail Panel
    window.selectOrder = function(orderId) {
        selectedOrderId = orderId;
        renderTable();
        renderDetailPanel();
    };

    function renderDetailPanel() {
        const order = ordersData.find(o => o.id === selectedOrderId);
        if (!order) {
            detailPanel.innerHTML = '<div style="padding:20px; text-align:center;">Select an order to view details.</div>';
            return;
        }

        const badgeClass = `badge-${order.status.toLowerCase()}`;

        detailPanel.innerHTML = `
            <div class="detail-header-banner">
                <div>
                    <h3>Order ${order.id}</h3>
                    <p>Placed on ${order.date} at ${order.time}</p>
                </div>
                <span class="status-badge ${badgeClass}">${order.status}</span>
            </div>

            <div class="detail-content">
                <!-- Customer Info -->
                <div class="customer-card-box">
                    <img src="${order.customer.avatar}" alt="${order.customer.name}">
                    <div class="customer-card-info">
                        <h4>${order.customer.name}</h4>
                        <p><i class='bx bx-envelope'></i> ${order.customer.email}</p>
                        <p><i class='bx bx-phone'></i> ${order.customer.phone}</p>
                    </div>
                </div>

                <!-- Pickup Slot -->
                <div class="pickup-info-grid">
                    <div class="pickup-box">
                        <i class='bx bx-calendar'></i>
                        <div>
                            <p>Pickup Date & Time</p>
                            <strong>${order.pickupDate}</strong>
                            <small>${order.pickupTime}</small>
                        </div>
                    </div>
                    <div class="pickup-box">
                        <i class='bx bx-map-pin'></i>
                        <div>
                            <p>Pickup Location</p>
                            <strong>Green Valley Farm</strong>
                            <small>${order.pickupLocation}</small>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="items-section">
                    <h4>Order Items</h4>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="item-row">
                                <img src="${item.img}" alt="${item.name}">
                                <div class="item-details">
                                    <strong>${item.name}</strong>
                                    <span>${item.qty}</span>                                 </div>                                 <span class="item-price">$${item.price.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Total -->
                <div class="total-row">
                    <span>Total Amount</span>
                    <strong>$${order.total.toFixed(2)}</strong>
                </div>

                <!-- Actions -->
                <div class="action-buttons-grid">
                    <button class="btn-action btn-accept" onclick="updateOrderStatus('${order.id}', 'Accepted')">
                        <i class='bx bx-check'></i> Accept Order
                    </button>
                    <button class="btn-action btn-decline" onclick="updateOrderStatus('${order.id}', 'Cancelled')">
                        <i class='bx bx-x'></i> Decline
                    </button>
                    <button class="btn-action btn-slot" onclick="alert('Slot update modal opened')">
                        <i class='bx bx-time'></i> Update Pickup Slot
                    </button>
                    <button class="btn-action btn-cancel" onclick="updateOrderStatus('${order.id}', 'Cancelled')">
                        <i class='bx bx-trash'></i> Cancel Order
                    </button>
                </div>
            </div>
        `;
    }

    // Update Order Status Action
    window.updateOrderStatus = function(orderId, newStatus) {
        const order = ordersData.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            updateKPIs();
            renderTable();
            renderDetailPanel();
        }
    };

    // Update KPI counters dynamically based on state
    function updateKPIs() {
        const pending = ordersData.filter(o => o.status === 'Pending').length;
        const accepted = ordersData.filter(o => o.status === 'Accepted').length;
        const cancelled = ordersData.filter(o => o.status === 'Cancelled').length;

        document.getElementById('kpiTotalOrders').innerText = ordersData.length;
        document.getElementById('kpiPending').innerText = pending;
        document.getElementById('kpiAccepted').innerText = accepted;
        document.getElementById('kpiCancelled').innerText = cancelled;
    }

    // Quick filter click on KPI cards
    document.querySelectorAll('.kpi-card[data-filter-status]').forEach(card => {
        card.addEventListener('click', () => {
            const status = card.getAttribute('data-filter-status');
            statusFilter.value = status;
            renderTable();
        });
    });

    // Event Listeners for search and drop downs
    searchInput.addEventListener('input', renderTable);
    statusFilter.addEventListener('change', renderTable);
    productFilter.addEventListener('change', renderTable);

    // Initial Execution
    updateKPIs();
    renderTable();
    renderDetailPanel();
});
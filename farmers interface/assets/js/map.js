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
/* =========================================================
   MARKETLINK - MAP & LOCATIONS PAGE JAVASCRIPT
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 1. FRONTEND DATA (Farmers & Markets)
    // ---------------------------------------------------------
    const locationsData = [
        {
            id: 'f1',
            type: 'farmer',
            name: 'Green Valley Farm',
            verified: true,
            category: 'Vegetables, fruits & herbs',
            rating: 4.8,
            reviews: 128,
            locationName: 'Kaduna, Nigeria',
            avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=150&q=80',
            lat: 10.5350,
            lng: 7.4200
        },
        {
            id: 'm1',
            type: 'market',
            name: 'Tudun Wada Market',
            verified: false,
            category: 'Fresh produce, local goods',
            rating: 4.6,
            reviews: 96,
            locationName: 'Tudun Wada, Kaduna',
            avatar: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=150&q=80',
            lat: 10.5120,
            lng: 7.4280
        },
        {
            id: 'f2',
            type: 'farmer',
            name: 'Blessed Hands Farm',
            verified: true,
            category: 'Organic vegetables & fruits',
            rating: 4.9,
            reviews: 72,
            locationName: 'Sabon Tasha, Kaduna',
            avatar: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=150&q=80',
            lat: 10.4800,
            lng: 7.4500
        },
        {
            id: 'm2',
            type: 'market',
            name: 'Kaduna Central Market',
            verified: false,
            category: 'Fruits, vegetables, grains',
            rating: 4.5,
            reviews: 164,
            locationName: 'Kaduna Central',
            avatar: '../assets/images/products/veg-basket.jpg',
            lat: 10.5250,
            lng: 7.4420
        },
        {
            id: 'f3',
            type: 'farmer',
            name: 'Sunrise Farms',
            verified: false,
            category: 'Poultry, dairy & fresh produce',
            rating: 4.7,
            reviews: 54,
            locationName: 'Kawo, Kaduna',
            avatar: '../assets/images/products/roma-basket.jpg',
            lat: 10.5600,
            lng: 7.4000
        },
        {
            id: 'm3',
            type: 'market',
            name: 'Kawo Market',
            verified: false,
            category: 'Wholesale produce & livestock',
            rating: 4.4,
            reviews: 142,
            locationName: 'Kawo, Kaduna',
            avatar: '../assets/images/products/veg-basket.jpg',
            lat: 10.5700,
            lng: 7.4450
        },
        {
            id: 'f4',
            type: 'farmer',
            name: 'Fresh Land Farms',
            verified: true,
            category: 'Grains, legumes & tubers',
            rating: 4.6,
            reviews: 89,
            locationName: 'Rigasa, Kaduna',
            avatar: '../assets/images/products/plum-tomato.jpg',
            lat: 10.5100,
            lng: 7.3700
        },
        {
            id: 'm4',
            type: 'market',
            name: 'Sabon Tasha Market',
            verified: false,
            category: 'Local foodstuffs & spices',
            rating: 4.7,
            reviews: 81,
            locationName: 'Sabon Tasha, Kaduna',
            avatar: '../assets/images/products/roma-basket.jpg',
            lat: 10.4650,
            lng: 7.4600
        }
    ];

    // ---------------------------------------------------------
    // 2. STATE MANAGEMENT
    // ---------------------------------------------------------
    let userCoords = { lat: 10.5105, lng: 7.4165 }; // Default centered on Kaduna
    let activeFilter = 'all';
    let selectedDistance = 10; // Default 10km radius
    let searchQuery = '';
    let selectedLocationId = null;

    let map = null;
    let markersMap = new Map();
    let userMarker = null;
    let activeTileLayer = null;

    // Tile Provider Configs
    const tileProviders = {
        map: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };

    // ---------------------------------------------------------
    // 3. HAVERSINE DISTANCE CALCULATION (KM)
    // ---------------------------------------------------------
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    }

    // ---------------------------------------------------------
    // 4. LEAFLET ASSET DYNAMIC LOADER
    // ---------------------------------------------------------
    function loadLeafletDependencies(callback) {
        if (window.L) {
            callback();
            return;
        }

        // Dynamically load Leaflet CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Dynamically load Leaflet JS
        const jsScript = document.createElement('script');
        jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        jsScript.onload = callback;
        document.head.appendChild(jsScript);
    }

    // ---------------------------------------------------------
    // 5. INITIALIZE MAP & CONTROLS
    // ---------------------------------------------------------
    function initMap() {
        const mapContainer = document.getElementById('ml-interactive-map');
        if (!mapContainer) return;

        // Create Leaflet Instance
        map = L.map('ml-interactive-map', {
            zoomControl: false
        }).setView([userCoords.lat, userCoords.lng], 12);

        // Custom Zoom Position
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Add Default Base Tile Layer
        activeTileLayer = L.tileLayer(tileProviders.map, {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Render Current User Location Marker
        renderUserLocationMarker();

        // Render Locations
        updateDisplay();
    }

    // Render User Pulse Marker
    function renderUserLocationMarker() {
        if (!map) return;
        if (userMarker) map.removeLayer(userMarker);

        const userIcon = L.divIcon({
            className: 'ml-user-marker-wrapper',
            html: `<div class="ml-user-pulse-marker"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
    }

    // ---------------------------------------------------------
    // 6. FILTERING ENGINE & RENDER
    // ---------------------------------------------------------
    function getFilteredLocations() {
        return locationsData.map(loc => {
            const dist = calculateDistance(userCoords.lat, userCoords.lng, loc.lat, loc.lng);
            return { ...loc, computedDistance: dist };
        }).filter(loc => {
            // Type Filter
            if (activeFilter !== 'all' && loc.type !== activeFilter) return false;

            // Distance Filter
            if (selectedDistance !== 'all' && loc.computedDistance > Number(selectedDistance)) return false;

            // Search Query Filter
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const matchName = loc.name.toLowerCase().includes(q);
                const matchCat = loc.category.toLowerCase().includes(q);
                const matchLoc = loc.locationName.toLowerCase().includes(q);
                if (!matchName && !matchCat && !matchLoc) return false;
            }

            return true;
        }).sort((a, b) => a.computedDistance - b.computedDistance);
    }

    function updateDisplay() {
        const filteredData = getFilteredLocations();

        // Update Count Indicator
        const countEl = document.getElementById('ml-results-count');
        if (countEl) countEl.textContent = `${filteredData.length} found`;

        // Render Map Markers & Sidebar Cards
        renderMarkers(filteredData);
        renderSideCards(filteredData);
    }

    // ---------------------------------------------------------
    // 7. MARKERS RENDERING & POPUPS
    // ---------------------------------------------------------
    function renderMarkers(locations) {
        if (!map) return;

        // Clear Existing Markers
        markersMap.forEach(marker => map.removeLayer(marker));
        markersMap.clear();

        locations.forEach(loc => {
            const isFarmer = loc.type === 'farmer';
            const pinClass = isFarmer ? 'ml-pin-farmer' : 'ml-pin-market';
            const iconClass = isFarmer ? 'bx-leaf' : 'bx-store-alt';

            const customIcon = L.divIcon({
                className: 'ml-marker-container',
                html: `
                    <div class="ml-custom-pin ${pinClass}">
                        <i class='bx ${iconClass}'></i>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

            // Create Interactive Popup
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
            const popupHtml = `
                <div class="ml-popup-card">
                    <div class="ml-popup-header">
                        <span class="ml-popup-title">${loc.name}</span>
                        ${loc.verified ? `<i class='bx bx-check-circle' style='color: var(--color-success)'></i>` : ''}
                    </div>
                    <div class="ml-popup-category">${loc.category}</div>
                    <div style="font-size:0.8rem; color: var(--color-text-muted);">
                        <i class='bx bx-map-pin'></i> ${loc.locationName} (${loc.computedDistance} km)
                    </div>
                    <div class="ml-popup-actions">
                        <a href="${directionsUrl}" target="_blank" class="ml-popup-btn primary" style="text-decoration:none;">
                            <i class='bx bx-directions'></i> Directions
                        </a>
                    </div>
                </div>
            `;

            marker.bindPopup(popupHtml);

            marker.on('click', () => {
                selectLocationCard(loc.id);
            });

            markersMap.set(loc.id, marker);
        });
    }

    // ---------------------------------------------------------
    // 8. SIDEBAR CARDS RENDERING
    // ---------------------------------------------------------
    function renderSideCards(locations) {
        const listContainer = document.getElementById('ml-location-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (locations.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:30px; color:var(--color-text-muted);">
                    <i class='bx bx-search-alt' style="font-size:2.5rem; margin-bottom:8px;"></i>
                    <p style="margin:0; font-size:0.9rem;">No farmers or markets match your criteria.</p>
                </div>
            `;
            return;
        }

        locations.forEach(loc => {
            const isFarmer = loc.type === 'farmer';
            const card = document.createElement('div');
            card.className = `ml-card-item ${selectedLocationId === loc.id ? 'is-selected' : ''}`;
            card.dataset.id = loc.id;

            card.innerHTML = `
                <img src="${loc.avatar}" alt="${loc.name}" class="ml-card-avatar">
                <div class="ml-card-body">
                    <div class="ml-card-title-row">
                        <h4 class="ml-card-name">${loc.name}</h4>
                        ${loc.verified ? `<i class='bx bx-check-circle ml-badge-verified' title="Verified"></i>` : ''}
                        <span class="ml-badge-type ${loc.type}">${isFarmer ? 'Farmer' : 'Market'}</span>
                    </div>
                    <div class="ml-card-meta">${loc.category}</div>
                    <div class="ml-card-stats">
                        <span class="ml-rating-box"><i class='bx bxs-star'></i> ${loc.rating} (${loc.reviews})</span>
                        <span>•</span>
                        <span><i class='bx bx-map-pin'></i> ${loc.computedDistance} km</span>
                    </div>
                </div>
                <i class='bx bx-chevron-right ml-card-arrow'></i>
            `;

            card.addEventListener('click', () => {
                highlightLocationOnMap(loc);
            });

            listContainer.appendChild(card);
        });
    }

    // Handle Selection Interactions
    function highlightLocationOnMap(loc) {
        selectedLocationId = loc.id;

        // Highlight Active Card
        document.querySelectorAll('.ml-card-item').forEach(c => c.classList.remove('is-selected'));
        const selectedCard = document.querySelector(`.ml-card-item[data-id="${loc.id}"]`);
        if (selectedCard) selectedCard.classList.add('is-selected');

        // Pan Map & Open Popup
        if (map && markersMap.has(loc.id)) {
            const marker = markersMap.get(loc.id);
            map.flyTo([loc.lat, loc.lng], 14, { duration: 1 });
            marker.openPopup();
        }
    }

    function selectLocationCard(locId) {
        selectedLocationId = locId;
        document.querySelectorAll('.ml-card-item').forEach(c => c.classList.remove('is-selected'));
        const selectedCard = document.querySelector(`.ml-card-item[data-id="${locId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('is-selected');
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ---------------------------------------------------------
    // 9. EVENT LISTENERS & CONTROLS
    // ---------------------------------------------------------

    // Map vs Satellite Switcher
    const mapSwitchBtn = document.getElementById('ml-btn-map');
    const satelliteSwitchBtn = document.getElementById('ml-btn-satellite');

    if (mapSwitchBtn && satelliteSwitchBtn) {
        mapSwitchBtn.addEventListener('click', () => {
            if (activeTileLayer) map.removeLayer(activeTileLayer);
            activeTileLayer = L.tileLayer(tileProviders.map, { attribution: '&copy; OpenStreetMap' }).addTo(map);
            mapSwitchBtn.classList.add('active');
            satelliteSwitchBtn.classList.remove('active');
        });

        satelliteSwitchBtn.addEventListener('click', () => {
            if (activeTileLayer) map.removeLayer(activeTileLayer);
            activeTileLayer = L.tileLayer(tileProviders.satellite, { attribution: '&copy; Esri' }).addTo(map);
            satelliteSwitchBtn.classList.add('active');
            mapSwitchBtn.classList.remove('active');
        });
    }

    // Filter Tabs (All / Farmers / Markets)
    const filterTabs = document.querySelectorAll('.ml-tab-btn');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            updateDisplay();
        });
    });

    // Distance Selector Filter
    const distanceSelect = document.getElementById('ml-distance-select');
    if (distanceSelect) {
        distanceSelect.addEventListener('change', (e) => {
            selectedDistance = e.target.value;
            updateDisplay();
        });
    }

    // Live Search Input Filter
    const searchInput = document.getElementById('ml-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Browser Geolocation Trigger ("Use My Location")
    const locateBtn = document.getElementById('ml-locate-me-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locateBtn.classList.add('bx-spin');
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userCoords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        const locText = document.getElementById('ml-current-location-text');
                        if (locText) locText.textContent = 'Your Exact Location';
                        
                        renderUserLocationMarker();
                        map.flyTo([userCoords.lat, userCoords.lng], 13);
                        updateDisplay();
                        locateBtn.classList.remove('bx-spin');
                    },
                    (error) => {
                        alert('Unable to retrieve your location. Showing default region.');
                        locateBtn.classList.remove('bx-spin');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });
    }

    // Floating Global Directions Trigger
    const globalDirBtn = document.getElementById('ml-global-directions-btn');
    if (globalDirBtn) {
        globalDirBtn.addEventListener('click', () => {
            if (selectedLocationId) {
                const loc = locationsData.find(l => l.id === selectedLocationId);
                if (loc) {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
                    return;
                }
            }
            // Fallback: Directions to general center
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${userCoords.lat},${userCoords.lng}`, '_blank');
        });
    }

    // Bootstrap Map Initialization
    loadLeafletDependencies(initMap);

});
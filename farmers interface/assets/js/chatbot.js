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
    // --- Elements ---
    const chatBody = document.getElementById('ml-chat-body');
    const chatInput = document.getElementById('ml-chat-input');
    const sendBtn = document.getElementById('ml-send-btn');
    const attachBtn = document.getElementById('ml-attach-btn');
    const fileInput = document.getElementById('ml-file-input');
    const previewArea = document.getElementById('ml-attachment-preview-area');
    const newChatBtn = document.getElementById('ml-new-chat-btn');
    const dropOverlay = document.getElementById('ml-drop-overlay');
    const welcomeContainer = document.getElementById('ml-welcome-container');
    
    const imageModal = document.getElementById('ml-image-modal');
    const modalImg = document.getElementById('ml-modal-img');
    const modalClose = document.getElementById('ml-modal-close');

    // --- State ---
    let pendingFile = null;
    let pendingFileType = null;
    let pendingFileDataUrl = null;
    let isWaitingForBot = false;

    // --- Database of Simulated Responses ---
    const botResponses = [
        {
            keywords: ['add', 'new product', 'create product'],
            response: `To add a new product, follow these simple steps:<br><br>
                <ol>
                    <li>Go to the <b>My Products</b> section in the sidebar.</li>
                    <li>Click the <b>Add Product</b> button.</li>
                    <li>Fill in the details (name, category, price, quantity, etc.).</li>
                    <li>Click <b>Save</b> and your product will be live!</li>
                </ol>
                Need help with anything else? You can tell me what kind of product you're adding and I can guide you step by step!`
        },
        {
            keywords: ['pickup slots', 'set pickup', 'manage times'],
            response: `You can set your pickup slots easily:<br><br>
                <ul>
                    <li>Navigate to <b>Pickup Slots</b> in the sidebar.</li>
                    <li>Click <b>Add Slot</b>.</li>
                    <li>Choose the date, time, and location.</li>
                    <li>Save your slot. It will now be visible to customers at checkout.</li>
                </ul>
                This helps customers know exactly when to collect their fresh produce.`
        },
        {
            keywords: ['orders', 'check orders', 'see my orders'],
            response: `To check your orders, simply click on the <b>Orders</b> tab in your main dashboard sidebar.<br><br>
                From there, you can view pending, fulfilled, and cancelled orders, as well as update order statuses as they are picked up.`
        },
        {
            keywords: ['sales', 'insights', 'performance', 'check my sales'],
            response: `Your sales insights are located in the <b>Sales Insights</b> section. <br><br>
                You'll find detailed charts showing your revenue over time, top-selling products, and customer trends. It's a great way to plan next season's crop!`
        },
        {
            keywords: ['profile', 'update profile', 'settings'],
            response: `To update your profile or change settings, click on your avatar in the top right corner and select <b>Settings</b>. You can update your farm's description, contact details, and payout methods there.`
        }
    ];

    const fallbackResponse = `I'm not exactly sure how to answer that just yet, but I'm constantly learning! <br><br>Try asking me about <b>adding products</b>, managing <b>pickup slots</b>, or checking your <b>orders</b>.`;

    // --- Auto-Resize Textarea ---
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        sendBtn.disabled = chatInput.value.trim() === '' && !pendingFile;
    });

    // --- Input Keydown handling ---
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // --- Button Actions ---
    sendBtn.addEventListener('click', handleSend);
    attachBtn.addEventListener('click', () => fileInput.click());
    newChatBtn.addEventListener('click', resetChat);

    // --- File Attachment Handling ---
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    function processFile(file) {
        pendingFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            pendingFileDataUrl = e.target.result;
            pendingFileType = file.type.startsWith('image/') ? 'image' : 'file';
            renderAttachmentPreview();
            sendBtn.disabled = false;
        };
        
        reader.readAsDataURL(file);
    }

    function renderAttachmentPreview() {
        previewArea.innerHTML = '';
        const previewEl = document.createElement('div');
        previewEl.className = 'ml-attach-preview-item';
        
        if (pendingFileType === 'image') {
            previewEl.innerHTML = `<img src="${pendingFileDataUrl}" alt="Attachment">`;
        } else {
            previewEl.innerHTML = `<i class='bx bx-file'></i>`;
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-remove-attach';
        removeBtn.innerHTML = "<i class='bx bx-x'></i>";
        removeBtn.onclick = () => {
            pendingFile = null;
            pendingFileDataUrl = null;
            pendingFileType = null;
            previewArea.innerHTML = '';
            fileInput.value = '';
            sendBtn.disabled = chatInput.value.trim() === '';
        };

        previewEl.appendChild(removeBtn);
        previewArea.appendChild(previewEl);
    }

    // --- Drag and Drop ---
    chatBody.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropOverlay.classList.add('active');
    });

    chatBody.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropOverlay.classList.remove('active');
    });

    chatBody.addEventListener('drop', (e) => {
        e.preventDefault();
        dropOverlay.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    // --- Core Chat Functions ---
    function handleSend() {
        const text = chatInput.value.trim();
        if (!text && !pendingFile) return;
        if (isWaitingForBot) return;

        // Hide welcome container if present
        if (welcomeContainer) welcomeContainer.style.display = 'none';

        // Add user message
        appendMessage(text, 'user', pendingFileType, pendingFileDataUrl, pendingFile?.name);
        
        // Reset input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = true;
        
        // Reset attachment
        pendingFile = null;
        pendingFileDataUrl = null;
        pendingFileType = null;
        previewArea.innerHTML = '';
        fileInput.value = '';

        // Trigger Bot
        isWaitingForBot = true;
        const typingEl = appendTypingIndicator();
        scrollToBottom();

        // Simulate network delay
        setTimeout(() => {
            typingEl.remove();
            const responseText = getBotResponse(text);
            appendMessage(responseText, 'bot');
            isWaitingForBot = false;
        }, 1200 + Math.random() * 800); // Realistic 1.2 - 2s delay
    }

    function appendMessage(text, sender, attachmentType = null, attachmentUrl = null, fileName = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ml-message ${sender}-message`;
        
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let avatarHtml = '';
        if (sender === 'bot') {
            avatarHtml = `<div class="ml-avatar bot-avatar"><i class='bx bx-bot'></i></div>`;
        } else {
            avatarHtml = `<div class="ml-avatar user-avatar"><i class='bx bx-user'></i></div>`;
        }

        let attachmentHtml = '';
        if (attachmentType === 'image') {
            attachmentHtml = `<div class="ml-msg-attachment"><img src="${attachmentUrl}" class="ml-chat-image-trigger" alt="Uploaded Image"></div>`;
        } else if (attachmentType === 'file') {
            attachmentHtml = `<div class="ml-msg-attachment ml-msg-file-card"><i class='bx bxs-file-doc'></i> <span>${fileName}</span></div>`;
        }

        let actionsHtml = '';
        if (sender === 'bot') {
            actionsHtml = `
                <div class="ml-msg-actions">
                    <button class="ml-msg-action-btn ml-copy-btn" title="Copy"><i class='bx bx-copy'></i> <span>Copy</span></button>
                    <button class="ml-msg-action-btn ml-thumb-btn" title="Helpful"><i class='bx bx-like'></i></button>
                    <button class="ml-msg-action-btn ml-thumb-btn" title="Not helpful"><i class='bx bx-dislike'></i></button>
                </div>
            `;
        }

        msgDiv.innerHTML = `
            ${avatarHtml}
            <div class="ml-message-content-wrapper">
                <div class="ml-message-bubble">
                    ${attachmentHtml}
                    ${text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
                ${actionsHtml}
                <span class="ml-message-time">${timeString} ${sender === 'user' ? "<i class='bx bx-check-double'></i>" : ""}</span>
            </div>
        `;

        chatBody.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ml-message bot-message`;
        msgDiv.innerHTML = `
            <div class="ml-avatar bot-avatar"><i class='bx bx-bot'></i></div>
            <div class="ml-message-content-wrapper">
                <div class="ml-message-bubble ml-typing-indicator">
                    <div class="ml-dot"></div><div class="ml-dot"></div><div class="ml-dot"></div>
                </div>
            </div>
        `;
        chatBody.appendChild(msgDiv);
        return msgDiv;
    }

    function getBotResponse(userText) {
        if (!userText) return "I received your file. How can I help you with it?";
        
        const lowerText = userText.toLowerCase();
        for (const item of botResponses) {
            if (item.keywords.some(kw => lowerText.includes(kw))) {
                return item.response;
            }
        }
        return fallbackResponse;
    }

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function resetChat() {
        // Clear all except overlay and welcome container
        const elementsToRemove = chatBody.querySelectorAll('.ml-message:not(#ml-welcome-container .ml-message)');
        elementsToRemove.forEach(el => el.remove());
        
        if (welcomeContainer) {
            welcomeContainer.style.display = 'block';
        }
        scrollToBottom();
    }

    // --- Interactive Delegations (Copy, Thumbs, Image Modal) ---
    chatBody.addEventListener('click', (e) => {
        
        // Image Modal trigger
        if (e.target.classList.contains('ml-chat-image-trigger')) {
            modalImg.src = e.target.src;
            imageModal.classList.add('active');
        }

        // Copy button
        const copyBtn = e.target.closest('.ml-copy-btn');
        if (copyBtn) {
            const bubble = copyBtn.closest('.ml-message-content-wrapper').querySelector('.ml-message-bubble');
            const textToCopy = bubble.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const icon = copyBtn.querySelector('i');
                const span = copyBtn.querySelector('span');
                icon.className = 'bx bx-check';
                span.innerText = 'Copied';
                setTimeout(() => {
                    icon.className = 'bx bx-copy';
                    span.innerText = 'Copy';
                }, 2000);
            });
        }

        // Thumbs feedback
        const thumbBtn = e.target.closest('.ml-thumb-btn');
        if (thumbBtn) {
            // Toggle active class (front-end only)
            const siblings = thumbBtn.parentElement.querySelectorAll('.ml-thumb-btn');
            siblings.forEach(btn => btn.classList.remove('active'));
            thumbBtn.classList.add('active');
        }
    });

    // Modal Close
    modalClose.addEventListener('click', () => {
        imageModal.classList.remove('active');
        setTimeout(() => { modalImg.src = ''; }, 300); // Clear after transition
    });
    
    // Close modal on outside click
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
        }
    });

    // --- External / Sidebar Triggers ---
    // Handle suggestion buttons, quick action cards, and popular questions
    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-prompt]');
        if (trigger) {
            const promptText = trigger.getAttribute('data-prompt');
            chatInput.value = promptText;
            handleSend();
            
            // On mobile, scroll to top to see the chat
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

});
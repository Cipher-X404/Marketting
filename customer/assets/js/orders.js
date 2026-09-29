document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const orderLists = {
        'active': document.getElementById('tab-active'),
        'completed': document.getElementById('tab-completed'),
        'all': document.getElementById('tab-all')
    };
    const emptyState = document.getElementById('empty-state');

    // Populate "All" tab by cloning active and completed
    const allTab = document.getElementById('tab-all');
    if (orderLists.active && orderLists.completed && allTab) {
        allTab.innerHTML = orderLists.active.innerHTML + orderLists.completed.innerHTML;
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');

            // Hide all lists
            Object.values(orderLists).forEach(list => {
                if (list) list.classList.add('hidden');
            });

            const targetList = orderLists[targetTab];
            
            // Check if there are elements in the target list
            const hasOrders = targetList && targetList.querySelectorAll('.order-card').length > 0;

            if (hasOrders) {
                targetList.classList.remove('hidden');
                emptyState.classList.add('hidden');
            } else {
                emptyState.classList.remove('hidden');
            }
        });
    });
});

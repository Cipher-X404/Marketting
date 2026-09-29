document.addEventListener('DOMContentLoaded', () => {
    const modeToggle = document.getElementById('modeToggle');
    const roleToggle = document.getElementById('roleToggle');
    const roleDesc = document.getElementById('roleDesc');
    const submitBtn = document.getElementById('submitBtn');
    const body = document.body;

    const customerVisual = document.querySelector('.customer-visual');
    const farmerVisual = document.querySelector('.farmer-visual');
    const pwdToggle = document.querySelector('.pwd-toggle');
    const pwdInput = document.getElementById('password');

    let isLogin = false;
    let isFarmer = false;

    // Toggle Mode (Signup / Login)
    modeToggle.addEventListener('click', () => {
        isLogin = !isLogin;
        const modeText = modeToggle.querySelector('span');
        
        if (isLogin) {
            modeText.textContent = 'log in';
            body.classList.remove('mode-signup');
            body.classList.add('mode-login');
            submitBtn.textContent = 'Access account';
            
            // Adjust required attributes based on mode
            document.querySelectorAll('.show-signup input').forEach(el => el.removeAttribute('required'));
        } else {
            modeText.textContent = 'sign up';
            body.classList.remove('mode-login');
            body.classList.add('mode-signup');
            submitBtn.textContent = isFarmer ? 'Register farm' : 'Create my account';
            
            // Re-apply required fields based on role
            updateRequiredFields();
        }
    });

    // Toggle Role (Customer / Farmer)
    roleToggle.addEventListener('click', () => {
        isFarmer = !isFarmer;
        const roleText = roleToggle.querySelector('span');
        
        if (isFarmer) {
            roleText.textContent = 'farmer';
            body.classList.remove('role-customer');
            body.classList.add('role-farmer');
            roleDesc.textContent = 'List your upcoming harvests, set your own farm-gate prices, and secure pre-orders before you cut.';
            if (!isLogin) submitBtn.textContent = 'Register farm';
            
            customerVisual.classList.remove('active');
            farmerVisual.classList.add('active');
        } else {
            roleText.textContent = 'customer';
            body.classList.remove('role-farmer');
            body.classList.add('role-customer');
            roleDesc.textContent = 'Reserve fresh harvests directly from local farms. No middlemen, no markups.';
            if (!isLogin) submitBtn.textContent = 'Create my account';
            
            farmerVisual.classList.remove('active');
            customerVisual.classList.add('active');
        }
        
        if (!isLogin) {
            updateRequiredFields();
        }
    });

    function updateRequiredFields() {
        // Clear all signup required fields first
        document.querySelectorAll('.show-signup input, .show-signup select').forEach(el => el.removeAttribute('required'));
        
        // Add back required to the active role
        if (isFarmer) {
            document.querySelectorAll('.show-farmer input, .show-farmer select').forEach(el => el.setAttribute('required', 'true'));
        } else {
            document.querySelectorAll('.show-customer input').forEach(el => el.setAttribute('required', 'true'));
        }
    }

    // Initialize required fields
    updateRequiredFields();

    // Toggle Password Visibility
    pwdToggle.addEventListener('click', () => {
        const type = pwdInput.type === 'password' ? 'text' : 'password';
        pwdInput.type = type;
        const icon = pwdToggle.querySelector('i');
        icon.className = type === 'password' ? 'bx bx-show' : 'bx bx-hide';
    });
});

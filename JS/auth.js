document.addEventListener('DOMContentLoaded', () => {
    // This script relies on `supabaseClient` being globally available from `supabase-client.js`

    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const authLinks = document.querySelectorAll('.auth-link');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    authLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-switch');
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeForm = document.getElementById(`${tabName}Form`);

        if (activeTab) activeTab.classList.add('active');
        if (activeForm) activeForm.classList.add('active');
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('authToast');
        toast.textContent = message;
        toast.className = `auth-toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

            try {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // Redirect is handled by onAuthStateChange in supabase-client.js
            } catch (error) {
                console.error('Login Error:', error);
                showToast(error.message || 'Error al iniciar sesión', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }
        });
    }

    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');

            if (password !== passwordConfirm) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }
            if (password.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            if (typeof hcaptcha !== 'undefined' && !hcaptcha.getResponse()) {
                showToast('Por favor completa el CAPTCHA', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

            try {
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                showToast('¡Cuenta creada! Revisa tu correo para confirmar.', 'success');
                 // Redirect is handled by onAuthStateChange in supabase-client.js
            } catch (error) {
                console.error('Register Error:', error);
                showToast(error.message || 'Error al crear la cuenta', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
                if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
            }
        });
    }
});

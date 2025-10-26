const { createClient } = supabase;

const supabaseClient = createClient(
    'https://caxatovfgotdikwuglsx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheGF0b3ZmZ290ZGlrd3VnbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODAwMTQsImV4cCI6MjA3NzA1NjAxNH0.nIqLaFqcwkIQ1wLdFDdxIq20r9sIqvdEAQzAcXsTYdY'
);

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

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        showToast('¡Inicio de sesión exitoso!', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showToast(error.message || 'Error al iniciar sesión', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
});

document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (password !== passwordConfirm) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    const captchaResponse = hcaptcha.getResponse();
    if (!captchaResponse) {
        showToast('Por favor completa el CAPTCHA', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        showToast('¡Cuenta creada exitosamente! Iniciando sesión...', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Error al registrarse:', error);
        showToast(error.message || 'Error al crear la cuenta', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
        hcaptcha.reset();
    }
});

(async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'index.html';
    }
})();

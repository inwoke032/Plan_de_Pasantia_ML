let isAuthenticated = false;

async function initializeApp() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }

    try {
        isAuthenticated = await checkAuth();

        if (isAuthenticated) {
            await AI.init();
            initializeEventListeners();
            updateUIWithUserInfo();
            loadUserApiKeyStatus();
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showToast('Error al cargar la aplicación', 'error');
    } finally {
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 500);
        }
    }
}

function initializeEventListeners() {
    const settingsBtn = document.getElementById('settingsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const testApiKeyBtn = document.getElementById('testApiKeyBtn');
    const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openModal(settingsModal);
            loadUserApiKeyStatus();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                await signOut();
            }
        });
    }

    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', async () => {
            const apiKeyInput = document.getElementById('geminiApiKey');
            const apiKey = apiKeyInput.value.trim();

            if (!apiKey) {
                showToast('Por favor ingresa una API Key', 'error');
                return;
            }

            if (!apiKey.startsWith('AIzaSy')) {
                showToast('La API Key parece inválida. Debe comenzar con "AIzaSy"', 'error');
                return;
            }

            saveApiKeyBtn.disabled = true;
            saveApiKeyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                await saveUserApiKey(apiKey);
                showToast('API Key guardada exitosamente', 'success');
                loadUserApiKeyStatus();
            } catch (error) {
                showToast('Error al guardar la API Key', 'error');
                console.error(error);
            } finally {
                saveApiKeyBtn.disabled = false;
                saveApiKeyBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Configuración';
            }
        });
    }

    if (testApiKeyBtn) {
        testApiKeyBtn.addEventListener('click', async () => {
            const apiKey = getUserApiKey();

            if (!apiKey) {
                showToast('Primero debes guardar una API Key', 'error');
                return;
            }

            testApiKeyBtn.disabled = true;
            testApiKeyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Probando...';

            try {
                const response = await AI.chat('Hola, responde con un simple "OK"');
                if (response) {
                    showToast('¡Conexión exitosa! La API Key funciona correctamente', 'success');
                }
            } catch (error) {
                showToast('Error: La API Key no es válida o no tiene permisos', 'error');
                console.error(error);
            } finally {
                testApiKeyBtn.disabled = false;
                testApiKeyBtn.innerHTML = '<i class="fas fa-vial"></i> Probar Conexión';
            }
        });
    }

    if (toggleApiKeyVisibility) {
        toggleApiKeyVisibility.addEventListener('click', () => {
            const apiKeyInput = document.getElementById('geminiApiKey');
            const icon = toggleApiKeyVisibility.querySelector('i');

            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                apiKeyInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modal) {
    let modalElement = modal;
    if (typeof modal === 'string') {
        modalElement = document.getElementById(modal);
    }

    if (modalElement) {
        modalElement.classList.remove('active');
    }
}

function updateUIWithUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userEmailEl = document.getElementById('userEmail');
        const userCreatedAtEl = document.getElementById('userCreatedAt');

        if (userEmailEl) {
            userEmailEl.textContent = user.email;
        }

        if (userCreatedAtEl && user.created_at) {
            const date = new Date(user.created_at);
            userCreatedAtEl.textContent = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

function loadUserApiKeyStatus() {
    const apiKey = getUserApiKey();
    const statusEl = document.getElementById('apiKeyStatus');
    const apiKeyInput = document.getElementById('geminiApiKey');

    if (apiKey) {
        statusEl.className = 'api-key-status configured';
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i><span>API Key configurada</span>';

        if (apiKeyInput) {
            apiKeyInput.value = apiKey;
        }
    } else {
        statusEl.className = 'api-key-status not-configured';
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Sin configurar</span>';

        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconClass = type === 'success' ? 'fa-check-circle' :
                     type === 'error' ? 'fa-exclamation-circle' :
                     'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 4000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

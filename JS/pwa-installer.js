let deferredPrompt;
// Crea y configura el botón de instalación
const installButton = document.createElement('button');
installButton.id = 'pwa-install-button';
installButton.className = 'pwa-install-btn btn btn-primary'; 
installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
installButton.style.display = 'none'; // Ocultar por defecto

// Asegura que el botón se agrega al DOM una vez que el HTML se haya cargado
document.addEventListener('DOMContentLoaded', () => {
    // Agrega el botón al cuerpo si no está ya presente
    if (!document.getElementById(installButton.id)) {
        document.body.appendChild(installButton);
    }
});


// 2. REGISTRO Y GESTIÓN DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
    // Registra el Service Worker después de que la página haya cargado
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado exitosamente. Alcance:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('Nueva versión de la PWA disponible. Por favor, recargue la página.');
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                console.error('❌ Error al registrar el Service Worker:', error);
            });
    });
}

// FUNCIÓN PARA DETECTAR iOS
function isIos() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

// FUNCIÓN PARA DETECTAR MODO STANDALONE (APP INSTALADA)
function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches;
}


window.addEventListener('load', () => {
    if (isIos() && !isInstalled()) {
        
        // Crea un mensaje o un banner flotante solo para usuarios de iPhone
        const iosInstallMessage = document.createElement('div');
        iosInstallMessage.id = 'ios-install-hint';
        iosInstallMessage.innerHTML = `
            <p>
                Para instalar esta App, pulsa el botón de **Compartir** (<img src="assets/images/share-icon-ios.png" alt="Icono de Compartir" style="height:1em; margin: 0 5px;">)
                y selecciona **'Añadir a pantalla de inicio'**.
            </p>
        `;
        // Asegúrate de darle estilos CSS (posición fija, color de fondo, etc.)
        iosInstallMessage.style.cssText = `
            position: fixed; 
            bottom: 20px; 
            width: 90%; 
            padding: 15px; 
            background: #4A90E2; 
            color: white; 
            text-align: center; 
            border-radius: 8px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
        `;
        document.body.appendChild(iosInstallMessage);
        
        // Ocultar este mensaje cuando la PWA se instale
        window.addEventListener('appinstalled', () => {
             iosInstallMessage.style.display = 'none';
        });

    } else if ('serviceWorker' in navigator) {
        // ... (código existente para registrar SW y mostrar el botón de deferredPrompt en Android/PC) ...
    }
// 3. EVENTOS DE INSTALACIÓN (A2HS)

// 3.1. Captura el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;

    // Muestra el botón solo si el prompt fue capturado y no está instalado
    if (window.matchMedia('(display-mode: standalone)').matches === false) {
        installButton.style.display = 'flex';
    }

    // 3.2. Maneja el clic del botón de instalación
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ Usuario aceptó instalar la PWA');
            } else {
                console.log('Usuario rechazó instalar la PWA');
            }

            deferredPrompt = null;
            installButton.style.display = 'none';
        }
    }, { once: true });
});

// 3.3. Oculta el botón si la PWA se instala exitosamente
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalada exitosamente');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

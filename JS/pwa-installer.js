let deferredPrompt;
// Crea y configura el botón de instalación
const installButton = document.createElement('button');
installButton.id = 'pwa-install-button';
installButton.className = 'pwa-install-btn btn btn-primary';
installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
installButton.style.display = 'none'; // Ocultar por defecto

// FUNCIÓN PARA DETECTAR iOS
function isIos() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

// FUNCIÓN PARA DETECTAR MODO STANDALONE (APP INSTALADA)
function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

// Asegura que el botón se agrega al DOM una vez que el HTML se haya cargado
document.addEventListener('DOMContentLoaded', () => {
    // Agrega el botón al cuerpo si no está ya presente
    if (!document.getElementById(installButton.id)) {
        document.body.appendChild(installButton);
    }
});


// 2. LÓGICA PRINCIPAL DE LA PWA (Service Worker, Instalación, y Detección de Plataforma)
window.addEventListener('load', () => {
    
    // A) Lógica para iOS (solo mensaje instructivo)
    if (isIos() && !isInstalled()) {
        
        const iosInstallMessage = document.createElement('div');
        iosInstallMessage.id = 'ios-install-hint';
        iosInstallMessage.innerHTML = `
            <p>
                Para instalar esta App, pulsa el botón de <b>Compartir</b> (<img src="/${REPO_NAME}/assets/images/share-icon-ios.png" alt="Icono de Compartir" style="height:1em; margin: 0 5px;">)
                y selecciona <b>'Añadir a pantalla de inicio'</b>.
            </p>
        `;
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
        
        window.addEventListener('appinstalled', () => {
             iosInstallMessage.style.display = 'none';
        });

    // B) Lógica para Service Worker y deferredPrompt (Android/PC)
    } else if ('serviceWorker' in navigator) {
        
        // 2.1 REGISTRO Y GESTIÓN DEL SERVICE WORKER
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado exitosamente.');

                // Función para mostrar notificación de actualización
                const showUpdateNotification = () => {
                    const notification = document.createElement('div');
                    notification.id = 'pwa-update-notification';
                    notification.innerHTML = `
                        <span>Nueva versión disponible</span>
                        <button id="pwa-reload-button" class="btn btn-small">Actualizar</button>
                    `;
                    notification.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        padding: 12px 20px;
                        background-color: #333;
                        color: white;
                        border-radius: 8px;
                        z-index: 1001;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    `;
                    document.body.appendChild(notification);

                    document.getElementById('pwa-reload-button').addEventListener('click', () => {
                        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                    });
                };

                // Lógica de actualización
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                if (registration.waiting) {
                                    showUpdateNotification();
                                }
                            }
                        });
                    }
                });

                // Controlar el cambio de controlador para recargar la página
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            })
            .catch((error) => {
                console.error('❌ Error al registrar el Service Worker:', error);
            });
            
        // 2.2 GESTIÓN DEL BOTÓN DE INSTALACIÓN (deferredPrompt)

        // Captura el evento beforeinstallprompt (solo en navegadores compatibles)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            if (!isInstalled()) { 
                installButton.style.display = 'flex';
            }
        });

        // Maneja el clic del botón de instalación
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

        // Oculta el botón si la PWA se instala exitosamente
        window.addEventListener('appinstalled', () => {
            console.log('🎉 PWA instalada exitosamente');
            if (installButton) {
                installButton.style.display = 'none';
            }
        });
    }
});


// 1. REGISTRO Y GESTIÓN DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
    // Registra el Service Worker después de que la página haya cargado
    window.addEventListener('load', () => {
        // Asegúrate de que la ruta sea correcta desde la raíz del servidor
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado exitosamente. Alcance:', registration.scope);

                // Escucha si hay una nueva versión del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            // Si el nuevo trabajador está instalado y hay un controlador activo
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Aquí puedes mostrar una notificación al usuario para que recargue y use la nueva versión
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


// 2. GESTIÓN DEL BOTÓN DE INSTALACIÓN (A2HS - Add to Home Screen)
let deferredPrompt;

// Crea y configura el botón de instalación
const installButton = document.createElement('button');
installButton.id = 'pwa-install-button'; // Añadimos un ID para fácil referencia
// Usamos clases para estilos CSS definidos en tu style.css
installButton.className = 'pwa-install-btn btn btn-primary'; 
installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
installButton.style.display = 'none'; // Ocultar por defecto

// 2.1. Captura el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Previene que el navegador muestre su propio mensaje de instalación
    e.preventDefault(); 
    // Guarda el evento para poder llamarlo después
    deferredPrompt = e;

    // Solo muestra el botón si no está instalado y se puede mostrar el prompt
    if (window.matchMedia('(display-mode: standalone)').matches === false) {
        installButton.style.display = 'flex';
        // Asegura que solo haya un botón y lo agrega al cuerpo
        if (!document.getElementById('pwa-install-button')) {
             document.body.appendChild(installButton);
        }
    }

    // 2.2. Maneja el clic del botón de instalación
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Muestra el prompt de instalación nativo
            deferredPrompt.prompt();

            // Espera a que el usuario decida (aceptar o rechazar)
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ Usuario aceptó instalar la PWA');
            } else {
                console.log('Usuario rechazó instalar la PWA');
            }

            // El prompt ya se usó, no puede volver a llamarse
            deferredPrompt = null;
            // Oculta el botón después del intento
            installButton.style.display = 'none';
        }
    }, { once: true }); // Usamos { once: true } para remover el listener después del click
});

// 2.3. Oculta el botón si la PWA se instala exitosamente
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalada exitosamente');
    // Asegúrate de que el botón se oculta
    if (installButton) {
        installButton.style.display = 'none';
    }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado exitosamente:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nueva versión disponible');
            }
          });
        });
      })
      .catch((error) => {
        console.log('Error al registrar el Service Worker:', error);
      });
  });
}

let deferredPrompt;
const installButton = document.createElement('button');
installButton.className = 'pwa-install-btn';
installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
installButton.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installButton.style.display = 'flex';
  document.body.appendChild(installButton);

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
      } else {
        console.log('Usuario rechazó instalar la PWA');
      }

      deferredPrompt = null;
      installButton.style.display = 'none';
    }
  });
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalada exitosamente');
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Registro del Service Worker y chequeo de actualizaciones.
export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error('No se pudo registrar el Service Worker:', err);
  });
}

// Pide a los Service Workers ya registrados que busquen una versión nueva de sw.js.
export function actualizarServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });
}

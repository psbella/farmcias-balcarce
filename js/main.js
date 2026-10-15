import { cargarDatos } from './data.js';
import { initMaps, limpiarMarcadores, agregarMarcadores, mapDesktop, mapMobile, markersDesktop, markersMobile } from './maps.js';
import { mostrarFarmacias } from './ui.js';
import { initTheme, setupThemeSwitch } from './theme.js';
import { setupInstallPWA } from './install.js';
import { agregarBotonIrArriba } from './scroll-top.js';
import { registrarServiceWorker, actualizarServiceWorkers } from './sw-update.js';

// Exponer mapas y marcadores como getters
Object.defineProperty(window, 'mapDesktop', { get: () => mapDesktop });
Object.defineProperty(window, 'mapMobile', { get: () => mapMobile });
Object.defineProperty(window, 'markersDesktop', { get: () => markersDesktop });
Object.defineProperty(window, 'markersMobile', { get: () => markersMobile });

// Exponer globalmente lo que necesitan otros módulos o la consola
window.initMaps = initMaps;
window.limpiarMarcadores = limpiarMarcadores;
window.agregarMarcadores = agregarMarcadores;
window.mostrarFarmacias = mostrarFarmacias;

// Inicialización
(async () => {
  registrarServiceWorker();
  actualizarServiceWorkers();
  initTheme();
  setupThemeSwitch();
  setupInstallPWA();
  const ok = await cargarDatos();
  if (ok) mostrarFarmacias();
  agregarBotonIrArriba();
})();

// Cerrar sheet
const closeSheetBtn = document.getElementById('closeSheet');
if (closeSheetBtn) {
  closeSheetBtn.onclick = () => document.getElementById('mapSheet').classList.remove('open');
}

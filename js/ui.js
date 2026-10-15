import { farmacias, limpiarTelefono, tieneCoordenadas } from './data.js';
import { CONFIG } from './config.js';
import { escapeHtml } from './escape.js';
import { agregarMarcadores, urlGoogleMaps, mapDesktop, mapMobile, markersDesktop, markersMobile } from './maps.js';

let activeCard = null;

export function pad(n) { return String(n).padStart(2, '0'); }

export function getLocationIcon() {
  return `<span class="icon-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span>`;
}

export function getPhoneIcon() {
  return `<span class="icon-phone"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="var(--accent)"/></svg></span>`;
}

function crearTarjeta(f, i) {
  const div = document.createElement('div');
  div.className = 'card';
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', `Ver detalles de ${f.nombre}`);

  const tClean = limpiarTelefono(f.telefono);
  const tLink = tClean ? `<a href="tel:${tClean}" class="phone-link" onclick="event.stopPropagation();">${getPhoneIcon()} ${escapeHtml(f.telefono)}</a>` : `<span class="phone-link">${getPhoneIcon()} Sin teléfono</span>`;

  div.innerHTML = `<div class="card-num">${pad(i + 1)}</div>
    <div class="card-info">
      <div class="card-name">${escapeHtml(f.nombre)}</div>
      <div class="card-address">${getLocationIcon()} ${escapeHtml(f.direccion)}</div>
    </div>
    <div class="card-phone">${tLink}</div>`;

  const activarTarjeta = (e) => {
    if (e.target.closest('.phone-link')) return;

    // Sin coordenadas cargadas no hay pin en nuestro mapa: se abre Google Maps.
    if (!tieneCoordenadas(f)) {
      window.open(urlGoogleMaps(f.direccion), '_blank', 'noopener');
      return;
    }

    const c = [f.lat, f.lng];
    const esEscritorio = window.innerWidth >= 768;

    if (esEscritorio) {
      if (mapDesktop && markersDesktop[i]) {
        markersDesktop[i].openPopup();
        mapDesktop.setView(c, 16);
      }
      setTimeout(() => {
        const mapElement = document.getElementById('map-desktop');
        if (mapElement) {
          const yOffset = -80;
          const y = mapElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    } else {
      const sheet = document.getElementById('mapSheet');
      document.getElementById('sheetName').innerHTML = `${escapeHtml(f.nombre)}<br><small style="font-size:12px">${escapeHtml(f.direccion)}</small>`;
      sheet.classList.add('open');
      if (mapMobile) {
        mapMobile.setView(c, 16);
        if (markersMobile[i]) markersMobile[i].openPopup();
      }
    }

    if (activeCard) activeCard.classList.remove('active');
    div.classList.add('active');
    activeCard = div;
  };

  div.onclick = activarTarjeta;
  div.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activarTarjeta(e);
    }
  };

  return div;
}

export function mostrarFarmacias() {
  const intro = document.getElementById('intro');
  const lista = document.getElementById('lista');

  if (!farmacias.length) {
    intro.innerHTML = `<span>Sin farmacias registradas</span>`;
    lista.innerHTML = '<div class="card">Sin farmacias registradas</div>';
    return;
  }

  intro.innerHTML = `<div class="intro-line"><span class="icon-intro"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--accent)"/><circle cx="12" cy="9" r="3" fill="white"/></svg></span><span>Farmacias en <strong>${escapeHtml(CONFIG.CIUDAD)}</strong></span></div><div class="stats"><span class="icon-stats"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L10 17L20 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span><span>${farmacias.length} farmacias</span></div>`;

  lista.innerHTML = '';
  farmacias.forEach((f, i) => lista.appendChild(crearTarjeta(f, i)));
  agregarMarcadores(farmacias);
}

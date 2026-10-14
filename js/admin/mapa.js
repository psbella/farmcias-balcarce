// Mapa Leaflet, vista embebida de Google Maps y búsqueda de dirección (Nominatim).
import { $ } from './dom.js';
import { state } from './state.js';
import { setEstado } from './estado.js';
import { CENTRO_MDP, SUFIJO_CIUDAD } from './config.js';

const iconoFarmacia = L.divIcon({
  className: 'custom-pharmacy-icon',
  html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#1a7f37" stroke="white" stroke-width="1.5"/><path d="M12 7L12 13M9 10L15 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>',
  iconSize: [34, 34],
  popupAnchor: [0, -17],
});

const iconoResultado = L.divIcon({
  className: 'custom-google-icon',
  html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4" stroke="white" stroke-width="1.5"/><circle cx="12" cy="9" r="3" fill="white"/></svg>',
  iconSize: [34, 34],
  popupAnchor: [0, -17],
});

const urlGmaps = (direccion) =>
  `https://www.google.com/maps?q=${encodeURIComponent(direccion + SUFIJO_CIUDAD)}&output=embed&z=16`;

function crearPopupFarmacia(f) {
  const cont = document.createElement('div');
  const b = document.createElement('b');
  b.textContent = f.nombre;
  const small = document.createElement('small');
  small.textContent = 'Arrastrá para corregir';
  cont.append(b, document.createElement('br'), f.direccion, document.createElement('br'), small);
  return cont;
}

// ---------- Leaflet ----------

// farmacias.js registra acá qué hacer cuando se arrastra el pin
// (así mapa.js no importa farmacias.js y no hay dependencia circular).
let onMarcadorMovido = () => {};
export function alMoverMarcador(fn) { onMarcadorMovido = fn; }

export function actualizarMapa(f) {
  if (!state.map) {
    state.map = L.map('map').setView(CENTRO_MDP, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(state.map);
  }
  if (state.marker) state.map.removeLayer(state.marker);
  if (state.markerResultado) state.map.removeLayer(state.markerResultado);

  const lat = parseFloat($('input-lat').value);
  const lng = parseFloat($('input-lng').value);
  const pos = (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : CENTRO_MDP;

  state.marker = L.marker(pos, { draggable: true, icon: iconoFarmacia }).addTo(state.map);
  state.marker.bindPopup(crearPopupFarmacia(f)).openPopup();
  state.marker.on('dragend', () => {
    const newPos = state.marker.getLatLng();
    $('input-lat').value = newPos.lat.toFixed(6);
    $('input-lng').value = newPos.lng.toFixed(6);
    onMarcadorMovido();
  });

  state.map.setView(pos, 16);
}

export function moverMarcador(lat, lng) {
  if (state.marker) state.marker.setLatLng([lat, lng]);
}

// ---------- Pestañas Leaflet / Google Maps ----------

function setVista(vista) {
  const esGmaps = vista === 'gmaps';
  state.vista = vista;
  $('map').classList.toggle('oculto', esGmaps);
  $('gmaps-frame').classList.toggle('oculto', !esGmaps);
  $('tab-leaflet').classList.toggle('activa', !esGmaps);
  $('tab-gmaps').classList.toggle('activa', esGmaps);
  if (!esGmaps && state.map) state.map.invalidateSize();
}

export function actualizarGoogleMaps() {
  const f = state.farmacias[state.index];
  if (f && f.direccion && state.vista === 'gmaps') {
    $('gmaps-frame').src = urlGmaps(f.direccion);
  }
}

export function initTabs() {
  $('tab-leaflet').addEventListener('click', () => setVista('leaflet'));
  $('tab-gmaps').addEventListener('click', () => {
    const f = state.farmacias[state.index];
    if (!f || !f.direccion) return;
    $('gmaps-frame').src = urlGmaps(f.direccion);
    setVista('gmaps');
  });
}

// ---------- Búsqueda de dirección (Nominatim / OpenStreetMap) ----------

function crearPopupResultado(displayName, lat, lng, targetIndex) {
  const cont = document.createElement('div');
  const b = document.createElement('b');
  b.textContent = 'Resultado';
  const small = document.createElement('small');
  small.textContent = '¿Usar estas coordenadas?';
  const btn = document.createElement('button');
  btn.className = 'btn-usar';
  btn.textContent = 'Usar estas';
  btn.addEventListener('click', () => usarCoordenadasResultado(lat, lng, targetIndex));
  cont.append(
    b, document.createElement('br'),
    displayName, document.createElement('br'),
    small, document.createElement('br'),
    btn
  );
  return cont;
}

export async function buscarDireccion() {
  const targetIndex = state.index;
  const f = state.farmacias[targetIndex];
  if (!f || !f.direccion) return;

  const queries = [
    f.direccion + SUFIJO_CIUDAD,
    f.direccion.replace(/AV\.? ?/i, 'Avenida ') + SUFIJO_CIUDAD,
    f.direccion + ', Mar del Plata',
    f.direccion,
  ];

  let data = null;
  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ar`;
    try {
      const response = await fetch(url);
      data = await response.json();
      if (data.length > 0) break;
    } catch (e) { continue; }
  }

  if (data && data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (state.markerResultado) state.map.removeLayer(state.markerResultado);
    state.markerResultado = L.marker([lat, lng], { icon: iconoResultado }).addTo(state.map);
    state.markerResultado.bindPopup(crearPopupResultado(data[0].display_name, lat, lng, targetIndex)).openPopup();

    setVista('leaflet');
    state.map.setView([lat, lng], 16);
    setEstado('Resultado encontrado. Compará con el pin verde.', 'info');
  } else {
    setEstado('No se encontró la dirección. Probá manualmente.', 'error');
  }
}

function usarCoordenadasResultado(lat, lng, targetIndex) {
  const f = state.farmacias[targetIndex];
  if (!f) return;
  f.lat = lat;
  f.lng = lng;
  if (targetIndex === state.index) {
    $('input-lat').value = lat.toFixed(6);
    $('input-lng').value = lng.toFixed(6);
    actualizarMapa(f);
  }
  setEstado(`Coordenadas aplicadas a ${f.nombre}.`, 'exito');
}

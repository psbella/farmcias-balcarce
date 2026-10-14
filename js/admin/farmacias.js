// Datos de las farmacias y edición de la farmacia actual.
import { $ } from './dom.js';
import { state } from './state.js';
import { setEstado } from './estado.js';
import { actualizarMapa, actualizarGoogleMaps, moverMarcador, alMoverMarcador } from './mapa.js';

export async function cargarFarmacias() {
  const res = await fetch('db.json');
  const ciclosData = await res.json();
  const unicas = new Map();
  for (const grupo in ciclosData) {
    for (const f of ciclosData[grupo]) {
      const key = `${f.nombre}|${f.direccion}`;
      if (!unicas.has(key)) {
        unicas.set(key, {
          nombre: f.nombre,
          direccion: f.direccion,
          telefono: f.telefono,
          lat: f.lat,
          lng: f.lng,
          keyOriginal: key,
        });
      }
    }
  }
  state.farmacias = Array.from(unicas.values());
  state.farmacias.sort((a, b) => a.nombre.localeCompare(b.nombre));
  poblarSelect();
  actualizarProgreso();
  mostrarFarmacia(0);
  setEstado('Editá los campos o arrastrá el pin.', 'info');
}

function poblarSelect() {
  const select = $('select-farmacia');
  select.replaceChildren(...state.farmacias.map((f, i) =>
    new Option(`${i + 1}. ${f.nombre} — ${f.direccion}`, i)
  ));
  select.addEventListener('change', (e) => irAFarmacia(parseInt(e.target.value, 10)));
}

function irAFarmacia(index) {
  actualizarFarmaciaDesdeCampos();
  state.index = index;
  mostrarFarmacia(index);
  actualizarProgreso();
}

function mostrarFarmacia(index) {
  const f = state.farmacias[index];
  if (!f) return;
  $('input-nombre').value = f.nombre || '';
  $('input-direccion').value = f.direccion || '';
  $('input-telefono').value = f.telefono || '';
  $('input-lat').value = f.lat != null ? f.lat.toFixed(6) : '';
  $('input-lng').value = f.lng != null ? f.lng.toFixed(6) : '';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = `${index + 1}/${state.farmacias.length}`;
  $('farm-nombre').replaceChildren(`${f.nombre || '?'} `, badge);

  $('select-farmacia').value = index;
  actualizarMapa(f);
  actualizarGoogleMaps();
}

/** Vuelca los campos del formulario a la farmacia actual (queda pendiente de guardar). */
export function actualizarFarmaciaDesdeCampos() {
  const f = state.farmacias[state.index];
  if (!f) return;
  f.nombre = $('input-nombre').value.trim();
  f.direccion = $('input-direccion').value.trim();
  f.telefono = $('input-telefono').value.trim();
  const lat = parseFloat($('input-lat').value);
  const lng = parseFloat($('input-lng').value);
  if (!isNaN(lat)) f.lat = lat;
  if (!isNaN(lng)) f.lng = lng;
  setEstado('Cambio pendiente. Usá "Guardar en GitHub" para publicarlo.', 'info');
}

export function siguiente() {
  actualizarFarmaciaDesdeCampos();
  if (state.index + 1 < state.farmacias.length) {
    state.index++;
    mostrarFarmacia(state.index);
    actualizarProgreso();
  } else {
    setEstado('Recorriste todas las farmacias. Guardá los cambios en GitHub.', 'info');
  }
}

export function anterior() {
  actualizarFarmaciaDesdeCampos();
  if (state.index - 1 >= 0) {
    state.index--;
    mostrarFarmacia(state.index);
    actualizarProgreso();
  }
}

function actualizarProgreso() {
  const porcentaje = (state.index / state.farmacias.length) * 100;
  $('progress-bar').style.width = `${porcentaje}%`;
}

/** Engancha los inputs del formulario y el arrastre del pin. */
export function bindCampos() {
  const campos = ['input-nombre', 'input-direccion', 'input-telefono', 'input-lat', 'input-lng'];
  campos.forEach((id) => {
    $(id).addEventListener('input', () => {
      actualizarFarmaciaDesdeCampos();
      const lat = parseFloat($('input-lat').value);
      const lng = parseFloat($('input-lng').value);
      if (!isNaN(lat) && !isNaN(lng)) moverMarcador(lat, lng);
    });
  });
  alMoverMarcador(actualizarFarmaciaDesdeCampos);
}

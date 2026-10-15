import { CONFIG } from './config.js';

// Lista plana de farmacias (db.json), ordenada alfabéticamente.
export let farmacias = [];

export function limpiarTelefono(t) {
  return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : String(t).replace(/\s/g, '');
}

export function tieneCoordenadas(f) {
  return Number.isFinite(f.lat) && Number.isFinite(f.lng);
}

export function ordenarFarmacias(lista) {
  return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function cargarDatos() {
  const intro = document.getElementById('intro');
  intro.innerHTML = '<span>Cargando datos...</span>';
  try {
    const r = await fetch(CONFIG.RUTA_JSON + '?t=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error('db.json no es una lista de farmacias');
    farmacias = ordenarFarmacias(data);
    return true;
  } catch (e) {
    console.error('Error al cargar db.json:', e);
    intro.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#f85149"/></svg> Error al cargar datos</span>';
    document.getElementById('lista').innerHTML = '<div class="card">No se pudieron cargar las farmacias</div>';
    return false;
  }
}

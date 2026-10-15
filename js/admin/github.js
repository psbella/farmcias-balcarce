// Serialización de db.json y guardado vía la Contents API de GitHub.
import { state } from './state.js';
import { setEstado } from './estado.js';
import { pedirLogin } from './auth.js';
import { actualizarFarmaciaDesdeCampos } from './farmacias.js';
import { GH_OWNER, GH_REPO, GH_PATH, GH_BRANCH, COMMIT_MESSAGE } from './config.js';

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/** Aplica las ediciones (state.farmacias) sobre la lista original de db.json. */
export function aplicarEdiciones(dbOriginal, farmacias) {
  return dbOriginal.map((farmacia) => {
    const key = `${farmacia.nombre}|${farmacia.direccion}`;
    const encontrada = farmacias.find((f) => f.keyOriginal === key);
    if (!encontrada) return farmacia;
    return {
      nombre: encontrada.nombre,
      direccion: encontrada.direccion,
      telefono: encontrada.telefono,
      lat: encontrada.lat,
      lng: encontrada.lng,
    };
  });
}

/** Serializa con el formato de db.json: una farmacia por línea, 2 espacios de sangría. */
export function serializarDb(lista) {
  const lineas = lista.map((f) => {
    const lat = f.lat != null ? f.lat : null;
    const lng = f.lng != null ? f.lng : null;
    return `  { "nombre": ${JSON.stringify(f.nombre)}, "direccion": ${JSON.stringify(f.direccion)}, "telefono": ${JSON.stringify(f.telefono)}, "lat": ${JSON.stringify(lat)}, "lng": ${JSON.stringify(lng)} }`;
  });
  return `[\n${lineas.join(',\n')}\n]\n`;
}

export async function guardarEnGitHub() {
  if (!state.token) {
    sessionStorage.removeItem('gh_token');
    pedirLogin();
    return;
  }

  actualizarFarmaciaDesdeCampos();
  const res = await fetch('db.json');
  const dbOriginal = await res.json();
  const jsonStr = serializarDb(aplicarEdiciones(dbOriginal, state.farmacias));

  setEstado('Guardando en GitHub...', 'cargando');

  try {
    const apiBase = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`;
    const headers = {
      'Authorization': `token ${state.token}`,
      'Accept': 'application/vnd.github+json',
    };

    const shaRes = await fetch(apiBase, { headers });
    if (shaRes.status === 401) {
      sessionStorage.removeItem('gh_token');
      throw new Error('Token invalido o sin permisos. Volvé a ingresarlo.');
    }
    if (!shaRes.ok) throw new Error(`No se pudo leer db.json (${shaRes.status}).`);
    const shaData = await shaRes.json();

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: COMMIT_MESSAGE,
        content: utf8ToBase64(jsonStr),
        sha: shaData.sha,
        branch: GH_BRANCH,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || `Error al guardar (${putRes.status}).`);
    }

    setEstado('Guardado en GitHub. El deploy tarda un par de minutos.', 'exito');
  } catch (e) {
    setEstado(e.message, 'error');
  }
}

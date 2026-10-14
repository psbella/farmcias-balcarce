// Serialización de db.json y guardado vía la Contents API de GitHub.
import { state } from './state.js';
import { setEstado } from './estado.js';
import { pedirLogin } from './auth.js';
import { actualizarFarmaciaDesdeCampos } from './farmacias.js';
import { GH_OWNER, GH_REPO, GH_PATH, GH_BRANCH, COMMIT_MESSAGE } from './config.js';

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/** Aplica las ediciones (state.farmacias) sobre la estructura original de db.json. */
export function aplicarEdiciones(dbOriginal, farmacias) {
  const ciclosData = {};
  for (const grupo in dbOriginal) {
    ciclosData[grupo] = [];
    for (const farmacia of dbOriginal[grupo]) {
      const key = `${farmacia.nombre}|${farmacia.direccion}`;
      const encontrada = farmacias.find((f) => f.keyOriginal === key);
      if (encontrada) {
        ciclosData[grupo].push({
          nombre: encontrada.nombre,
          direccion: encontrada.direccion,
          telefono: encontrada.telefono,
          lat: encontrada.lat,
          lng: encontrada.lng,
        });
      } else {
        ciclosData[grupo].push(farmacia);
      }
    }
  }
  return ciclosData;
}

/** Serializa con el mismo formato (2 espacios, un campo por línea) que usa db.json. */
export function serializarDb(ciclosData) {
  let jsonStr = '{\n';
  const grupos = Object.keys(ciclosData);
  grupos.forEach((grupo, idxGrupo) => {
    jsonStr += `  "${grupo}": [\n`;
    ciclosData[grupo].forEach((f, i) => {
      const lat = f.lat != null ? f.lat : null;
      const lng = f.lng != null ? f.lng : null;
      jsonStr += `    {\n`;
      jsonStr += `      "nombre": "${f.nombre.replace(/"/g, '\\"')}",\n`;
      jsonStr += `      "direccion": "${f.direccion.replace(/"/g, '\\"')}",\n`;
      jsonStr += `      "telefono": "${f.telefono}",\n`;
      jsonStr += `      "lat": ${lat},\n`;
      jsonStr += `      "lng": ${lng}\n`;
      jsonStr += `    }`;
      if (i < ciclosData[grupo].length - 1) jsonStr += ',';
      jsonStr += '\n';
    });
    jsonStr += '  ]';
    if (idxGrupo < grupos.length - 1) jsonStr += ',';
    jsonStr += '\n';
  });
  jsonStr += '}';
  return jsonStr;
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

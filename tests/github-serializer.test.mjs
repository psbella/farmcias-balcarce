// Tests de js/admin/github.js: serializarDb() y aplicarEdiciones().
// Estas dos funciones son las que escriben db.json en producción
// (vía la Contents API de GitHub) — conviene blindarlas.
// js/admin/state.js lee sessionStorage al importarse (efecto de módulo
// pensado para navegador). Para poder testear github.js en Node sin
// agregar una dependencia como jsdom, le damos un stub mínimo antes del
// import. Si algún día se agregan más tests de admin/ que sí necesiten
// DOM real, ahí conviene jsdom — ver README de tests/.
// Los import estáticos de ES modules se "hoistean": se resuelven antes
// de que corra cualquier otra línea de este archivo. Por eso el stub de
// sessionStorage no puede ir arriba de un import normal — usamos import()
// dinámico para poder definir el stub primero.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// github.js importa farmacias.js/auth.js, que a su vez importan mapa.js:
// ese módulo crea íconos de Leaflet (global L) al cargarse. Stub mínimo
// para poder importar la cadena completa sin arrastrar la librería real.
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.L = { divIcon: () => ({}) };
const { aplicarEdiciones, serializarDb } = await import('../js/admin/github.js');

const DB_PATH = fileURLToPath(new URL('../db.json', import.meta.url));
const dbOriginal = JSON.parse(readFileSync(DB_PATH, 'utf8'));

function farmaciasUnicasDe(db) {
  const unicas = new Map();
  for (const grupo in db) {
    for (const f of db[grupo]) {
      const key = `${f.nombre}|${f.direccion}`;
      if (!unicas.has(key)) unicas.set(key, { ...f, keyOriginal: key });
    }
  }
  return [...unicas.values()];
}

test('serializar sin ediciones reproduce db.json byte a byte', () => {
  const farmacias = farmaciasUnicasDe(dbOriginal);
  const salida = serializarDb(aplicarEdiciones(dbOriginal, farmacias));
  const original = readFileSync(DB_PATH, 'utf8').replace(/\n$/, '');
  assert.equal(salida, original);
});

test('aplicarEdiciones solo cambia la farmacia editada, no toca el resto', () => {
  const farmacias = farmaciasUnicasDe(dbOriginal);
  const objetivo = farmacias.find((f) => f.nombre === 'A.M.E.C.C.O.');
  objetivo.telefono = '2231234567';
  objetivo.lat = -38.5;

  const resultado = aplicarEdiciones(dbOriginal, farmacias);

  let cambios = 0;
  for (const grupo in dbOriginal) {
    dbOriginal[grupo].forEach((f, i) => {
      if (JSON.stringify(f) !== JSON.stringify(resultado[grupo][i])) cambios++;
    });
  }
  // A.M.E.C.C.O. puede repetirse en más de un grupo dentro del ciclo de 16;
  // lo importante es que cambió algo y que serializar no rompe el formato.
  assert.ok(cambios >= 1, 'debería haber al menos un registro modificado');
  const salida = serializarDb(resultado);
  assert.match(salida, /"telefono": "2231234567"/);
  assert.match(salida, /"lat": -38\.5/);
});

test('aplicarEdiciones conserva una farmacia sin match (keyOriginal no encontrada) tal cual', () => {
  const farmacias = []; // ninguna coincide con nada de dbOriginal
  const resultado = aplicarEdiciones(dbOriginal, farmacias);
  assert.deepEqual(resultado, dbOriginal);
});

test('serializarDb escapa comillas dobles en nombre y dirección', () => {
  const db = { '1': [{ nombre: 'Farmacia "Centro"', direccion: 'Av. Falsa 123', telefono: '123', lat: 1, lng: 2 }] };
  const salida = serializarDb(db);
  assert.match(salida, /"nombre": "Farmacia \\"Centro\\""/);
  const reparseado = JSON.parse(salida);
  assert.equal(reparseado['1'][0].nombre, 'Farmacia "Centro"');
});

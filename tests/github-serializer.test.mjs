// Tests de js/admin/github.js: serializarDb() y aplicarEdiciones().
// Estas dos funciones son las que escriben db.json en producción
// (vía la Contents API de GitHub) — conviene blindarlas.
// js/admin/state.js lee sessionStorage al importarse (efecto de módulo
// pensado para navegador). Para poder testear github.js en Node sin
// agregar una dependencia como jsdom, le damos un stub mínimo antes del
// import. Los import estáticos de ES modules se "hoistean", así que el
// stub no puede ir arriba de un import normal: usamos import() dinámico.
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
const textoOriginal = readFileSync(DB_PATH, 'utf8');
const dbOriginal = JSON.parse(textoOriginal);

function editablesDe(db) {
  return db.map((f) => ({ ...f, keyOriginal: `${f.nombre}|${f.direccion}` }));
}

test('serializar sin ediciones reproduce db.json byte a byte', () => {
  const salida = serializarDb(aplicarEdiciones(dbOriginal, editablesDe(dbOriginal)));
  assert.equal(salida, textoOriginal);
});

test('aplicarEdiciones solo cambia la farmacia editada, no toca el resto', () => {
  const farmacias = editablesDe(dbOriginal);
  const objetivo = farmacias.find((f) => f.nombre === 'VUOTTO');
  objetivo.telefono = '2266429999';
  objetivo.lat = -37.85;
  objetivo.lng = -58.25;

  const resultado = aplicarEdiciones(dbOriginal, farmacias);

  assert.equal(resultado.length, dbOriginal.length);
  const cambiadas = resultado.filter((f, i) => JSON.stringify(f) !== JSON.stringify(dbOriginal[i]));
  assert.equal(cambiadas.length, 1);
  assert.equal(cambiadas[0].nombre, 'VUOTTO');

  const salida = serializarDb(resultado);
  assert.match(salida, /"telefono": "2266429999"/);
  assert.match(salida, /"lat": -37\.85/);
});

test('aplicarEdiciones conserva una farmacia sin match (keyOriginal no encontrada) tal cual', () => {
  const resultado = aplicarEdiciones(dbOriginal, []);
  assert.deepEqual(resultado, dbOriginal);
});

test('serializarDb escapa comillas dobles y barras invertidas en nombre y dirección', () => {
  const lista = [{ nombre: 'Farmacia "Centro"', direccion: 'Calle 1 \\ 2', telefono: '123', lat: 1, lng: 2 }];
  const salida = serializarDb(lista);
  const reparseado = JSON.parse(salida);
  assert.equal(reparseado[0].nombre, 'Farmacia "Centro"');
  assert.equal(reparseado[0].direccion, 'Calle 1 \\ 2');
});

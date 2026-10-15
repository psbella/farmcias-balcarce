// Tests de js/data.js y de la integridad de db.json.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { limpiarTelefono, tieneCoordenadas, ordenarFarmacias } from '../js/data.js';
import { CONFIG } from '../js/config.js';

const DB_PATH = fileURLToPath(new URL('../db.json', import.meta.url));
const db = JSON.parse(readFileSync(DB_PATH, 'utf8'));

test('limpiarTelefono descarta valores basura y saca espacios', () => {
  assert.equal(limpiarTelefono('2266 42 0309'), '2266420309');
  assert.equal(limpiarTelefono('nan'), '');
  assert.equal(limpiarTelefono('NaN'), '');
  assert.equal(limpiarTelefono('null'), '');
  assert.equal(limpiarTelefono(null), '');
  assert.equal(limpiarTelefono(undefined), '');
});

test('tieneCoordenadas exige lat y lng numéricas', () => {
  assert.equal(tieneCoordenadas({ lat: -37.84, lng: -58.25 }), true);
  assert.equal(tieneCoordenadas({ lat: null, lng: null }), false);
  assert.equal(tieneCoordenadas({ lat: -37.84, lng: null }), false);
  assert.equal(tieneCoordenadas({}), false);
});

test('ordenarFarmacias ordena por nombre sin mutar la lista original', () => {
  const original = [{ nombre: 'VUOTTO' }, { nombre: 'BENITES' }, { nombre: 'SAN JOSÉ' }];
  const ordenada = ordenarFarmacias(original);
  assert.deepEqual(ordenada.map((f) => f.nombre), ['BENITES', 'SAN JOSÉ', 'VUOTTO']);
  assert.equal(original[0].nombre, 'VUOTTO');
});

test('db.json es una lista no vacía de farmacias', () => {
  assert.ok(Array.isArray(db));
  assert.ok(db.length > 0);
});

test('cada farmacia tiene nombre, dirección y teléfono (texto no vacío)', () => {
  for (const f of db) {
    for (const campo of ['nombre', 'direccion', 'telefono']) {
      assert.equal(typeof f[campo], 'string', `${f.nombre}: ${campo} debe ser texto`);
      assert.ok(f[campo].trim().length > 0, `${f.nombre}: ${campo} vacío`);
    }
  }
});

test('lat y lng son ambas null o ambas números, y caen cerca de la ciudad', () => {
  // ±0,15° (~16 km) alrededor del centro: detecta lat/lng invertidas o pegadas de otra ciudad.
  const [latC, lngC] = CONFIG.CENTRO;
  for (const f of db) {
    const conLat = f.lat !== null;
    const conLng = f.lng !== null;
    assert.equal(conLat, conLng, `${f.nombre}: lat y lng deben cargarse juntas`);
    if (conLat) {
      assert.ok(Math.abs(f.lat - latC) <= 0.15, `${f.nombre}: lat ${f.lat} fuera de la zona`);
      assert.ok(Math.abs(f.lng - lngC) <= 0.15, `${f.nombre}: lng ${f.lng} fuera de la zona`);
    }
  }
});

test('no hay farmacias duplicadas (nombre + dirección)', () => {
  const claves = db.map((f) => `${f.nombre}|${f.direccion}`);
  assert.equal(new Set(claves).size, claves.length);
});

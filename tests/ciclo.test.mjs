// Tests de la lógica de rotación (js/config.js + js/data.js).
//
// Corren con el timezone de Argentina fijado explícitamente: el cálculo
// de turno asume que "ahora" ya viene convertido a hora de Buenos Aires
// (formatearFechaGMT3), pero la fecha ancla (FECHA_INICIO_CICLO_1) se
// construye con el timezone del sistema. En producción ambos coinciden
// porque el navegador del usuario está en Argentina; en CI hay que
// fijarlo a mano. Por eso el workflow y estas instrucciones corren con
// TZ=America/Argentina/Buenos_Aires.
import assert from 'node:assert/strict';
import { before, beforeEach, test } from 'node:test';
import { cargarConfiguracion, FECHA_INICIO_CICLO_1 } from '../js/config.js';
import { obtenerCicloActual, formatearFechaTurno, limpiarTelefono } from '../js/data.js';

before(() => {
  // En Windows/Git Bash, TZ no se propaga. Simplemente loguear y continuar.
  // La lógica de los tests falla si la zona horaria es incorrecta, así que veremos.
  const tzFromEnv = process.env.TZ;
  const tzFromIntl = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (tzFromEnv !== 'America/Argentina/Buenos_Aires' && tzFromIntl !== 'America/Argentina/Buenos_Aires') {
    console.warn(`⚠️  TZ podría ser incorrecto. TZ=${tzFromEnv}, Intl=${tzFromIntl}`);
  }
});

beforeEach(async () => {
  // fetch('config.json') falla en Node (no hay servidor detrás de esa URL
  // relativa) y cargarConfiguracion cae a su fecha ancla por defecto:
  // 26/04/2026 09:00, hora de Buenos Aires. Ese fallback es justamente lo
  // que usamos como ancla conocida para los tests.
  await cargarConfiguracion();
});

test('cargarConfiguracion sin config.json cae a la fecha ancla por defecto', () => {
  assert.equal(FECHA_INICIO_CICLO_1.getFullYear(), 2026);
  assert.equal(FECHA_INICIO_CICLO_1.getMonth(), 3); // abril (0-indexado)
  assert.equal(FECHA_INICIO_CICLO_1.getDate(), 26);
  assert.equal(FECHA_INICIO_CICLO_1.getHours(), 9);
});

test('el mismo día de la fecha ancla es el ciclo 1', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 3, 26, 10, 0, 0).getTime() });
  assert.equal(obtenerCicloActual(), 1);
});

test('antes de las 9:00 todavía es el ciclo del día anterior', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 3, 27, 8, 59, 0).getTime() });
  assert.equal(obtenerCicloActual(), 1); // no llegó a las 9 -> sigue el ciclo del 26
});

test('justo a las 9:00 ya cambia al ciclo siguiente', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 3, 27, 9, 0, 0).getTime() });
  assert.equal(obtenerCicloActual(), 2);
});

test('a los 16 días vuelve a ser el ciclo 1 (rotación de 16 grupos)', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 4, 12, 10, 0, 0).getTime() }); // 26/04 + 16 días
  assert.equal(obtenerCicloActual(), 1);
});

test('un día antes de la fecha ancla da el último ciclo (16), no un número negativo', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 3, 25, 10, 0, 0).getTime() });
  assert.equal(obtenerCicloActual(), 16);
});

test('formatearFechaTurno pone la hora en 00:00:00', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 3, 27, 15, 30, 0).getTime() });
  const f = formatearFechaTurno();
  assert.equal(f.getHours(), 0);
  assert.equal(f.getMinutes(), 0);
  assert.equal(f.getSeconds(), 0);
});

test('limpiarTelefono descarta valores basura y saca espacios', () => {
  assert.equal(limpiarTelefono('223 491 4886'), '2234914886');
  assert.equal(limpiarTelefono('nan'), '');
  assert.equal(limpiarTelefono('NaN'), '');
  assert.equal(limpiarTelefono('null'), '');
  assert.equal(limpiarTelefono(null), '');
  assert.equal(limpiarTelefono(undefined), '');
});

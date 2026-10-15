# Changelog

Todos los cambios notables de este proyecto se documentan acá. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el versionado
[Semantic Versioning](https://semver.org/lang/es/).

> El historial anterior corresponde al proyecto base,
> [farmaciasmdp](https://github.com/psbella/farmaciasmdp) (hasta `2.10.1`).

---

## [Unreleased]

---

## [1.0.0] - 2026-10-14

### Added
- Directorio de farmacias de Balcarce (13 farmacias) en `db.json`, sin
  coordenadas por ahora (`lat`/`lng` en `null`).
- `js/config.js` concentra lo propio de la ciudad: nombre, provincia, centro del
  mapa y zoom inicial. El panel de administración lo reutiliza.
- `tests/data.test.mjs`: utilidades de `js/data.js` e integridad de `db.json`
  (formato, `lat`/`lng` juntas, coordenadas cerca de la ciudad, sin duplicados).

### Changed
- Derivado de `farmaciasmdp 2.10.1`. Se quitó toda la lógica de turnos: fecha ancla,
  hora de cambio, cálculo de ciclo, `config.json`, botón "Ver todas" y badge
  "Hoy de turno". Ahora se muestra siempre la lista completa.
- `db.json` pasa de un objeto por grupos (`"1"` … `"16"`, `farmacias_extra`) a una
  lista plana. Se adaptaron el panel de administración y su serializador
  (`serializarDb` usa `JSON.stringify`, que además escapa barras invertidas).
- Textos, SEO, JSON-LD, manifest, sitemap, robots, humans.txt, privacidad y
  términos adaptados a Balcarce. `CNAME` → `balcarce.remedi.ar`.
- El banner de remedi.ar enlaza directo a `remedi.ar` con parámetros UTM.

### Fixed
- Una farmacia sin coordenadas ya no se dibuja en el centro de la ciudad (ubicación
  falsa): no tiene pin y, al tocar su tarjeta, se abre Google Maps.
- Si `db.json` no carga, ya no se pisa el mensaje de error con "No hay datos".
- `sw.js`: el JSON se cacheaba con la URL `db.json?t=<timestamp>`, así que cada visita
  agregaba una entrada nueva a la caché y el modo offline nunca encontraba los
  datos. Ahora se guarda con una clave sin query string, y solo respuestas 2xx.

### Removed
- `config.json` y `tests/ciclo.test.mjs` (solo servían al cálculo de turnos).

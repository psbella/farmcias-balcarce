# Tests

Tests unitarios con `node:test` (incluido en Node, sin dependencias
externas — coherente con el resto del proyecto). Cubren únicamente la
lógica que vale la pena testear sin un navegador:

- **`data.test.mjs`** — utilidades de `js/data.js` (`limpiarTelefono`,
  `tieneCoordenadas`, `ordenarFarmacias`) y la **integridad de `db.json`**:
  que sea una lista, que cada farmacia tenga nombre/dirección/teléfono,
  que `lat`/`lng` se carguen juntas y caigan cerca de la ciudad, y que no
  haya duplicados. Es la red de seguridad cuando se editan datos a mano.
- **`github-serializer.test.mjs`** — `serializarDb()` y
  `aplicarEdiciones()` de `js/admin/github.js`, que son las funciones
  que escriben `db.json` en producción desde el editor de
  administración.

No hay tests de DOM/UI (`js/admin/mapa.js`, `js/admin/farmacias.js`,
`js/ui.js`, etc.) — eso requeriría un navegador o algo como jsdom, y
agregaría una dependencia a un proyecto que hoy no tiene ninguna.

## Cómo correrlos

```bash
npm test
```

No hace falta fijar la zona horaria: el sitio ya no calcula turnos ni
depende de la fecha.

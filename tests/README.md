# Tests

Tests unitarios con `node:test` (incluido en Node, sin dependencias
externas — coherente con el resto del proyecto). Cubren únicamente la
lógica que vale la pena testear sin un navegador:

- **`ciclo.test.mjs`** — el cálculo de qué grupo de farmacias está de
  turno hoy (`js/config.js` + `js/data.js`). Es la lógica de negocio
  central del sitio: si se rompe, la app muestra la farmacia equivocada.
- **`github-serializer.test.mjs`** — `serializarDb()` y
  `aplicarEdiciones()` de `js/admin/github.js`, que son las funciones
  que escriben `db.json` en producción desde el editor de
  administración.

No hay tests de DOM/UI (`js/admin/mapa.js`, `js/admin/farmacias.js`,
`js/ui.js`, etc.) — eso requeriría un navegador o algo como jsdom, y
agregaría una dependencia a un proyecto que hoy no tiene ninguna. Si
en algún momento se justifica, ese es el punto para reconsiderarlo,
no antes.

## Cómo correrlos

```bash
npm test
```

**Importante:** los tests de rotación de turno necesitan el timezone
de Argentina fijado explícitamente. En Windows (Git Bash) o Linux/Mac:

```bash
TZ=America/Argentina/Buenos_Aires npm test
```

En Windows con CMD o PowerShell, si no tenés Git Bash a mano:

```powershell
$env:TZ="America/Argentina/Buenos_Aires"; npm test
```

### Por qué hace falta fijar el TZ

La app calcula "qué hora es en Argentina" explícitamente
(`formatearFechaGMT3` en `js/data.js`), pero la fecha ancla del ciclo
(`FECHA_INICIO_CICLO_1`) se construye con el timezone del sistema
donde corre. En el celular/PC de un usuario en Mar del Plata ambos
coinciden. En una máquina de CI o en tu PC si tenés otro timezone
configurado, no — por eso el workflow de GitHub Actions
(`.github/workflows/tests.yml`) fija `TZ` explícitamente, y estas
instrucciones piden lo mismo en local. Si corrés `npm test` sin fijar
el TZ, el primer test falla con un mensaje que te lo recuerda (no se
rompe en silencio).

Esto no es un bug del sitio — es una asunción de diseño válida para
una PWA pensada para usuarios en Argentina — pero sí es algo a tener
en cuenta al testear.

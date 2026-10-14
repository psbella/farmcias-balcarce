# Changelog

Todos los cambios notables de este proyecto se documentan acá. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el versionado
[Semantic Versioning](https://semver.org/lang/es/).

> Nota sobre el historial: el repo tiene ~590 commits desde abril de 2026.
> Muchos son iteración normal de desarrollo (ajustes de coordenadas, prueba y
> error del primer proyecto) sin valor de changelog por sí solos. Las entradas
> de abajo agrupan esos commits por hito real, con la fecha del último commit
> de cada tanda. `v1.0` y `v2.0` son tags reales del repo; de ahí en adelante
> el versionado es SemVer aplicado retroactivamente sobre la fecha real de cada
> cambio.

---

## [Unreleased]

---

## [2.10.1] - 2026-09-25

### Fixed
- La PWA nunca se registraba como tal: no existía en ningún archivo un
  `navigator.serviceWorker.register()` (solo había código para *actualizar*
  un Service Worker ya registrado, `getRegistrations().then().update()`), ni
  un `<link rel="manifest">` en `index.html`. Sin esas dos piezas, el
  navegador no cumplía los requisitos de instalabilidad —
  `beforeinstallprompt` nunca disparaba, sin importar que el botón, el
  modal de iOS, `manifest.json` y `sw.js` ya estuvieran completos.
  `js/sw-update.js` ahora exporta `registrarServiceWorker()`, llamada desde
  `js/main.js` junto al chequeo de actualizaciones existente.
- `sw.js` precacheaba `/app.js` y `/style.css`, ninguno de los dos existe
  (`app.js` no existe desde el refactor de arquitectura de `2.0.0`;
  `style.css` se eliminó en el refactor a módulos de `2.10.0`).
  `Cache.addAll()` es todo-o-nada: una sola URL con status fuera de 2xx
  hace fallar el evento `install` completo, y el navegador descarta el
  Service Worker nuevo sin activarlo — afectaba a cualquier visitante sin
  un SW previo ya activo. Lista de precache reescrita con los archivos
  reales; `CACHE_NAME` `v14` → `v15`.
- `manifest.json` pedía `icon-128.png`/`icon-192.png` sin que existieran en
  el repo. Generados desde `images/icon-source.svg`.

Confirmado funcionando en producción: instalación exitosa en Chrome/Windows
y Chrome/Android.

---

## [2.10.0] - 2026-09-25

### Added
- `tests/`: tests unitarios con `node:test` (sin dependencias externas).
  `ciclo.test.mjs` cubre el cálculo de qué grupo está de turno hoy
  (`js/config.js` + `js/data.js`); `github-serializer.test.mjs` cubre
  `serializarDb()`/`aplicarEdiciones()` de `js/admin/github.js`, que son las
  que escriben `db.json` en producción.
- `.github/workflows/tests.yml`: corre `npm test` en cada push a
  `main`/`modular` y en cada Pull Request, con
  `TZ=America/Argentina/Buenos_Aires` fijado (el cálculo de turno asume reloj
  de Argentina).
- `package.json`: nuevo, solo para declarar `"type": "module"` y el script
  `test`. Sigue sin dependencias.
- Badge de estado de CI en el README.

### Changed
- `admin-map.html`: el `<script>` monolítico (~380 líneas) se divide en
  `js/admin/{config,state,dom,estado,auth,mapa,farmacias,github,main}.js`.
  El `<style>` inline (~100 líneas) pasa a `css/admin.css`; se eliminan los
  `style="..."` del HTML a favor de clases.
- `style.css` (942 líneas) se divide en 10 archivos por sección en `css/`
  (base, header, layout, cards, maps, controls, footer, responsive,
  components, banner). Concatenados dan exactamente el `style.css` original
  (verificado con `cmp` byte a byte).
- `index.html`, `privacidad.html`, `terminos.html`: se extraen los
  `<script>`/`<style>` inline a `js/analytics.js`, `js/legal-theme.js` y a
  `css/privacidad.css`/`css/terminos.css`.
- `js/main.js`: `agregarBotonIrArriba()` y el update del Service Worker
  pasan a `js/scroll-top.js` y `js/sw-update.js`.
- Íconos (`icon-16/32/48/96/512.png`, `icon-source.svg`) se mueven de la
  raíz a `images/`. Rutas actualizadas en `sw.js`, `index.html` y
  `manifest.json`.
- `sw.js`: `CACHE_NAME` `v13` → `v14`, para que los Service Workers ya
  instalados no sigan pidiendo `/icon-*.png` (ruta vieja) desde caché.

Sin cambios de comportamiento visible para el usuario final — reorganización
de archivos y tooling de desarrollo.

> Validado con un test diferencial en jsdom entre `admin-map.html` original
> y la versión modular (0 diferencias en 12 puntos de comparación) y con
> los 12 tests de `tests/` corriendo en CI.

---

## [2.9.0] - 2026-08-19

### Added
- `admin-map.html` guarda directo a GitHub vía la Contents API (`GET` para
  obtener el `sha` actual, `PUT` con el JSON actualizado), en vez de bajar un
  archivo local para subir a mano.
- Estilo para `.btn-volver-app` en páginas legales (existía la clase desde
  mayo, sin CSS asociado desde que se borró en `Delete styles for volver app
  button`).

### Changed
- Token de GitHub classic pedido en runtime (guardado solo en
  `sessionStorage`), reemplaza la contraseña hardcodeada en texto plano de
  `admin-map.html` — esa contraseña no protegía nada real (`db.json` ya es
  público), el token sí gatea la escritura real al repo.

### Fixed
- `privacidad.html` no linkeaba `style.css` (tenía su propio `:root` duplicado
  y desactualizado, sin el tinte de paleta ni el split de `--accent`/`--muted`
  por tema). `terminos.html` sí linkeaba `style.css`, pero un `.footer` local
  hardcodeado tapaba por cascada el `var(--muted)` correcto.
- `.badge-github` bajado de pill con fondo a link plano, consistente con el
  resto de la columna "Contacto" del footer.

---

## [2.8.0] - 2026-08-18

### Changed
- Paleta de `--bg`/`--surface`/`--border` (oscuro y claro) tintada con el
  verde del isotipo nuevo, en vez de gris neutro. Contraste validado por
  cálculo WCAG, sin regresión respecto a la paleta anterior.
- Cache del Service Worker `v8` → `v9`.

---

## [2.7.0] - 2026-08-17

### Added
- Footer rediseñado en 3 columnas (marca / legal / contacto) con jerarquía
  clara, reemplazando el layout apilado y centrado.

### Fixed
- Contraste de color insuficiente en modo claro (WCAG AA): `--accent` y
  `--muted` eran variables únicas calibradas para fondo oscuro, reusadas sin
  split en modo claro (2.39–2.54:1 y 3.50–3.73:1, ambos bajo el mínimo de
  4.5:1). Se agregan `--accent-light`/`--muted-light` reasignadas vía
  `body.light`. También corrige `.subtitle` y `.offline-alert`, que tenían
  colores hardcodeados sin variante de tema.
- Cache `v6` → `v8` (incluye un bump intermedio a v7 el 15/08).

---

## [2.6.0] - 2026-08-15

### Added
- Isotipo propio (cruz + arco de rotación) en favicons (16/32/48/96/512) y
  header, reemplazando el ícono outline genérico.

### Fixed
- Dos bugs de renderizado del isotipo nuevo el mismo día: `viewBox` heredado
  del ícono anterior (recortaba el logo a un cuarto) y `width`/`height` del
  `<svg>` sin coincidir con el `viewBox` (deformaba las proporciones).
- Margen izquierdo del subtítulo del header reducido.

---

## [2.5.0] - 2026-06-26

### Added
- Analytics.

---

## [2.4.0] - 2026-06-23

### Added
- Banner de cross-promoción a remedi.ar en el home.

### Changed
- Refactor de `obtenerCicloActual`, código sin uso eliminado.

---

## [2.3.0] - 2026-05-20

### Added
- Búsqueda de direcciones y pestaña de Google Maps en el editor de admin.
- Panel de lista de farmacias con toggle en el editor de admin.
- Reorganización y ampliación de entradas de farmacias en `db.json`.

### Changed
- Múltiples intentos de geocoding para direcciones ambiguas.

---

## [2.2.0] - 2026-05-19

### Added
- Protección por contraseña, estilos y exportación a JSON en el editor de
  administración (`admin-map.html`).

---

## [2.1.0] - 2026-05-06

### Added
- Datos estructurados Schema.org y contenido estático en el home.
- Integración completa de Google Ads.
- Workflow de minificación de JS (removido más adelante, el 15/05).

---

## [2.0.1] - 2026-05-05

### Added
- Primera pasada de accesibilidad: `aria-label` en botón de cierre, estilos
  `focus-visible`, links y copyright del footer.

---

## [2.0.0] - 2026-05-03

### Added
- Lógica de cálculo de ciclo de fin de semana (sábados/domingos), agregada el
  02/05, justo antes de este refactor.

### Changed
- **Refactor grande de arquitectura**: el `app.js` monolítico se separa en
  módulos (`data.js`, `maps.js`, `main.js`, `ui.js`, `install.js`,
  `config.js`), con export/import explícito en vez de variables globales
  implícitas.
- Manejo de tema (claro/oscuro) reescrito con modo automático.
- README revisado documentando arquitectura y features de esta versión.

---

## [1.0.0] - 2026-04-30

### Added
- Layout responsive para las secciones de listado y mapa (main + map en dos
  columnas en desktop).
- `db.json` como formato de datos definitivo.
- Workflow de GitHub Actions para deploy a GitHub Pages.
- Detección de tema en `privacidad.html`.

### Changed
- Vuelta atrás de un intento de usar un Worker de Cloudflare para el fetch de
  datos (`Vuelvo a versión sin cloudflare`), de regreso a fetch directo del
  JSON estático.

---

## [0.4.0] - 2026-04-28

### Added
- Script de Google AdSense y `ads.txt`.
- Modal de instrucciones de instalación PWA para iOS y Android.
- Botón flotante de scroll.

### Changed
- Separación de CSS y JS del `index.html` monolítico original (primer
  refactor consciente de arquitectura del proyecto).

---

## [0.3.0] - 2026-04-27

### Added
- SEO: datos estructurados JSON-LD, link canónico, meta tags Open Graph y
  Twitter, sitemap.
- Dominio propio (`CNAME`) por primera vez.

---

## [0.2.0] - 2026-04-26

### Added
- Content Security Policy en `index.html`.
- `humans.txt` con disclaimer del proyecto.
- Variables CSS para tema claro/oscuro (primera versión).
- Botones flotantes de navegación (precursores de `.btn-todas`/`.btn-volver`).

### Fixed
- Serie de correcciones a la fecha de inicio de ciclo 1 (8 commits el mismo
  día ajustando el mismo valor — el bug recurrente más visible de esta etapa
  del proyecto).

---

## [0.1.0] - 2026-04-23

### Added
- Base de PWA: `manifest.json` y `sw.js`.
- Primera versión de `privacidad.html`.
- `LICENSE`.

---

## [0.0.1] - 2026-04-20 al 2026-04-22

### Added
- Commit inicial del proyecto (`Create index`).
- `scraper.js` y workflow de GitHub Actions (`update.yml`) para el ETL de
  datos de farmacias — la base del pipeline automático que sigue en pie hoy.
- `data.js`, primera limpieza de archivos innecesarios.

---

<!--
  Links de comparación: solo para los tags que existen de verdad en el
  repo (v1.0 y v2.0, ver nota del encabezado). El resto de las versiones
  de este changelog no tiene tag de git propio, así que no hay diff real
  para linkear sin inventar una referencia inexistente.
-->
[2.0.0]: https://github.com/psbella/farmaciasmdp/compare/v1.0...v2.0
[1.0.0]: https://github.com/psbella/farmaciasmdp/releases/tag/v1.0

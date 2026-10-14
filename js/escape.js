// Escapa HTML antes de insertar datos de farmacias (nombre, dirección,
// teléfono) en innerHTML. Los datos vienen de db.json, alimentado por un
// scraper automático (scripts/etl) sobre una fuente externa — no son
// input directo del usuario, pero tampoco hay garantía de que nunca
// contengan caracteres HTML, así que se escapan igual antes de insertar.
const MAPA_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

export function escapeHtml(texto) {
  if (texto == null) return '';
  return String(texto).replace(/[&<>"']/g, (c) => MAPA_ESCAPE[c]);
}

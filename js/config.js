// ==================== CONFIGURACIÓN GLOBAL ====================
// Todo lo que cambia de una ciudad a otra vive acá (y en db.json).
export const CONFIG = {
  RUTA_JSON: 'db.json',
  CIUDAD: 'Balcarce',
  PROVINCIA: 'Buenos Aires',
  // Centro aproximado de la ciudad: solo se usa para centrar el mapa
  // cuando todavía no hay farmacias con coordenadas cargadas.
  CENTRO: [-37.8486, -58.2558],
  ZOOM_INICIAL: 13
};

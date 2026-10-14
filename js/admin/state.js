// Estado compartido del editor. Un único objeto mutable para que todos los
// módulos vean los mismos valores sin depender de variables globales.
export const state = {
  token: sessionStorage.getItem('gh_token'),
  farmacias: [],      // farmacias únicas (nombre|dirección), ordenadas por nombre
  index: 0,           // índice de la farmacia que se está editando
  map: null,          // instancia de Leaflet (se crea al mostrar la primera farmacia)
  marker: null,       // pin arrastrable de la farmacia actual
  markerResultado: null, // pin del resultado de la búsqueda de dirección
  vista: 'leaflet',   // 'leaflet' | 'gmaps'
};

// Barra de estado del editor (mensajes de éxito, error, info y carga).
import { $ } from './dom.js';

const ICONS = {
  ok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  loading: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
};

/** @param {string} mensaje  @param {'exito'|'error'|'cargando'|'info'} tipo */
export function setEstado(mensaje, tipo) {
  const estado = $('estado');
  estado.className = 'estado' + (tipo === 'exito' ? ' exito' : tipo === 'error' ? ' error' : '');
  const icono = ICONS[tipo === 'exito' ? 'ok' : tipo === 'error' ? 'error' : tipo === 'cargando' ? 'loading' : 'info'];
  const texto = document.createElement('span');
  texto.textContent = mensaje; // textContent: el mensaje puede venir de la API de GitHub
  estado.innerHTML = icono;
  estado.appendChild(texto);
}

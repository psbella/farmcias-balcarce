// Portada de acceso: pide el token de GitHub y lo guarda solo en sessionStorage.
import { $ } from './dom.js';
import { state } from './state.js';

export function mostrarApp() {
  $('login-gate').classList.add('oculto');
  $('app').classList.remove('oculto');
}

export function pedirLogin() {
  $('login-gate').classList.remove('oculto');
  $('app').classList.add('oculto');
}

/** Si ya hay token entra directo; si no, espera el submit del formulario. */
export function initAuth(onLogin) {
  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = $('login-token').value.trim();
    if (!val) return;
    state.token = val;
    sessionStorage.setItem('gh_token', val);
    mostrarApp();
    onLogin();
  });

  if (state.token) {
    mostrarApp();
    onLogin();
  }
}

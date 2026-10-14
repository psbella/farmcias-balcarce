// Punto de entrada del editor de farmacias (admin-map.html).
import { $ } from './dom.js';
import { initAuth } from './auth.js';
import { cargarFarmacias, bindCampos, siguiente, anterior } from './farmacias.js';
import { initTabs, buscarDireccion } from './mapa.js';
import { guardarEnGitHub } from './github.js';

let iniciado = false;

function iniciarAdmin() {
  if (iniciado) return;
  iniciado = true;
  cargarFarmacias();
  bindEvents();
}

function bindEvents() {
  $('btn-correcta').addEventListener('click', siguiente);
  $('btn-anterior').addEventListener('click', anterior);
  $('btn-descargar').addEventListener('click', guardarEnGitHub);
  $('btn-gmaps').addEventListener('click', buscarDireccion);
  initTabs();
  bindCampos();
}

initAuth(iniciarAdmin);

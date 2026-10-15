// Constantes del editor de administración.
import { CONFIG } from '../config.js';

export const GH_OWNER = 'psbella';
export const GH_REPO = 'farmcias-balcarce';
export const GH_PATH = 'db.json';
export const GH_BRANCH = 'main';
export const COMMIT_MESSAGE = 'Actualizar db.json desde el editor de administracion';

export const CENTRO_CIUDAD = CONFIG.CENTRO;
export const ZOOM_CIUDAD = CONFIG.ZOOM_INICIAL;
export const NOMBRE_CIUDAD = CONFIG.CIUDAD;
export const SUFIJO_CIUDAD = `, ${CONFIG.CIUDAD}, ${CONFIG.PROVINCIA}, Argentina`;

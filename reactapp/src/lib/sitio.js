/**
 * Dominio público de la aplicación. predictibes.me redirige a www en Vercel, así que el canónico es www.
 * Se puede sobrescribir con VITE_SITE_URL (por ejemplo, para otro entorno).
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.predictibes.me').replace(/\/$/, '');

/**
 * Si la app se cargó desde *.vercel.app, redirige al dominio propio conservando ruta, query y hash
 * (el hash lleva los tokens de Supabase al volver de Google). Devuelve true si redirige.
 */
export function forzarDominioCanonico() {
  if (!import.meta.env.PROD || !window.location.hostname.endsWith('.vercel.app')) return false;
  const { pathname, search, hash } = window.location;
  window.location.replace(`${SITE_URL}${pathname}${search}${hash}`);
  return true;
}

/** Origen al que deben volver los flujos de Supabase (OAuth, confirmación de correo). */
export function origenDeRetorno() {
  return import.meta.env.PROD ? SITE_URL : window.location.origin;
}

// Se evalúa al cargar el módulo (main.jsx lo importa primero), antes de que Supabase lea la URL.
export const redirigiendoAlDominio = forzarDominioCanonico();

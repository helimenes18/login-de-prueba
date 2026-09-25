/**
 * Cuenta de demostración (F-05).
 * - Las credenciales solo se muestran en el login si se definen VITE_DEMO_EMAIL y VITE_DEMO_PASSWORD
 *   en las variables de entorno de Vercel (por defecto no se publican).
 * - La cuenta demo no puede modificar su perfil ni su contraseña desde la interfaz.
 *   Para bloquearlo también a nivel de servidor, ver supabase/seguridad.sql.
 */
export const DEMO_EMAIL = (import.meta.env.VITE_DEMO_EMAIL || 'demo@predictivebes.com').toLowerCase();
export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || '';
export const MOSTRAR_DEMO = Boolean(import.meta.env.VITE_DEMO_EMAIL && DEMO_PASSWORD);

export function esCuentaDemo(email) {
  return (email || '').toLowerCase() === DEMO_EMAIL;
}

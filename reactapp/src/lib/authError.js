/**
 * Si el inicio de sesión con Google falla, Supabase vuelve a la app con el motivo en la URL
 * (?error_description=... y #error_description=...). Al no haber sesión, la ruta protegida
 * redirige a /login y ese motivo se perdía. Se captura al cargar el módulo, antes de que el
 * router o Supabase modifiquen la URL, para mostrarlo en el login.
 */
function leerErrorDeUrl() {
  try {
    const params = new URLSearchParams(`${window.location.search.slice(1)}&${window.location.hash.slice(1)}`);
    const descripcion = params.get('error_description') || params.get('error');
    return descripcion ? descripcion.replace(/\+/g, ' ') : '';
  } catch {
    return '';
  }
}

let pendiente = leerErrorDeUrl();

/** Indica si hay un error de autenticación pendiente de mostrar, sin consumirlo. */
export function hayErrorDeAutenticacion() {
  return Boolean(pendiente);
}

/** Devuelve el error de autenticación recibido en la URL (una sola vez). */
export function tomarErrorDeAutenticacion() {
  const error = pendiente;
  pendiente = '';
  return error;
}

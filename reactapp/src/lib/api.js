export const ML_API_BASE = 'https://predictibes.onrender.com';

/**
 * fetch con timeout (Render "duerme" instancias gratuitas inactivas;
 * la primera llamada puede tardar hasta ~50-60s en despertar).
 * Además valida el texto de la respuesta ANTES de parsear JSON,
 * para nunca fallar en silencio si el backend devuelve algo mal formado.
 */
async function fetchJsonSafe(path, options = {}, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${ML_API_BASE}${path}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`El servidor respondió con error ${resp.status}`);
    }

    const rawText = await resp.text();
    if (!rawText) {
      throw new Error('El backend devolvió una respuesta vacía.');
    }

    try {
      return JSON.parse(rawText);
    } catch {
      console.error('Respuesta cruda del backend (no es JSON válido):', rawText);
      throw new Error('El backend devolvió una respuesta que no es JSON válido.');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('⏱️ El servidor tardó demasiado en responder (puede estar "dormido" en Render). Reintenta en unos segundos.');
    }
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('⚠️ No se pudo conectar con el backend (posible problema de red o de CORS).');
    }
    throw err;
  }
}

/** Genera lecturas simuladas de sensores (PIP, PDP, PDT, Vibración)
 * en los mismos rangos usados en toda la app, mientras no exista
 * una fuente de datos real conectada. */
export function generarLecturas() {
  return {
    pip: +(Math.random() * 40 + 100).toFixed(0),
    pdp: +(Math.random() * 200 + 1300).toFixed(0),
    pdt: +(Math.random() * 20 + 170).toFixed(0),
    vib: +(Math.random() * 1.5 + 0.5).toFixed(2)
  };
}

/** POST /api/v1/predict/single */
export function predecirFalla({ pip, pdp, pdt, vib }) {
  return fetchJsonSafe('/api/v1/predict/single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature_1: pip,
      feature_2: pdp,
      feature_3: pdt,
      feature_4: vib
    })
  });
}

/** GET /api/v1/context/records. Acepta tanto { total_records, data:[...] }
 * como un array plano, por si el backend cambia el formato de respuesta. */
export async function obtenerRegistros({ category, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set('category', category);
  const data = await fetchJsonSafe(`/api/v1/context/records?${params.toString()}`);

  const registros = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const total = Number(data?.total_records ?? registros.length);
  return { registros, total };
}

/** GET /api/v1/context/summary */
export function obtenerResumen() {
  return fetchJsonSafe('/api/v1/context/summary');
}

/** GET /api/v1/context/records sin envolver (para exportar el reporte completo) */
export async function obtenerRegistrosCrudos(limit = 1000) {
  const data = await fetchJsonSafe(`/api/v1/context/records?limit=${limit}`);
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

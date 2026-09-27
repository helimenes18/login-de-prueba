import { supabase } from './supabaseClient';

export const ML_API_BASE = (import.meta.env.VITE_ML_API_BASE || 'https://predictibes.onrender.com').replace(/\/$/, '');

/** Máximo de lecturas por lote aceptado por la API (MAX_BATCH_SIZE). */
export const MAX_LOTE = 500;

async function tokenDeSesion() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

function mensajeDeError(status, detalle) {
  if (status === 401) return '🔒 Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
  if (status === 422) return `Datos rechazados por la API (422)${detalle ? `: ${detalle}` : ''}.`;
  if (status === 429) return '⏳ Se superó el límite de consultas por minuto. Espera un momento y reintenta.';
  if (status === 503) return 'El modelo no está disponible en el servidor (503).';
  return `El servidor respondió con error ${status}${detalle ? `: ${detalle}` : ''}.`;
}

function resumirDetalle(detail) {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.slice(0, 2).map((d) => `${(d.loc || []).slice(-1)[0] ?? ''} ${d.msg ?? ''}`.trim()).join('; ');
  }
  return '';
}

/**
 * fetch con timeout (Render "duerme" las instancias gratuitas inactivas: la primera
 * llamada puede tardar hasta ~60 s), token de sesión de Supabase y errores legibles.
 */
async function fetchJsonSafe(path, options = {}, { timeoutMs = 60000, auth = true } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { ...(options.headers || {}) };
  if (auth) {
    const token = await tokenDeSesion();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const resp = await fetch(`${ML_API_BASE}${path}`, { ...options, headers, signal: controller.signal });
    const rawText = await resp.text();
    let data = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Respuesta cruda del backend (no es JSON válido):', rawText);
        throw new Error('El backend devolvió una respuesta que no es JSON válido.');
      }
    }
    if (!resp.ok) {
      const err = new Error(mensajeDeError(resp.status, resumirDetalle(data?.detail)));
      err.status = resp.status;
      throw err;
    }
    if (data === null) throw new Error('El backend devolvió una respuesta vacía.');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('⏱️ El servidor tardó demasiado en responder (puede estar "despertando" en Render). Reintenta en unos segundos.');
    }
    if (err instanceof TypeError) {
      throw new Error('⚠️ No se pudo conectar con el backend (problema de red o de CORS).');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Normaliza la respuesta de /predict (F-02: la API devuelve fail_probability, no prediction). */
function normalizarPrediccion(p) {
  const prob = Number(p?.fail_probability);
  if (!Number.isFinite(prob)) throw new Error('La API no devolvió una probabilidad válida.');
  return {
    probabilidad: Math.max(0, Math.min(1, prob)),
    prediccion: Number(p.fail_prediction) === 1 ? 1 : 0,
    nivel: p.risk_level || null,
    umbral: Number.isFinite(Number(p.threshold)) ? Number(p.threshold) : 0.5
  };
}

/** GET /health — sin sesión; sirve para "despertar" el servicio. */
export function estadoServidor() {
  return fetchJsonSafe('/health', {}, { auth: false });
}

/** GET /api/v1/model/info — métricas reales del modelo (público). */
export function obtenerInfoModelo() {
  return fetchJsonSafe('/api/v1/model/info', {}, { auth: false });
}

/** POST /api/v1/predict/single con las 34 variables de la lectura (F-01). */
export async function predecirFalla(valores) {
  const data = await fetchJsonSafe('/api/v1/predict/single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valores)
  });
  return normalizarPrediccion(data);
}

/** POST /api/v1/predict/batch en bloques de hasta MAX_LOTE lecturas. */
export async function predecirLote(listaValores) {
  const resultados = [];
  for (let i = 0; i < listaValores.length; i += MAX_LOTE) {
    const data = await fetchJsonSafe('/api/v1/predict/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: listaValores.slice(i, i + MAX_LOTE) })
    });
    resultados.push(...(data.predictions || []).map(normalizarPrediccion));
  }
  return resultados;
}

/** GET /api/v1/context/readings — lecturas reales de esp.csv con las 34 variables. */
export async function obtenerLecturas({ offset = 0, limit = 200, soloFallas = false } = {}) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (soloFallas) params.set('only_fail', 'true');
  const data = await fetchJsonSafe(`/api/v1/context/readings?${params.toString()}`);
  return {
    lecturas: Array.isArray(data?.data) ? data.data : [],
    total: Number(data?.total_records ?? 0),
    fuente: data?.source || 'esp.csv',
    variables: Array.isArray(data?.features) ? data.features : []
  };
}

/** GET /api/v1/context/records — historial de lecturas evaluadas. */
export async function obtenerRegistros({ category, limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set('category', category);
  const data = await fetchJsonSafe(`/api/v1/context/records?${params.toString()}`);
  const registros = Array.isArray(data?.data) ? data.data : [];
  return { registros, total: Number(data?.total_available ?? registros.length) };
}

/** GET /api/v1/context/summary */
export function obtenerResumen() {
  return fetchJsonSafe('/api/v1/context/summary');
}

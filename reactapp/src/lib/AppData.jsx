import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { obtenerInfoModelo, obtenerLecturas, predecirLote } from './api';
import { DEFAULT_SETTINGS, normalizarSettings } from './variables';

const AppDataContext = createContext(null);

const LECTURAS_A_REPRODUCIR = 200;
const HISTORIA = 40;

/**
 * Estado compartido por los módulos internos:
 * - Configuración del usuario (user_settings), aplicada en Monitoreo, Dashboard y Predictivo (F-14).
 * - Reproducción de lecturas reales de esp.csv con sus predicciones, evaluadas en un solo lote (F-01, F-03, F-15).
 * - Información y métricas reales del modelo (F-09, F-24).
 */
export function AppDataProvider({ userId, children }) {
  const [cfg, setCfg] = useState(DEFAULT_SETTINGS);
  const [cfgCargada, setCfgCargada] = useState(false);

  const [lecturas, setLecturas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [error, setError] = useState('');
  const [fuente, setFuente] = useState('');
  const [infoModelo, setInfoModelo] = useState(null);
  const [intento, setIntento] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Configuración del usuario
  useEffect(() => {
    if (!userId) return;
    let activo = true;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (err) throw err;
        if (activo) setCfg(normalizarSettings(data));
      } catch (err) {
        console.warn('No se pudo cargar user_settings; se usan los valores recomendados:', err.message);
      } finally {
        if (activo) setCfgCargada(true);
      }
    })();
    return () => { activo = false; };
  }, [userId]);

  // Lecturas reales + predicciones en un único lote
  useEffect(() => {
    let activo = true;
    (async () => {
      setEstado('cargando');
      setError('');
      try {
        const { lecturas: lista, fuente: origen } = await obtenerLecturas({ limit: LECTURAS_A_REPRODUCIR });
        if (!lista.length) throw new Error('La API no devolvió lecturas.');
        const predicciones = await predecirLote(lista.map((l) => l.values));
        if (!activo) return;
        setLecturas(lista.map((l, i) => ({ ...l, prediccion: predicciones[i] })));
        setFuente(origen);
        setIndice(0);
        setUltimaActualizacion(Date.now());
        setEstado('listo');
      } catch (err) {
        if (!activo) return;
        console.error('Error cargando telemetría:', err);
        setError(err.message);
        setEstado('error');
      }
    })();
    return () => { activo = false; };
  }, [intento]);

  useEffect(() => {
    obtenerInfoModelo().then(setInfoModelo).catch((err) => console.warn('No se pudo leer /model/info:', err.message));
  }, []);

  // Avance de la reproducción según el intervalo configurado
  const intervalo = Math.max(1, Number(cfg.monitor_interval_seconds) || DEFAULT_SETTINGS.monitor_interval_seconds);
  const totalRef = useRef(0);
  totalRef.current = lecturas.length;
  useEffect(() => {
    if (estado !== 'listo') return undefined;
    const id = setInterval(() => {
      setIndice((i) => (totalRef.current ? (i + 1) % totalRef.current : 0));
      setUltimaActualizacion(Date.now());
    }, intervalo * 1000);
    return () => clearInterval(id);
  }, [estado, intervalo]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  const value = useMemo(() => {
    const actual = lecturas[indice] || null;
    const desde = Math.max(0, indice - HISTORIA + 1);
    const historia = lecturas.slice(desde, indice + 1);
    const reproducidas = lecturas.slice(0, indice + 1);
    const umbral = infoModelo?.threshold ?? actual?.prediccion?.umbral ?? 0.5;
    return {
      cfg, setCfg, cfgCargada,
      lecturas, indice, actual, historia, reproducidas,
      estado, error, fuente, reintentar, ultimaActualizacion, intervalo,
      infoModelo, umbral
    };
  }, [cfg, cfgCargada, lecturas, indice, estado, error, fuente, reintentar, ultimaActualizacion, intervalo, infoModelo]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de <AppDataProvider>.');
  return ctx;
}

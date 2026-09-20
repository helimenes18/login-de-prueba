import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

const DEFAULTS = {
  pipMin: 100,
  pdpMax: 1500,
  pdtMax: 200,
  corrienteMin: 2.0,
  emailAlerts: true,
  dashboardAlerts: true,
  autoReports: false,
  intervaloSegundos: 3,
};

// Convierte entre los nombres de columna de Supabase (snake_case) y los del
// front (camelCase), igual que en la versión .html original.
function desdeFila(fila) {
  if (!fila) return DEFAULTS;
  return {
    pipMin: fila.pip_min,
    pdpMax: fila.pdp_max,
    pdtMax: fila.pdt_max,
    corrienteMin: fila.corriente_min,
    emailAlerts: fila.email_alerts,
    dashboardAlerts: fila.dashboard_alerts,
    autoReports: fila.auto_reports,
    intervaloSegundos: fila.monitor_interval_seconds,
  };
}
function aFila(userId, s) {
  return {
    user_id: userId,
    pip_min: s.pipMin,
    pdp_max: s.pdpMax,
    pdt_max: s.pdtMax,
    corriente_min: s.corrienteMin,
    email_alerts: s.emailAlerts,
    dashboard_alerts: s.dashboardAlerts,
    auto_reports: s.autoReports,
    monitor_interval_seconds: s.intervaloSegundos,
    updated_at: new Date().toISOString(),
  };
}

/**
 * REVERTIDO A SUPABASE: reemplaza la tabla "user_settings" (igual que en la
 * versión .html). Si esa tabla todavía no existe en tu proyecto, revisá
 * supabase_setup.sql (incluido en este zip) — sin ella, esto usa los valores
 * por defecto y avisa en consola, pero no rompe la app.
 */
export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!user) { setSettings(DEFAULTS); setCargado(false); return; }

    let cancelado = false;
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelado) return;
        if (error) console.warn('No se pudo cargar user_settings:', error.message);
        setSettings(desdeFila(data));
        setCargado(true);
      });

    return () => { cancelado = true; };
  }, [user]);

  async function updateSettings(partial) {
    const nuevo = { ...settings, ...partial };
    setSettings(nuevo);
    if (!user) return;
    const { error } = await supabase
      .from('user_settings')
      .upsert(aFila(user.id, nuevo), { onConflict: 'user_id' });
    if (error) throw error;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, cargado }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

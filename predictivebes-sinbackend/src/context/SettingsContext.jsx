import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'pbes_settings';

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

/**
 * VERSIÓN SIN BACKEND NI SUPABASE: los umbrales y la config viven en
 * localStorage, no en una tabla remota.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  async function updateSettings(partial) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, cargado: true }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

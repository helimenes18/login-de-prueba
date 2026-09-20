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
 * AGREGADO: contexto global de configuración.
 * PARA QUÉ SIRVE: reemplaza la tabla "user_settings" de Supabase que se había
 * diseñado antes. Ahora los umbrales y el intervalo de actualización viven en un
 * solo lugar (React Context + localStorage) y CUALQUIER página los puede leer con
 * `useSettings()`. Por eso, si cambias el umbral de PIP en Configuración, la
 * pantalla de Monitoreo lo ve al instante sin necesidad de recargar ni de una base
 * de datos real. Cuando conectes un backend, solo hay que cambiar el "useEffect"
 * de más abajo para que guarde/lea de tu API en vez de localStorage.
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

  function updateSettings(partial) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

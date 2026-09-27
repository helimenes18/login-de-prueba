import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bes_theme';
const DEFAULT_THEME = 'petrol'; // oscuro azul/verde petróleo — el pedido como punto de partida

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage no disponible; el tema solo dura la sesión actual */
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'petrol' ? 'light' : 'petrol'));
  }

  return { theme, setTheme, toggleTheme };
}

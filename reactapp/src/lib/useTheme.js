import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bes_theme';
const DEFAULT_THEME = 'petrol'; // oscuro azul/verde petróleo — el pedido como punto de partida

function temaGuardado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado === 'light' || guardado === 'petrol' ? guardado : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Aplica el tema guardado al arrancar, para que Landing y Login también lo respeten. */
export function aplicarTemaGuardado() {
  document.documentElement.setAttribute('data-theme', temaGuardado());
}

export function useTheme() {
  const [theme, setTheme] = useState(temaGuardado);

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

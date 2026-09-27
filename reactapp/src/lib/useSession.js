import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const SessionContext = createContext(null);

/**
 * Única fuente de verdad de la sesión: se consulta una vez al arrancar y luego se sigue con
 * onAuthStateChange (inicio de sesión, expiración, cierre en otra pestaña, cambio de usuario).
 * Las rutas deciden a dónde ir según haya o no token (ver App.jsx).
 */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession()
      .then(({ data }) => { if (activo) setSession(data?.session ?? null); })
      .catch(() => { if (activo) setSession(null); })
      .finally(() => { if (activo) setChecked(true); });

    // No se llaman otras funciones de supabase dentro del callback (puede bloquear el cliente).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nueva) => {
      if (!activo) return;
      setSession(nueva ?? null);
      setChecked(true);
    });

    return () => {
      activo = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      // Nunca dejar que un signOut() colgado bloquee el cierre de sesión:
      // como máximo esperamos 2.5s antes de limpiar igual.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    } finally {
      // Solo se limpian las claves propias de la aplicación y de Supabase.
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key === 'bes_user') localStorage.removeItem(key);
      });
      setSession(null);
      setLoggingOut(false);
    }
  }, []);

  const user = session?.user ?? null;
  const value = { session, user, email: user?.email || '', checked, logout, loggingOut };
  return createElement(SessionContext.Provider, { value }, children);
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  return ctx;
}

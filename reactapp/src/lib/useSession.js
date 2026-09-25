import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export function useSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!activo) return;
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }
        setUser(session.user);
        setChecked(true);
      } catch {
        navigate('/login', { replace: true });
      }
    })();

    // F-25: reaccionar si la sesión expira, se cierra en otra pestaña o cambia el usuario.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!activo) return;
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(session.user);
    });

    return () => {
      activo = false;
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

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
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return { user, email: user?.email || '', checked, logout, loggingOut };
}

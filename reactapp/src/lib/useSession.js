import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export function useSession() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('Cargando...');
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
        setEmail(session.user.email);
        setChecked(true);
      } catch {
        navigate('/login', { replace: true });
      }
    })();
    return () => { activo = false; };
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      // Nunca dejar que un signOut() colgado bloquee el cierre de sesión:
      // como máximo esperamos 2.5s antes de limpiar todo igual.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    } finally {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key === 'bes_user') {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return { email, checked, logout, loggingOut };
}

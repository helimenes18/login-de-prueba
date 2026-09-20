import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

function perfilDesdeSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  const nombre = u.user_metadata?.full_name || u.email?.split('@')[0] || 'usuario';
  return {
    id: u.id,
    email: u.email,
    name: nombre,
    picture: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
    provider: u.app_metadata?.provider || 'email',
    createdAt: u.created_at,
    lastLogin: u.last_sign_in_at,
  };
}

/**
 * REVERTIDO A SUPABASE (autenticación real, ya no simulada).
 * PARA QUÉ SIRVE: cualquier página puede hacer `const { user, ... } = useAuth()` y
 * obtener la sesión real de Supabase, sin que cada página tenga que leerla por su
 * cuenta (como pasaba antes en los .html).
 *
 * `cargando` es true mientras se consulta la sesión guardada por primera vez —
 * ProtectedRoute lo usa para no mandar a /login por error mientras Supabase
 * todavía está respondiendo.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(perfilDesdeSession(session));
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(perfilDesdeSession(session));
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function registrar(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) throw error;
  }

  async function updateProfile({ name, password }) {
    const payload = {};
    if (name) payload.data = { full_name: name };
    if (password) payload.password = password;
    const { error } = await supabase.auth.updateUser(payload);
    if (error) throw error;
    const { data: { session } } = await supabase.auth.getSession();
    setUser(perfilDesdeSession(session));
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, cargando, login, registrar, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

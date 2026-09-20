import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'pbes_user';

/**
 * AGREGADO: contexto de autenticación.
 * PARA QUÉ SIRVE: antes, cada una de las 10 páginas HTML repetía su propio código
 * para leer la sesión de Supabase. Ahora cualquier página puede hacer
 * `const { user, login, logout } = useAuth()` y obtener el mismo estado, sin duplicar nada.
 *
 * IMPORTANTE: el backend (Supabase) fue removido a pedido tuyo. Este login es 100%
 * simulado: cualquier correo/contraseña "inician sesión" y el usuario se guarda en
 * localStorage solo para que la sesión sobreviva si recargas la página. No hay
 * validación real ni contraseña verificada. Cuando quieras reconectar un backend real,
 * este es el único archivo que hay que tocar (las páginas no cambian).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function persist(nextUser) {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_KEY);
  }

  function login(email) {
    const nombre = email.split('@')[0] || 'usuario';
    persist({
      email,
      name: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  }

  // AGREGADO: login con Google. Recibe los datos ya extraídos del token de Google
  // (ver Login.jsx) y los guarda igual que un login normal, marcando provider: 'google'.
  function loginWithGoogle({ email, name, picture }) {
    persist({
      email,
      name: name || email.split('@')[0],
      picture,
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  }

  function updateProfile(data) {
    persist({ ...user, ...data });
  }

  function logout() {
    persist(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

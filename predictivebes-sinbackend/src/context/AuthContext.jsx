import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'pbes_user';

/**
 * VERSIÓN SIN BACKEND NI SUPABASE.
 * Login 100% simulado: cualquier correo/contraseña "inician sesión" y el usuario
 * se guarda en localStorage solo para que la sesión sobreviva a un refresh. No hay
 * validación real ni contraseña verificada, ni conexión a ningún servidor externo.
 * Versión mínima para descartar que el backend/Supabase sea la causa de un
 * problema de deploy.
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

  function updateProfile(data) {
    persist({ ...user, ...data });
  }

  function logout() {
    persist(null);
  }

  return (
    <AuthContext.Provider value={{ user, cargando: false, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Igual que antes, pero ahora `cargando` viene de Supabase real: la primera vez
 * que se carga la página, Supabase tarda un instante en confirmar si hay sesión
 * guardada. Mientras tanto mostramos un mensaje corto en vez de mandar a /login
 * por error (lo que pasaría si asumiéramos "sin sesión" antes de tiempo).
 */
export default function ProtectedRoute({ children }) {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <div className="auth-screen"><p style={{ color: 'var(--text-secondary)' }}>Cargando sesión...</p></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

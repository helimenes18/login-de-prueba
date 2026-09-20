import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AGREGADO: guardia de rutas.
 * PARA QUÉ SIRVE: antes, CADA archivo HTML (dashboard, monitoreo, mapa, etc.) tenía
 * copiada su propia función "verificarSesion()" que revisaba si había sesión y si no,
 * redirigía a login.html. Ahora esa lógica vive en un solo lugar: si no hay usuario,
 * manda a /login. Todas las páginas protegidas simplemente se envuelven en
 * <ProtectedRoute> (ver App.jsx) y ya heredan este comportamiento.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

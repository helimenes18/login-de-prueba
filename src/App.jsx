import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monitoreo from './pages/Monitoreo';
import Mapa from './pages/Mapa';
import Predictivo from './pages/Predictivo';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';

// Envuelve cada página protegida con el guardián de sesión + el layout compartido.
function Protected({ title, children }) {
  return (
    <ProtectedRoute>
      <Layout title={title}>{children}</Layout>
    </ProtectedRoute>
  );
}

/**
 * AGREGADO: React Router.
 * PARA QUÉ SIRVE: antes, navegar entre páginas era un <a href="dashboard.html">, o
 * sea, recargar el navegador entero cada vez. Ahora es una Single Page App: cambiar
 * de "página" solo reemplaza el contenido, sin recargar — más rápido y sin el
 * parpadeo de recarga completa. Cada <Route> de acá abajo es el equivalente directo
 * a uno de tus archivos .html originales.
 */
export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<Protected title="Dashboard"><Dashboard /></Protected>} />
            <Route path="/monitoreo" element={<Protected title="Monitoreo"><Monitoreo /></Protected>} />
            <Route path="/mapa" element={<Protected title="Mapa de pozos"><Mapa /></Protected>} />
            <Route path="/predictivo" element={<Protected title="Análisis predictivo"><Predictivo /></Protected>} />
            <Route path="/historial" element={<Protected title="Historial"><Historial /></Protected>} />
            <Route path="/reportes" element={<Protected title="Reportes"><Reportes /></Protected>} />
            <Route path="/configuracion" element={<Protected title="Configuración"><Configuracion /></Protected>} />
            <Route path="/perfil" element={<Protected title="Mi perfil"><Perfil /></Protected>} />

            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

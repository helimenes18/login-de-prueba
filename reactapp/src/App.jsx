import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SessionProvider, useSession } from './lib/useSession';
import { hayErrorDeAutenticacion } from './lib/authError';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Monitoreo from './pages/Monitoreo.jsx';
import Mapa from './pages/Mapa.jsx';
import Predictivo from './pages/Predictivo.jsx';
import Historial from './pages/Historial.jsx';
import Reportes from './pages/Reportes.jsx';
import Configuracion from './pages/Configuracion.jsx';
import Perfil from './pages/Perfil.jsx';

/** Con token → dashboard de administración. */
function SoloSinSesion() {
  const { session, checked } = useSession();
  if (!checked) return null; // evita parpadeo mientras se verifica la sesión
  return session ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

/** Sin token → landing (o login, si Google devolvió un error que hay que mostrar). */
function SoloConSesion() {
  const { session, checked } = useSession();
  if (!checked) return null;
  if (session) return <Outlet />;
  return <Navigate to={hayErrorDeAutenticacion() ? '/login' : '/'} replace />;
}

function RedireccionPorSesion() {
  const { session, checked } = useSession();
  if (!checked) return null;
  return <Navigate to={session ? '/dashboard' : '/'} replace />;
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SoloSinSesion />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<SoloConSesion />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/monitoreo" element={<Monitoreo />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/predictivo" element={<Predictivo />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          <Route path="*" element={<RedireccionPorSesion />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

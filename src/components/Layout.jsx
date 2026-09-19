import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/monitoreo', icon: '📡', label: 'Monitoreo' },
  { to: '/mapa', icon: '🗺️', label: 'Mapa' },
  { to: '/predictivo', icon: '🤖', label: 'Predictivo' },
  { to: '/historial', icon: '🕒', label: 'Historial' },
  { to: '/reportes', icon: '📄', label: 'Reportes' },
  { to: '/configuracion', icon: '⚙️', label: 'Configuración' },
  { to: '/perfil', icon: '👤', label: 'Perfil' },
];

/**
 * AGREGADO: layout único para todas las páginas protegidas.
 * PARA QUÉ SIRVE: es el reemplazo del <aside class="sidebar"> y del <header> que
 * antes estaban duplicados, con el mismo HTML, en los 10 archivos. Ahora existe una
 * sola vez. Si mañana querés agregar un ítem al menú o cambiar el logo, lo cambiás
 * acá y se actualizan las 8 páginas protegidas a la vez.
 *
 * También reemplaza el "sidebarToggle" (para el menú hamburguesa en celular) y el
 * botón de "Cerrar sesión" que antes estaban repetidos en cada archivo.
 */
export default function Layout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleSidebar() {
    document.getElementById('pbes-sidebar')?.classList.toggle('open');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" id="pbes-sidebar">
        <div className="sidebar-brand">⚡ PredictiveBES</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
          <h1>{title}</h1>
          <div className="user-chip">
            <div className="avatar">
              {user?.picture ? (
                <img src={user.picture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                (user?.name || '?').charAt(0).toUpperCase()
              )}
            </div>
            <span>{user?.email}</span>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

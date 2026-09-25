import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { AppDataProvider } from '../lib/AppData';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
  { to: '/monitoreo', icon: 'fa-chart-line', label: 'Monitoreo' },
  { to: '/mapa', icon: 'fa-map-marked-alt', label: 'Mapa' },
  { to: '/predictivo', icon: 'fa-brain', label: 'Predictivo' },
  { to: '/historial', icon: 'fa-history', label: 'Historial' },
  { to: '/reportes', icon: 'fa-file-alt', label: 'Reportes' }
];

const NAV_ITEMS_SECUNDARIOS = [
  { to: '/configuracion', icon: 'fa-cog', label: 'Configuración' },
  { to: '/perfil', icon: 'fa-user', label: 'Perfil' }
];

const TITULOS = {
  '/dashboard': ['Dashboard', '/ Resumen del sistema'],
  '/monitoreo': ['Monitoreo', '/ Telemetría de esp.csv'],
  '/mapa': ['Mapa', '/ Ubicación de pozos BES'],
  '/predictivo': ['Predictivo', '/ Análisis con IA'],
  '/historial': ['Historial', '/ Lecturas evaluadas'],
  '/reportes': ['Reportes', '/ Exportación de datos'],
  '/configuracion': ['Configuración', '/ Ajustes del sistema'],
  '/perfil': ['Perfil', '/ Mi cuenta']
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, email, checked, logout, loggingOut } = useSession();
  const location = useLocation();
  const [titulo, breadcrumb] = TITULOS[location.pathname] || ['PredictiveBES', ''];

  // F-23: el menú lateral se cierra al cambiar de módulo.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!checked) {
    return null; // evita parpadeo mientras se verifica la sesión
  }

  const renderItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
    >
      <i className={`fas ${item.icon}`}></i> {item.label}
    </NavLink>
  );

  return (
    <AppDataProvider userId={user?.id}>
      <div className={styles.app}>
        <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🔬</div>
            <h2>Predictive<span>BES</span></h2>
            <span className={styles.badge}>v1.1</span>
          </div>

          {NAV_ITEMS.map(renderItem)}
          <hr className={styles.navDivider} />
          {NAV_ITEMS_SECUNDARIOS.map(renderItem)}
          <hr className={styles.navDivider} />

          <div className={styles.navFooter}>
            <p>© 2026 PredictiveBES</p>
            <p style={{ fontSize: '0.55rem', opacity: 0.6 }}>BES Analytics · IA</p>
          </div>
        </nav>

        {sidebarOpen && (
          <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <div className={styles.mainContent}>
          <header className={styles.navbarTop}>
            <div className={styles.navbarLeft}>
              <button
                className={styles.sidebarToggle}
                type="button"
                aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                ☰
              </button>
              <h1>{titulo}</h1>
              <span className={styles.breadcrumb}>{breadcrumb}</span>
            </div>
            <div className={styles.navbarRight}>
              <div className={styles.user}>
                <div className={styles.avatar}>{(email.charAt(0) || '?').toUpperCase()}</div>
                <span>{email}</span>
              </div>
              <button className={styles.btnLogout} type="button" disabled={loggingOut} onClick={logout}>
                {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
              </button>
            </div>
          </header>

          <div className={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </AppDataProvider>
  );
}

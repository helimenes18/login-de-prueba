import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import styles from './Login.module.css';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');

  // --- login ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // --- google ---
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // --- registro ---
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Verifica sesión al cargar; si ya hay una, redirige al dashboard.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (activo && session) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('❌ Error al verificar sesión:', error);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      activo = false;
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  function limpiarMensajes() {
    setLoginError(''); setLoginSuccess('');
    setRegError(''); setRegSuccess('');
    setGoogleError('');
  }

  function cambiarTab(nuevaTab) {
    setTab(nuevaTab);
    limpiarMensajes();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(''); setLoginSuccess('');

    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setLoginError('⚠️ Complete ambos campos.');
      return;
    }

    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });

    if (error) {
      setLoginError('❌ Correo o contraseña incorrectos. Intente de nuevo.');
      console.error('Error tradicional:', error.message);
      setLoginLoading(false);
    } else {
      setLoginSuccess('✅ ¡Bienvenido! Redirigiendo...');
      // El listener onAuthStateChange se encarga de la redirección.
    }
  }

  async function handleGoogle() {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' }
      });
      if (error) {
        console.error('❌ Error OAuth:', error.message);
        setGoogleError('❌ Hubo un problema al conectar con Google: ' + error.message);
        setGoogleLoading(false);
        return;
      }
      // Si data existe, la redirección a Google ocurre automáticamente.
      void data;
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      setGoogleError('❌ Error: ' + err.message);
      setGoogleLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError(''); setRegSuccess('');

    const email = regEmail.trim();
    if (!email || !regPassword || !regConfirm) {
      setRegError('⚠️ Complete todos los campos.');
      return;
    }
    if (!email.includes('@')) {
      setRegError('⚠️ Ingrese un correo válido.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('⚠️ La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('⚠️ Las contraseñas no coinciden.');
      return;
    }

    setRegLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: regPassword,
        options: { data: { role: 'operador' } }
      });

      if (error) {
        setRegError(
          error.message.includes('User already registered')
            ? '❌ Este correo ya está registrado. Usa otro o inicia sesión.'
            : '❌ ' + error.message
        );
        return;
      }

      if (data?.user) {
        setRegSuccess('✅ ¡Cuenta creada! Ahora inicia sesión.');
        setRegPassword('');
        setRegConfirm('');
        setTimeout(() => {
          cambiarTab('login');
          setLoginEmail(email);
          setLoginPassword('');
        }, 1500);
      }
    } catch (err) {
      setRegError('❌ Error: ' + err.message);
    } finally {
      setRegLoading(false);
    }
  }

  function usarDemo() {
    cambiarTab('login');
    setLoginEmail('demo@predictivebes.com');
    setLoginPassword('bes2025');
  }

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-info']}>
        <div>
          <div className={styles.logo}>
            <div className={styles.icon}>🔬</div>
            <h2>Predictive<span>BES</span></h2>
          </div>
          <p>Plataforma de inteligencia predictiva para sistemas de Bombeo Electro Sumergible (BES) con IA.</p>
          <div className={styles['badge-list']}>
            <span className={styles.badge}>35 variables</span>
            <span className={styles.badge}>LSTM</span>
            <span className={styles.badge}>Random Forest</span>
            <span className={styles.badge}>XGBoost</span>
            <span className={styles.badge}>96.4% precisión</span>
          </div>
        </div>
        <div className={styles['footer-info']}>
          <i className="fas fa-shield-alt"></i> Datos seguros en la nube
        </div>
      </div>

      <div className={styles['login-form-area']}>
        <h3>🔐 Acceso al sistema</h3>
        <p className={styles.subtitle}>Ingresa o regístrate para comenzar</p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles['tab-btn']} ${tab === 'login' ? styles.active : ''}`}
            onClick={() => cambiarTab('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`${styles['tab-btn']} ${tab === 'register' ? styles.active : ''}`}
            onClick={() => cambiarTab('register')}
          >
            Registrarse
          </button>
        </div>

        {tab === 'login' && (
          <div className={`${styles['form-container']} ${styles.active}`}>
            <form onSubmit={handleLogin}>
              <div className={styles['input-group']}>
                <label>📧 Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="demo@predictivebes.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className={styles['input-group']}>
                <label>🔒 Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button className={styles['login-btn']} type="submit" disabled={loginLoading}>
                <i className="fas fa-sign-in-alt"></i> {loginLoading ? 'Validando...' : 'Ingresar al sistema'}
              </button>
              <div className={styles['error-message']}>{loginError}</div>
              <div className={styles['success-message']}>{loginSuccess}</div>
            </form>

            <div className={styles.divider}>
              <span className={styles.line}></span>
              <span className={styles.text}>O continúa con</span>
              <span className={styles.line}></span>
            </div>

            <button className={styles['google-btn']} type="button" disabled={googleLoading} onClick={handleGoogle}>
              <GoogleIcon />
              {googleLoading ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
            </button>
            <div className={styles['error-message']}>{googleError}</div>
          </div>
        )}

        {tab === 'register' && (
          <div className={`${styles['form-container']} ${styles.active}`}>
            <form onSubmit={handleRegister}>
              <div className={styles['input-group']}>
                <label>📧 Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="operador@empresa.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div className={styles['input-group']}>
                <label>🔒 Contraseña (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div className={styles['input-group']}>
                <label>🔒 Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
              </div>
              <button className={styles['login-btn']} type="submit" disabled={regLoading}>
                <i className="fas fa-user-plus"></i> {regLoading ? 'Registrando...' : 'Crear cuenta'}
              </button>
              <div className={styles['error-message']}>{regError}</div>
              <div className={styles['success-message']}>{regSuccess}</div>
            </form>
          </div>
        )}

        <div className={styles['demo-creds']} title="Haz clic para autocompletar credenciales" onClick={usarDemo}>
          🧪 <strong>Cuenta de demostración (clic para usar)</strong>
          <div className={styles.creds}>
            <span>📧 demo@predictivebes.com</span>
            <span>🔐 bes2025</span>
          </div>
        </div>

        <div className={styles['back-link']}>
          <Link to="/"><i className="fas fa-arrow-left"></i> Volver a la landing page</Link>
        </div>
      </div>
    </div>
  );
}

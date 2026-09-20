import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login real con Supabase (email/contraseña + Google).
 *
 * El botón de Google ahora usa `supabase.auth.signInWithOAuth`, en vez del
 * Google Identity Services armado a mano en la versión anterior. Es más simple
 * y más seguro: Supabase valida el token de Google en su propio servidor, en
 * vez de decodificarlo sin verificar en el navegador. Para que funcione, andá
 * a tu proyecto de Supabase → Authentication → Providers → Google, y activalo
 * con tu Client ID/Secret de Google Cloud Console (si ya lo tenías configurado
 * de antes, con esto alcanza).
 */
export default function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, registrar, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.includes('@')) return setError('Ingresá un correo válido.');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

    setCargando(true);
    try {
      if (modo === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await registrar(email, password);
        setInfo('✅ Cuenta creada. Revisá tu correo si tu proyecto pide confirmación, o iniciá sesión directamente.');
        setModo('login');
      }
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      await loginWithGoogle();
      // Supabase redirige a Google y vuelve a /dashboard; no hace falta navigate acá.
    } catch (err) {
      setError('❌ ' + err.message);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="landing-brand" style={{ marginBottom: 8 }}>⚡ PredictiveBES</div>

        <button type="button" onClick={handleGoogle} className="btn-secondary" style={{ width: '100%', marginBottom: 16 }}>
          🔵 Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          o con correo
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        <div className="form-group">
          <label>Correo</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>{error}</p>}
        {info && <p style={{ color: '#22C55E', fontSize: '0.8rem' }}>{info}</p>}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={cargando}>
          {cargando ? '⏳ Un momento...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); setInfo(''); }}
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

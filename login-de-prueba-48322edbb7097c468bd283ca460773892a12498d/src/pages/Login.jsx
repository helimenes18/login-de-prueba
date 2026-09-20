import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AGREGADO: Iniciar sesión con Google, usando "Google Identity Services" (GIS),
 * la librería oficial de Google (cargada en index.html). No necesita backend para
 * mostrar el botón ni para leer el nombre/correo/foto de la cuenta de Google.
 *
 * ⚠️ IMPORTANTE — hay que configurar tu propio Client ID:
 * 1. Andá a https://console.cloud.google.com/apis/credentials
 * 2. Creá un proyecto (o usá uno existente) → "Crear credenciales" → "ID de cliente
 *    de OAuth" → tipo "Aplicación web".
 * 3. En "Orígenes de JavaScript autorizados" agregá:
 *      http://localhost:5173   (para desarrollo)
 *      https://tu-dominio.vercel.app   (tu dominio real, cuando despliegues)
 * 4. Copiá el "ID de cliente" que te da Google y pegalo abajo en GOOGLE_CLIENT_ID.
 *
 * ⚠️ SEGURIDAD: acá se decodifica el token de Google en el navegador para leer el
 * nombre/correo, PERO no se valida su firma. Es válido para una demo/prototipo,
 * porque no hay backend. Para producción real, hay que enviar ese token a un
 * servidor y validarlo con la librería oficial de Google (google-auth-library)
 * antes de confiar en los datos.
 */
const GOOGLE_CLIENT_ID = 'REEMPLAZA_CON_TU_CLIENT_ID.apps.googleusercontent.com';
const googleConfigurado = !GOOGLE_CLIENT_ID.startsWith('REEMPLAZA_');

function decodificarJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Ingresá un correo válido.');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    login(email);
    navigate('/dashboard');
  }

  function handleDemo() {
    login('demo@predictivebes.com');
    navigate('/dashboard');
  }

  useEffect(() => {
    if (!googleConfigurado) return;

    function respuestaGoogle(response) {
      const datos = decodificarJwt(response.credential);
      if (!datos) {
        setError('No se pudo leer la respuesta de Google.');
        return;
      }
      loginWithGoogle({ email: datos.email, name: datos.name, picture: datos.picture });
      navigate('/dashboard');
    }

    function intentarRenderizar() {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: respuestaGoogle,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
          });
        }
      } else {
        // El script de Google (cargado con "async defer" en index.html) puede tardar
        // en estar listo; reintenta cada 300ms hasta que exista window.google.
        setTimeout(intentarRenderizar, 300);
      }
    }
    intentarRenderizar();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="landing-brand" style={{ marginBottom: 8 }}>⚡ PredictiveBES</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 20 }}>
          Modo demo: no hay backend conectado, cualquier correo/contraseña funciona.
        </p>

        {googleConfigurado ? (
          <div ref={googleBtnRef} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }} />
        ) : (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', padding: 10, borderRadius: 8, marginBottom: 16 }}>
            ⚠️ El botón de "Iniciar sesión con Google" aparece acá una vez que pongas tu
            Client ID real en <code>src/pages/Login.jsx</code> (ver instrucciones en el comentario arriba del archivo).
          </p>
        )}

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

        {error && <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>⚠️ {error}</p>}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
          Iniciar sesión
        </button>
        <button type="button" onClick={handleDemo} className="btn-secondary" style={{ width: '100%', marginTop: 10 }}>
          Entrar con cuenta demo
        </button>
      </form>
    </div>
  );
}

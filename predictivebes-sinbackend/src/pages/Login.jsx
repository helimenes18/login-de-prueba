import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login SIMULADO: no hay backend ni Supabase conectado.
 * Cualquier correo + contraseña de al menos 4 caracteres "inicia sesión".
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) return setError('Ingresá un correo válido.');
    if (password.length < 4) return setError('La contraseña debe tener al menos 4 caracteres.');
    login(email);
    navigate('/dashboard');
  }

  function handleDemo() {
    login('demo@predictivebes.com');
    navigate('/dashboard');
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="landing-brand" style={{ marginBottom: 8 }}>⚡ PredictiveBES</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 20 }}>
          Modo demo: no hay backend conectado, cualquier correo/contraseña funciona.
        </p>

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

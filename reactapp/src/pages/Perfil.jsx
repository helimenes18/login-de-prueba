import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Perfil.module.css';

function formatFechaLarga(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Perfil() {
  const [email, setEmail] = useState('');
  const [nombreMostrado, setNombreMostrado] = useState('Usuario');
  const [creada, setCreada] = useState('—');
  const [ultimoLogin, setUltimoLogin] = useState('—');
  const [proveedor, setProveedor] = useState('—');
  const [userId, setUserId] = useState('—');
  const [rol, setRol] = useState('—');
  const [statReportes, setStatReportes] = useState('—');

  const [inputName, setInputName] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputPasswordConfirm, setInputPasswordConfirm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null); // { color, texto }

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userEmail = session.user.email;
        const metaNombre = session.user.user_metadata?.full_name;
        const nombre = metaNombre || userEmail.split('@')[0];
        const nombreFinal = nombre.charAt(0).toUpperCase() + nombre.slice(1);

        setEmail(userEmail);
        setNombreMostrado(nombreFinal);
        setInputName(nombreFinal);
        setCreada(formatFechaLarga(session.user.created_at));
        setUltimoLogin(formatFechaLarga(session.user.last_sign_in_at));
        setProveedor(session.user.app_metadata?.provider || 'email');
        setUserId(session.user.id);
        setRol(session.user.user_metadata?.role || 'operador');

        try {
          const { count, error } = await supabase
            .from('reportes_generados')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
          if (error) throw error;
          setStatReportes(count ?? 0);
        } catch (err) {
          console.warn('No se pudo leer reportes_generados (¿existe la tabla en Supabase?):', err.message);
          setStatReportes('—');
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
  }, []);

  async function actualizarPerfil() {
    const nuevoNombre = inputName.trim();
    setMsg({ color: 'var(--text-secondary)', texto: '' });

    if (!nuevoNombre) {
      setMsg({ color: '#EF4444', texto: '⚠️ El nombre no puede estar vacío.' });
      return;
    }
    if (inputPassword || inputPasswordConfirm) {
      if (inputPassword.length < 6) {
        setMsg({ color: '#EF4444', texto: '⚠️ La nueva contraseña debe tener al menos 6 caracteres.' });
        return;
      }
      if (inputPassword !== inputPasswordConfirm) {
        setMsg({ color: '#EF4444', texto: '⚠️ Las contraseñas no coinciden.' });
        return;
      }
    }

    setGuardando(true);
    try {
      const payload = { data: { full_name: nuevoNombre } };
      if (inputPassword) payload.password = inputPassword;

      const { error } = await supabase.auth.updateUser(payload);
      if (error) throw error;

      setMsg({ color: '#22C55E', texto: '✅ Perfil actualizado correctamente.' });
      setInputPassword('');
      setInputPasswordConfirm('');
      setNombreMostrado(nuevoNombre);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setMsg({ color: '#EF4444', texto: '❌ No se pudo actualizar el perfil: ' + err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>👤 Mi perfil</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Información de usuario y actividad reciente</p>
      </div>

      <div className={styles['profile-grid']}>
        <div className={styles.card}>
          <div className={styles['avatar-big']}>{nombreMostrado.charAt(0).toUpperCase()}</div>
          <div className={styles['profile-name']}>{nombreMostrado}</div>
          <div className={styles['profile-email']}>{email}</div>
          <div className={styles['profile-role']}>Operador BES</div>

          <div style={{ marginTop: 20 }}>
            <div className={styles['form-group']}>
              <label>Nombre completo</label>
              <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} />
            </div>
            <div className={styles['form-group']}>
              <label>Correo electrónico</label>
              <input type="email" value={email} disabled />
            </div>
            <div className={styles['form-group']}>
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Dejar en blanco para no cambiarla"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
              />
            </div>
            <div className={styles['form-group']}>
              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                placeholder="Repetir contraseña"
                value={inputPasswordConfirm}
                onChange={(e) => setInputPasswordConfirm(e.target.value)}
              />
            </div>
            <button className={styles['btn-primary']} disabled={guardando} onClick={actualizarPerfil}>
              {guardando ? '⏳ Guardando...' : '💾 Actualizar perfil'}
            </button>
            {msg && <div style={{ marginTop: 10, fontSize: '0.8rem', color: msg.color }}>{msg.texto}</div>}
          </div>
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <h3>🕐 Información de la cuenta</h3>
            <div className={styles['activity-item']}><span>Cuenta creada</span><span className={styles.time}>{creada}</span></div>
            <div className={styles['activity-item']}><span>Último inicio de sesión</span><span className={styles.time}>{ultimoLogin}</span></div>
            <div className={styles['activity-item']}><span>Proveedor de acceso</span><span className={styles.time}>{proveedor}</span></div>
            <div className={styles['activity-item']}><span>ID de usuario</span><span className={styles.time} style={{ fontSize: '0.65rem' }}>{userId}</span></div>
          </div>
          <div className={styles.card}>
            <h3>📊 Estadísticas de usuario</h3>
            <div className={styles['stats-mini']}>
              <div className={styles.item}><div className={styles.num}>{statReportes}</div><div className={styles.lab}>Reportes generados</div></div>
              <div className={styles.item}><div className={styles.num}>{rol}</div><div className={styles.lab}>Rol</div></div>
            </div>
            <p style={{ marginTop: 10, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Estadísticas basadas en datos reales de tu cuenta y de tus reportes generados.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

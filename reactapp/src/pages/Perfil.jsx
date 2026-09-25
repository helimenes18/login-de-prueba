import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { esCuentaDemo } from '../lib/demo';
import styles from './Perfil.module.css';

const ROLES = { admin: 'Administrador', operador: 'Operador BES', ingeniero: 'Ingeniero de producción' };

function formatFechaLarga(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' });
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
  const [rol, setRol] = useState('operador');
  const [statReportes, setStatReportes] = useState('—');

  const [inputName, setInputName] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputPasswordConfirm, setInputPasswordConfirm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);

  const esDemo = esCuentaDemo(email);
  const usaPassword = proveedor === 'email';

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const u = session.user;
        const nombre = u.user_metadata?.full_name || u.email.split('@')[0];
        const nombreFinal = nombre.charAt(0).toUpperCase() + nombre.slice(1);

        setEmail(u.email);
        setNombreMostrado(nombreFinal);
        setInputName(nombreFinal);
        setCreada(formatFechaLarga(u.created_at));
        setUltimoLogin(formatFechaLarga(u.last_sign_in_at));
        setProveedor(u.app_metadata?.provider || 'email');
        setUserId(u.id);
        // F-13: el rol se toma de app_metadata (solo modificable por el administrador del proyecto),
        // no de user_metadata, que el propio usuario puede editar.
        setRol(u.app_metadata?.role || 'operador');

        try {
          const { count, error } = await supabase
            .from('reportes_generados')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', u.id);
          if (error) throw error;
          setStatReportes(count ?? 0);
        } catch (err) {
          console.warn('No se pudo leer reportes_generados:', err.message);
          setStatReportes('—');
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
  }, []);

  async function actualizarPerfil() {
    setMsg(null);
    if (esDemo) {
      setMsg({ color: '#F59E0B', texto: '🔒 La cuenta de demostración no puede modificarse.' });
      return;
    }
    const nuevoNombre = inputName.trim();
    if (!nuevoNombre) {
      setMsg({ color: '#EF4444', texto: '⚠️ El nombre no puede estar vacío.' });
      return;
    }
    const cambiaPassword = Boolean(inputPassword || inputPasswordConfirm);
    if (cambiaPassword) {
      if (!usaPassword) {
        setMsg({ color: '#EF4444', texto: '⚠️ Tu cuenta usa inicio de sesión con Google; la contraseña se gestiona en Google.' });
        return;
      }
      if (!passwordActual) {
        setMsg({ color: '#EF4444', texto: '⚠️ Ingresa tu contraseña actual para cambiarla.' });
        return;
      }
      if (inputPassword.length < 8) {
        setMsg({ color: '#EF4444', texto: '⚠️ La nueva contraseña debe tener al menos 8 caracteres.' });
        return;
      }
      if (inputPassword !== inputPasswordConfirm) {
        setMsg({ color: '#EF4444', texto: '⚠️ Las contraseñas no coinciden.' });
        return;
      }
    }

    setGuardando(true);
    try {
      if (cambiaPassword) {
        // F-05: verificar la contraseña actual antes de cambiarla.
        const { error: errReauth } = await supabase.auth.signInWithPassword({ email, password: passwordActual });
        if (errReauth) throw new Error('La contraseña actual no es correcta.');
      }
      const payload = { data: { full_name: nuevoNombre } };
      if (cambiaPassword) payload.password = inputPassword;
      const { error } = await supabase.auth.updateUser(payload);
      if (error) throw error;

      setMsg({ color: '#22C55E', texto: cambiaPassword ? '✅ Perfil y contraseña actualizados.' : '✅ Perfil actualizado correctamente.' });
      setPasswordActual('');
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Información de usuario y de la cuenta</p>
      </div>

      <div className={styles['profile-grid']}>
        <div className={styles.card}>
          <div className={styles['avatar-big']}>{nombreMostrado.charAt(0).toUpperCase()}</div>
          <div className={styles['profile-name']}>{nombreMostrado}</div>
          <div className={styles['profile-email']}>{email}</div>
          <div className={styles['profile-role']}>{ROLES[rol] || rol}</div>

          {esDemo && (
            <div style={{ marginTop: 16, padding: 10, borderRadius: 10, fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
              🔒 Estás usando la cuenta de demostración: el perfil y la contraseña no se pueden modificar.
            </div>
          )}

          <fieldset disabled={esDemo} style={{ border: 'none', marginTop: 20 }}>
            <div className={styles['form-group']}>
              <label>Nombre completo</label>
              <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} />
            </div>
            <div className={styles['form-group']}>
              <label>Correo electrónico</label>
              <input type="email" value={email} disabled />
            </div>
            {usaPassword && (
              <>
                <div className={styles['form-group']}>
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Requerida solo para cambiar la contraseña"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                  />
                </div>
                <div className={styles['form-group']}>
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Dejar en blanco para no cambiarla"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                  />
                </div>
                <div className={styles['form-group']}>
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repetir contraseña"
                    value={inputPasswordConfirm}
                    onChange={(e) => setInputPasswordConfirm(e.target.value)}
                  />
                </div>
              </>
            )}
            <button className={styles['btn-primary']} disabled={guardando || esDemo} onClick={actualizarPerfil}>
              {guardando ? '⏳ Guardando...' : '💾 Actualizar perfil'}
            </button>
          </fieldset>
          {msg && <div style={{ marginTop: 10, fontSize: '0.8rem', color: msg.color }}>{msg.texto}</div>}
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
              <div className={styles.item}><div className={styles.num} style={{ fontSize: '1rem' }}>{ROLES[rol] || rol}</div><div className={styles.lab}>Rol</div></div>
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

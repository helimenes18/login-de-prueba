import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Configuracion.module.css';

const DEFAULTS = {
  pip_min: 100,
  pdp_max: 1500,
  pdt_max: 200,
  corriente_min: 2.0,
  email_alerts: true,
  dashboard_alerts: true,
  auto_reports: false,
  monitor_interval_seconds: 3
};

export default function Configuracion() {
  const [cfg, setCfg] = useState(DEFAULTS);
  const [usuarioId, setUsuarioId] = useState(null);

  const [guardandoUmbrales, setGuardandoUmbrales] = useState(false);
  const [umbralesMsg, setUmbralesMsg] = useState(null); // { color, texto }
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUsuarioId(session.user.id);

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) setCfg((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.warn('No se pudo cargar user_settings (¿existe la tabla en Supabase?):', err.message);
      }
    })();
  }, []);

  function actualizar(campo, valor) {
    setCfg((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(setLoading, setMsg) {
    setLoading(true);
    setMsg({ color: 'var(--text-secondary)', texto: '' });
    try {
      const payload = { user_id: usuarioId, ...cfg, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      setMsg({ color: '#22C55E', texto: '✅ Configuración guardada. Los umbrales se aplicarán en Monitoreo y Dashboard.' });
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setMsg({ color: '#EF4444', texto: `❌ No se pudo guardar (¿existe la tabla "user_settings" en Supabase?): ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>⚙️ Configuración del sistema</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Parámetros de monitoreo, alarmas y notificaciones</p>
      </div>

      <div className={styles['config-grid']}>
        <div className={styles.card}>
          <h3>📊 Umbrales de variables</h3>
          <div className={styles['form-group']}>
            <label>Presión mínima (PIP)</label>
            <input type="number" step={5} value={cfg.pip_min} onChange={(e) => actualizar('pip_min', parseFloat(e.target.value) || 0)} /> psi
          </div>
          <div className={styles['form-group']}>
            <label>Presión máxima (PDP)</label>
            <input type="number" step={10} value={cfg.pdp_max} onChange={(e) => actualizar('pdp_max', parseFloat(e.target.value) || 0)} /> psi
          </div>
          <div className={styles['form-group']}>
            <label>Temperatura máxima (PDT)</label>
            <input type="number" step={5} value={cfg.pdt_max} onChange={(e) => actualizar('pdt_max', parseFloat(e.target.value) || 0)} /> °F
          </div>
          <div className={styles['form-group']}>
            <label>Corriente mínima</label>
            <input type="number" step={0.1} value={cfg.corriente_min} onChange={(e) => actualizar('corriente_min', parseFloat(e.target.value) || 0)} /> A
          </div>
          <button
            className={styles['btn-primary']}
            disabled={guardandoUmbrales}
            onClick={() => guardar(setGuardandoUmbrales, setUmbralesMsg)}
          >
            {guardandoUmbrales ? '⏳ Guardando...' : '💾 Guardar umbrales'}
          </button>
          {umbralesMsg && (
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: umbralesMsg.color }}>{umbralesMsg.texto}</div>
          )}
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <h3>🔔 Notificaciones</h3>
            <div className={styles['toggle-row']}>
              <div className={styles.info}>Alertas por email <div className={styles.desc}>Recibir notificaciones vía correo</div></div>
              <div
                className={`${styles['toggle-switch']} ${cfg.email_alerts ? styles.active : ''}`}
                onClick={() => actualizar('email_alerts', !cfg.email_alerts)}
              >
                <div className={styles.thumb}></div>
              </div>
            </div>
            <div className={styles['toggle-row']}>
              <div className={styles.info}>Alertas en dashboard <div className={styles.desc}>Mostrar notificaciones en tiempo real</div></div>
              <div
                className={`${styles['toggle-switch']} ${cfg.dashboard_alerts ? styles.active : ''}`}
                onClick={() => actualizar('dashboard_alerts', !cfg.dashboard_alerts)}
              >
                <div className={styles.thumb}></div>
              </div>
            </div>
            <div className={styles['toggle-row']}>
              <div className={styles.info}>Reportes automáticos <div className={styles.desc}>Enviar reportes semanales</div></div>
              <div
                className={`${styles['toggle-switch']} ${cfg.auto_reports ? styles.active : ''}`}
                onClick={() => actualizar('auto_reports', !cfg.auto_reports)}
              >
                <div className={styles.thumb}></div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>📡 Frecuencia de monitoreo</h3>
            <div className={styles['form-group']}>
              <label>Intervalo de actualización</label>
              <select
                value={String(cfg.monitor_interval_seconds)}
                onChange={(e) => actualizar('monitor_interval_seconds', parseInt(e.target.value, 10))}
              >
                <option value="1">1 segundo</option>
                <option value="3">3 segundos</option>
                <option value="5">5 segundos</option>
                <option value="10">10 segundos</option>
                <option value="30">30 segundos</option>
              </select>
            </div>
            <button
              className={styles['btn-primary']}
              disabled={guardandoConfig}
              onClick={() => guardar(setGuardandoConfig, setConfigMsg)}
            >
              {guardandoConfig ? '⏳ Guardando...' : '💾 Guardar configuración'}
            </button>
            {configMsg && (
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: configMsg.color }}>{configMsg.texto}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

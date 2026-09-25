import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppData } from '../lib/AppData';
import { DEFAULT_SETTINGS } from '../lib/variables';
import styles from './Configuracion.module.css';

const CAMPOS_UMBRAL = [
  { campo: 'pip_min', label: 'Presión de succión mínima (PIP)', unidad: 'psi', step: 10, min: 0, max: 10000 },
  { campo: 'pdp_max', label: 'Presión de descarga máxima (PDP)', unidad: 'psi', step: 10, min: 0, max: 15000 },
  { campo: 'pdt_max', label: 'Temperatura máxima del bobinado', unidad: '°F', step: 1, min: 50, max: 600 },
  { campo: 'corriente_min', label: 'Corriente mínima del variador', unidad: 'A', step: 5, min: 0, max: 2000 }
];

const CAMPOS_GUARDADOS = [
  'pip_min', 'pdp_max', 'pdt_max', 'corriente_min',
  'email_alerts', 'dashboard_alerts', 'auto_reports', 'monitor_interval_seconds'
];

/** F-14: validación de rangos y coherencia antes de guardar. */
function validar(form) {
  for (const c of CAMPOS_UMBRAL) {
    const v = Number(form[c.campo]);
    if (form[c.campo] === '' || !Number.isFinite(v)) return `${c.label}: ingrese un número.`;
    if (v < c.min || v > c.max) return `${c.label}: debe estar entre ${c.min} y ${c.max} ${c.unidad}.`;
  }
  if (Number(form.pip_min) >= Number(form.pdp_max)) {
    return 'La presión de succión mínima debe ser menor que la presión de descarga máxima.';
  }
  return null;
}

export default function Configuracion() {
  const { cfg, setCfg, cfgCargada } = useAppData();
  const [form, setForm] = useState(cfg);
  const [usuarioId, setUsuarioId] = useState(null);

  const [guardandoUmbrales, setGuardandoUmbrales] = useState(false);
  const [umbralesMsg, setUmbralesMsg] = useState(null);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState(null);

  useEffect(() => { setForm(cfg); }, [cfg, cfgCargada]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUsuarioId(session?.user?.id ?? null));
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(setLoading, setMsg) {
    const errorValidacion = validar(form);
    if (errorValidacion) {
      setMsg({ color: '#EF4444', texto: `⚠️ ${errorValidacion}` });
      return;
    }
    if (!usuarioId) {
      setMsg({ color: '#EF4444', texto: '❌ No hay una sesión activa.' });
      return;
    }
    setLoading(true);
    setMsg({ color: 'var(--text-secondary)', texto: '' });
    try {
      const limpio = Object.fromEntries(CAMPOS_GUARDADOS.map((k) => [k, form[k]]));
      CAMPOS_UMBRAL.forEach((c) => { limpio[c.campo] = Number(form[c.campo]); });
      limpio.monitor_interval_seconds = Number(form.monitor_interval_seconds);
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: usuarioId, ...limpio, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      setCfg((prev) => ({ ...prev, ...limpio }));
      setMsg({ color: '#22C55E', texto: '✅ Configuración guardada y aplicada en Dashboard, Monitoreo y Predictivo.' });
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setMsg({ color: '#EF4444', texto: `❌ No se pudo guardar: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  function restablecer() {
    setForm((prev) => ({
      ...prev,
      pip_min: DEFAULT_SETTINGS.pip_min,
      pdp_max: DEFAULT_SETTINGS.pdp_max,
      pdt_max: DEFAULT_SETTINGS.pdt_max,
      corriente_min: DEFAULT_SETTINGS.corriente_min
    }));
    setUmbralesMsg({ color: 'var(--text-secondary)', texto: 'Valores recomendados cargados (percentiles 5 % / 95 % de esp.csv). Guarde para aplicarlos.' });
  }

  const toggles = [
    { campo: 'email_alerts', titulo: 'Alertas por email', desc: 'Preferencia guardada (el envío de correos aún no está implementado)' },
    { campo: 'dashboard_alerts', titulo: 'Alertas en dashboard', desc: 'Mostrar notificaciones en tiempo real' },
    { campo: 'auto_reports', titulo: 'Reportes automáticos', desc: 'Preferencia guardada (la generación programada aún no está implementada)' }
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>⚙️ Configuración del sistema</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Parámetros de monitoreo, alarmas y notificaciones</p>
      </div>

      <div className={styles['config-grid']}>
        <div className={styles.card}>
          <h3>📊 Umbrales de variables</h3>
          {CAMPOS_UMBRAL.map((c) => (
            <div className={styles['form-group']} key={c.campo}>
              <label>{c.label}</label>
              <input
                type="number"
                step={c.step}
                min={c.min}
                max={c.max}
                value={form[c.campo]}
                onChange={(e) => actualizar(c.campo, e.target.value === '' ? '' : Number(e.target.value))}
              /> {c.unidad}
            </div>
          ))}
          <button className={styles['btn-primary']} disabled={guardandoUmbrales} onClick={() => guardar(setGuardandoUmbrales, setUmbralesMsg)}>
            {guardandoUmbrales ? '⏳ Guardando...' : '💾 Guardar umbrales'}
          </button>
          <button
            type="button"
            onClick={restablecer}
            style={{ marginTop: 8, width: '100%', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: 8, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
          >
            ↺ Restablecer valores recomendados
          </button>
          {umbralesMsg && <div style={{ marginTop: 8, fontSize: '0.75rem', color: umbralesMsg.color }}>{umbralesMsg.texto}</div>}
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <h3>🔔 Notificaciones</h3>
            {toggles.map((t) => (
              <div className={styles['toggle-row']} key={t.campo}>
                <div className={styles.info}>{t.titulo} <div className={styles.desc}>{t.desc}</div></div>
                <div
                  role="switch"
                  aria-checked={!!form[t.campo]}
                  tabIndex={0}
                  className={`${styles['toggle-switch']} ${form[t.campo] ? styles.active : ''}`}
                  onClick={() => actualizar(t.campo, !form[t.campo])}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') actualizar(t.campo, !form[t.campo]); }}
                >
                  <div className={styles.thumb}></div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <h3>📡 Frecuencia de monitoreo</h3>
            <div className={styles['form-group']}>
              <label>Intervalo de actualización</label>
              <select
                value={String(form.monitor_interval_seconds)}
                onChange={(e) => actualizar('monitor_interval_seconds', parseInt(e.target.value, 10))}
              >
                <option value="1">1 segundo</option>
                <option value="3">3 segundos</option>
                <option value="5">5 segundos</option>
                <option value="10">10 segundos</option>
                <option value="30">30 segundos</option>
              </select>
            </div>
            <button className={styles['btn-primary']} disabled={guardandoConfig} onClick={() => guardar(setGuardandoConfig, setConfigMsg)}>
              {guardandoConfig ? '⏳ Guardando...' : '💾 Guardar configuración'}
            </button>
            {configMsg && <div style={{ marginTop: 8, fontSize: '0.75rem', color: configMsg.color }}>{configMsg.texto}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { predecirFalla } from '../lib/api';
import { useAppData } from '../lib/AppData';
import {
  VARIABLES_CLAVE, VARIABLES_POR_KEY, estadoVariable, formatearValor, nivelRiesgo, variablesFueraDeUmbral
} from '../lib/variables';
import LineChart from '../components/LineChart';
import EstadoCarga from '../components/EstadoCarga';
import styles from './Monitoreo.module.css';

const fmt = (key) => (v) => formatearValor(key, v);

export default function Monitoreo() {
  const { actual, historia, cfg, estado, error, reintentar, ultimaActualizacion, intervalo, umbral } = useAppData();
  const [ahora, setAhora] = useState(Date.now());
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResultado, setIaResultado] = useState(null);
  const [iaError, setIaError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const datos = historia.map((l) => l.values);
  const fueraDeUmbral = variablesFueraDeUmbral(actual?.values, cfg);
  const pred = actual?.prediccion;
  const hayPeligro = fueraDeUmbral.some((v) => v.estado === 'danger') || pred?.prediccion === 1;
  const hayAviso = fueraDeUmbral.length > 0 || (pred && pred.probabilidad >= umbral * 0.6);
  const estadoPozo = hayPeligro
    ? { clase: 'danger', texto: '🔴 Riesgo de falla' }
    : hayAviso
      ? { clase: 'warning', texto: '🟠 En observación' }
      : { clase: 'ok', texto: '✅ Operando normal' };
  const segundos = ultimaActualizacion ? Math.max(0, Math.round((ahora - ultimaActualizacion) / 1000)) : null;

  async function analizarConIA() {
    if (!actual) return;
    setIaError('');
    setIaResultado(null);
    setIaLoading(true);
    try {
      const p = await predecirFalla(actual.values);
      setIaResultado({ ...p, riesgo: nivelRiesgo(p.probabilidad, p.umbral), recordId: actual.record_id });
    } catch (err) {
      console.error('Error consultando el modelo predictivo:', err);
      setIaError(err.message);
    } finally {
      setIaLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📡 Monitoreo de telemetría</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Reproducción de lecturas reales de esp.csv · Actualización cada {intervalo} s (configurable)
        </p>
      </div>

      <EstadoCarga estado={estado} error={error} onRetry={reintentar} />

      <div className={styles['monitor-grid']}>
        <div>
          <div className={styles['monitor-card']} style={{ marginBottom: 20 }}>
            <h3>
              📊 Presiones (psi)
              <span className={styles.status}><span className={styles.dot}></span> Reproduciendo</span>
            </h3>
            <LineChart
              data={datos}
              series={[
                { key: 'Intake_Pressure', label: 'PIP (succión)', color: '#60A5FA', formato: fmt('Intake_Pressure') },
                { key: 'Discharge_Pressure', label: 'PDP (descarga)', color: '#A78BFA', formato: fmt('Discharge_Pressure') }
              ]}
              umbrales={[
                { key: 'Intake_Pressure', valor: Number(cfg.pip_min), etiqueta: `PIP mín. ${cfg.pip_min}` },
                { key: 'Discharge_Pressure', valor: Number(cfg.pdp_max), etiqueta: `PDP máx. ${cfg.pdp_max}` }
              ]}
            />
          </div>
          <div className={styles['monitor-card']}>
            <h3>
              🌡️ Temperaturas (°F)
              <span className={styles.status}><span className={styles.dot}></span> Reproduciendo</span>
            </h3>
            <LineChart
              data={datos}
              series={[
                { key: 'Motor_Winding_Temp', label: 'Bobinado del motor', color: '#F87171', formato: fmt('Motor_Winding_Temp') },
                { key: 'ESP_Temperature', label: 'ESP', color: '#FBBF24', formato: fmt('ESP_Temperature') }
              ]}
              umbrales={[{ key: 'Motor_Winding_Temp', valor: Number(cfg.pdt_max), etiqueta: `Máx. ${cfg.pdt_max} °F` }]}
            />
          </div>
        </div>

        <div>
          <div className={styles['monitor-card']}>
            <h3>⚡ Variables críticas</h3>
            <div className={styles['vars-list']}>
              {VARIABLES_CLAVE.map((key) => {
                const valor = actual?.values?.[key];
                return (
                  <div className={styles['var-row']} key={key}>
                    <span className={styles.name}>{VARIABLES_POR_KEY[key].label}</span>
                    <span className={`${styles.value} ${styles[estadoVariable(key, valor, cfg)]}`}>{formatearValor(key, valor)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles['monitor-card']} style={{ marginTop: 16 }}>
            <h3>📌 Estado del pozo</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
              <span className={`${styles['status-badge']} ${styles[estadoPozo.clase]}`}>{estadoPozo.texto}</span>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Lectura {actual?.record_id ?? '—'} · {segundos === null ? 'sin datos' : `hace ${segundos} s`}
              </div>
            </div>
            {fueraDeUmbral.length > 0 && (
              <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {fueraDeUmbral.map((v) => (
                  <li key={v.key}>
                    {VARIABLES_POR_KEY[v.key].label}: {formatearValor(v.key, v.valor)} ({v.tipo === 'min' ? 'mín.' : 'máx.'} {formatearValor(v.key, v.limite)})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles['monitor-card']} style={{ marginTop: 16 }}>
            <h3>
              🧠 Análisis con IA{' '}
              {iaLoading && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>⏳ consultando modelo...</span>}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Envía las 34 variables de la lectura actual al modelo predictivo.
            </p>
            <button
              onClick={analizarConIA}
              disabled={iaLoading || !actual}
              style={{
                marginTop: 10, width: '100%', background: 'var(--accent)', border: 'none', padding: 10,
                borderRadius: 12, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem'
              }}
            >
              🧠 Analizar con IA ahora
            </button>

            {iaResultado && (
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 12, fontSize: '0.85rem',
                background: iaResultado.riesgo.color + '1A', border: `1px solid ${iaResultado.riesgo.color}4D`, color: iaResultado.riesgo.color
              }}>
                <strong>Probabilidad de falla: {(iaResultado.probabilidad * 100).toFixed(1)}%</strong><br />
                {iaResultado.riesgo.texto}<br />
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  Lectura {iaResultado.recordId} · umbral del modelo {Math.round(iaResultado.umbral * 100)} %
                </span>
              </div>
            )}

            {iaError && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', fontSize: '0.8rem' }}>
                {iaError}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

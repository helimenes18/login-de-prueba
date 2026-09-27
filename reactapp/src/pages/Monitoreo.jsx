import { useEffect, useRef, useState } from 'react';
import { predecirFalla } from '../lib/api';
import styles from './Monitoreo.module.css';

function randRange(min, max, decimals = 0) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

export default function Monitoreo() {
  const [vars, setVars] = useState({
    m1: '3.45 A', m2: '118.2 V', m3: '386 psi', m4: '215 psi', m5: '198 psi',
    m6: '124 psi', m7: '1420 psi', m8: '187 °F', m9: '112 °F', m10: '0.82 G'
  });
  const [ultimaLectura, setUltimaLectura] = useState('hace 3s');

  const [iaLoading, setIaLoading] = useState(false);
  const [iaResultado, setIaResultado] = useState(null); // { pct, color, mensaje, pip, pdp, pdt, vib }
  const [iaError, setIaError] = useState('');

  const actualizarMonitoreo = () => {
    setVars({
      m1: randRange(2.5, 4.5, 2) + ' A',
      m2: randRange(115, 125, 1) + ' V',
      m3: randRange(350, 450) + ' psi',
      m4: randRange(190, 240) + ' psi',
      m5: randRange(170, 220) + ' psi',
      m6: randRange(100, 140) + ' psi',
      m7: randRange(1300, 1500) + ' psi',
      m8: randRange(170, 190) + ' °F',
      m9: randRange(95, 125) + ' °F',
      m10: randRange(0.5, 2, 2) + ' G'
    });
    setUltimaLectura('hace 3s');
  };

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    actualizarMonitoreo();
    const interval = setInterval(actualizarMonitoreo, 3000);
    return () => clearInterval(interval);
  }, []);

  function extraerNumero(texto) {
    const match = (texto || '').match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  async function analizarConIA() {
    setIaError('');
    setIaResultado(null);
    setIaLoading(true);

    const pip = extraerNumero(vars.m6);
    const pdp = extraerNumero(vars.m7);
    const pdt = extraerNumero(vars.m8);
    const vib = extraerNumero(vars.m10);

    try {
      const data = await predecirFalla({ pip, pdp, pdt, vib });
      const prob = Math.max(0, Math.min(1, Number(data.prediction)));
      const pct = (prob * 100).toFixed(1);

      let color, mensaje;
      if (prob >= 0.7) { color = '#EF4444'; mensaje = '🔴 Riesgo alto de falla: se recomienda mantenimiento urgente.'; }
      else if (prob >= 0.3) { color = '#F59E0B'; mensaje = '🟠 Riesgo moderado: monitorear de cerca.'; }
      else { color = '#22C55E'; mensaje = '✅ Riesgo bajo: operación normal.'; }

      setIaResultado({ pct, color, mensaje, pip, pdp, pdt, vib });
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📡 Monitoreo en tiempo real</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Variables operativas de pozos BES · Actualización cada 3 segundos
        </p>
      </div>

      <div className={styles['monitor-grid']}>
        <div>
          <div className={styles['monitor-card']} style={{ marginBottom: 20 }}>
            <h3>
              📊 Presiones
              <span className={styles.status}><span className={styles.dot}></span> Actualizando</span>
            </h3>
            <div className={styles['chart-placeholder']}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📈</div>
                <p>Gráfica de presiones</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CHP · THP · PLP · PIP · PDP</p>
              </div>
            </div>
          </div>
          <div className={styles['monitor-card']}>
            <h3>
              🌡️ Temperaturas
              <span className={styles.status}><span className={styles.dot}></span> Actualizando</span>
            </h3>
            <div className={styles['chart-placeholder']}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌡️</div>
                <p>Gráfica de temperaturas</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PDT · TLP</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles['monitor-card']}>
            <h3>⚡ Variables críticas</h3>
            <div className={styles['vars-list']}>
              <div className={styles['var-row']}><span className={styles.name}>⚡ Corriente</span><span className={`${styles.value} ${styles.normal}`}>{vars.m1}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>⚡ Voltaje</span><span className={`${styles.value} ${styles.normal}`}>{vars.m2}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>📊 CHP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m3}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>📊 THP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m4}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>📊 PLP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m5}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>📊 PIP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m6}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>📊 PDP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m7}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>🌡️ PDT</span><span className={`${styles.value} ${styles.normal}`}>{vars.m8}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>🌡️ TLP</span><span className={`${styles.value} ${styles.normal}`}>{vars.m9}</span></div>
              <div className={styles['var-row']}><span className={styles.name}>〰️ Vibración</span><span className={`${styles.value} ${styles.normal}`}>{vars.m10}</span></div>
            </div>
          </div>

          <div className={styles['monitor-card']} style={{ marginTop: 16 }}>
            <h3>📌 Estado del pozo</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              <div><span className={`${styles['status-badge']} ${styles.ok}`}>✅ Operando normal</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Última lectura: {ultimaLectura}</div>
            </div>
          </div>

          <div className={styles['monitor-card']} style={{ marginTop: 16 }}>
            <h3>
              🧠 Análisis con IA{' '}
              {iaLoading && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>⏳ consultando modelo...</span>}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Envía las lecturas actuales de PIP, PDP, PDT y Vibración al modelo predictivo.
            </p>
            <button
              onClick={analizarConIA}
              disabled={iaLoading}
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
                background: iaResultado.color + '1A', border: `1px solid ${iaResultado.color}4D`, color: iaResultado.color
              }}>
                <strong>Probabilidad de falla: {iaResultado.pct}%</strong><br />
                {iaResultado.mensaje}<br />
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  Variables enviadas · PIP: {iaResultado.pip} · PDP: {iaResultado.pdp} · PDT: {iaResultado.pdt} · Vibración: {iaResultado.vib}
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

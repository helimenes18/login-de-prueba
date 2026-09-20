import { useEffect, useRef, useState } from 'react';
import { generarLecturas, predecirFalla } from '../lib/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [v1, setV1] = useState('--');
  const [v2, setV2] = useState('--');

  const [iaLoading, setIaLoading] = useState(false);
  const [iaProb, setIaProb] = useState('—');
  const [iaColor, setIaColor] = useState('#22C55E');
  const [iaFillPct, setIaFillPct] = useState(0);
  const [iaMensaje, setIaMensaje] = useState('Calculando...');
  const [iaError, setIaError] = useState('');
  const [alertasActivas, setAlertasActivas] = useState(0);
  const [fallasDetectadas, setFallasDetectadas] = useState(0);

  const actualizarVariables = () => {
    setV1((Math.random() * 2 + 2.5).toFixed(2) + ' A');
    setV2((Math.random() * 10 + 115).toFixed(1) + ' V');
  };

  const actualizarRiesgoIA = async () => {
    setIaError('');
    setIaLoading(true);
    const lecturas = generarLecturas();
    try {
      const data = await predecirFalla(lecturas);
      const prob = Math.max(0, Math.min(1, Number(data.prediction)));
      const pct = prob * 100;
      setIaProb(pct.toFixed(1) + '%');
      setIaFillPct(pct);

      if (prob >= 0.7) {
        setIaColor('#EF4444');
        setIaMensaje('🔴 Riesgo alto: mantenimiento urgente');
        setAlertasActivas(1);
        setFallasDetectadas(1);
      } else if (prob >= 0.3) {
        setIaColor('#F59E0B');
        setIaMensaje('🟠 Riesgo moderado: monitorear de cerca');
        setAlertasActivas(1);
        setFallasDetectadas(0);
      } else {
        setIaColor('#22C55E');
        setIaMensaje('✅ Riesgo bajo: operación normal');
        setAlertasActivas(0);
        setFallasDetectadas(0);
      }
    } catch (err) {
      console.error('Error consultando el modelo predictivo:', err);
      setIaError(err.message);
      setIaProb('—');
      setIaMensaje('Sin datos del modelo.');
    } finally {
      setIaLoading(false);
    }
  };

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    actualizarVariables();
    actualizarRiesgoIA();
    const interval = setInterval(actualizarVariables, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-database"></i></span>
          <div className={styles.label}>Variables monitoreadas</div>
          <div className={styles.value}>2</div>
          <span className={`${styles.change} ${styles.up}`}>↑ Activas</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-check-circle"></i></span>
          <div className={styles.label}>Equipos operando</div>
          <div className={styles.value}>1</div>
          <span className={`${styles.change} ${styles.up}`}>↑ 100% disponibilidad</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-exclamation-triangle"></i></span>
          <div className={styles.label}>Alertas activas</div>
          <div className={styles.value}>{alertasActivas}</div>
          <span className={`${styles.change} ${styles.down}`}>↓ Sin alertas</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-times-circle"></i></span>
          <div className={styles.label}>Fallas detectadas</div>
          <div className={styles.value}>{fallasDetectadas}</div>
          <span className={`${styles.change} ${styles.down}`}>↓ {fallasDetectadas} fallas</span>
        </div>
      </div>

      <div className={styles['vars-section']}>
        <div className={styles.header}>
          <h3>📡 Variables operativas en tiempo real</h3>
          <div className={styles.live}>
            <span className={styles.dot}></span>
            <span>EN VIVO</span>
          </div>
        </div>
        <div className={styles['vars-grid']}>
          <div className={styles['var-item']}>
            <span className={styles.name}>Variable 1</span>
            <span className={`${styles.value} ${styles.normal}`}>{v1}</span>
          </div>
          <div className={styles['var-item']}>
            <span className={styles.name}>Variable 2</span>
            <span className={`${styles.value} ${styles.normal}`}>{v2}</span>
          </div>
        </div>
      </div>

      <div className={styles['welcome-box']}>
        <div>
          <h3>👋 Bienvenido al sistema predictivo</h3>
          <p>Monitoreo en tiempo real · Detección temprana de fallas · IA para BES</p>
        </div>
        <div className={styles.status}>
          <span className={styles.dot}></span>
          <span>Sistema operativo</span>
        </div>
      </div>

      <div className={styles['vars-section']} style={{ marginTop: 24 }}>
        <div className={styles.header}>
          <h3>
            🧠 Riesgo de falla (IA){' '}
            {iaLoading && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                ⏳ consultando modelo...
              </span>
            )}
          </h3>
          <button
            onClick={actualizarRiesgoIA}
            disabled={iaLoading}
            style={{
              background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              borderRadius: 30, padding: '4px 14px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit'
            }}
          >
            🔄 Actualizar
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: iaColor }}>{iaProb}</div>
          <div style={{ flex: 1, minWidth: 160, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 30, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${iaFillPct}%`, background: iaColor, borderRadius: 30, transition: 'width .3s' }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{iaMensaje}</div>
        </div>
        {iaError && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', fontSize: '0.8rem' }}>
            {iaError}
          </div>
        )}
      </div>
    </>
  );
}

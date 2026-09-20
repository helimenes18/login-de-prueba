import { useEffect, useRef, useState } from 'react';
import { generarLecturas, predecirFalla } from '../lib/api';
import styles from './Predictivo.module.css';

export default function Predictivo() {
  const [loading, setLoading] = useState(false);
  const [lecturas, setLecturas] = useState({ pip: '—', pdp: '—', pdt: '—', vib: '—' });
  const [predProb, setPredProb] = useState('—');
  const [predColor, setPredColor] = useState('inherit');
  const [fillPct, setFillPct] = useState(0);
  const [fillColor, setFillColor] = useState('#22C55E');
  const [accion, setAccion] = useState({ texto: 'Calculando recomendación...', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' });
  const [error, setError] = useState('');
  const [lastPredictTime, setLastPredictTime] = useState('cargando...');

  const ejecutarPrediccion = async () => {
    setError('');
    setLoading(true);
    const l = generarLecturas();
    setLecturas(l);

    try {
      const data = await predecirFalla(l);
      const prob = Math.max(0, Math.min(1, Number(data.prediction)));
      const pct = prob * 100;
      setPredProb(pct.toFixed(1) + '%');
      setFillPct(pct);

      if (prob >= 0.7) {
        setPredColor('#EF4444');
        setFillColor('#EF4444');
        setAccion({ texto: '🔴 Riesgo alto: programar mantenimiento urgente', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' });
      } else if (prob >= 0.3) {
        setPredColor('#F59E0B');
        setFillColor('#F59E0B');
        setAccion({ texto: '🟠 Riesgo moderado: monitorear de cerca', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' });
      } else {
        setPredColor('#22C55E');
        setFillColor('#22C55E');
        setAccion({ texto: '✅ Riesgo bajo: operación normal', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' });
      }
      setLastPredictTime('hace unos segundos');
    } catch (err) {
      console.error('Error consultando el modelo predictivo:', err);
      setError(err.message);
      setPredProb('—');
      setAccion({ texto: 'No se pudo calcular una recomendación.', color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.03)', border: 'var(--border-color)' });
    } finally {
      setLoading(false);
    }
  };

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    ejecutarPrediccion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🧠 Análisis predictivo con IA</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Detección temprana de fallas · LSTM + Random Forest</p>
      </div>

      <div className={styles['predict-grid']}>
        <div>
          <div className={styles.card}>
            <h3>🔴 Alertas predictivas</h3>
            <div className={styles['alert-card']}>
              <div className={styles.icon}>⚠️</div>
              <div className={styles.info}>
                <h4>Temperatura de descarga (PDT)</h4>
                <p>Lectura actual: {lecturas.pdt} °F</p>
              </div>
            </div>
            <div className={`${styles['alert-card']} ${styles.warning}`}>
              <div className={styles.icon}>📊</div>
              <div className={styles.info}>
                <h4>Presión de entrada (PIP)</h4>
                <p>Lectura actual: {lecturas.pip} psi · Umbral mínimo: 100 psi</p>
              </div>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <span className={styles['badge-ia']}>🧠 IA activa</span>
              <span style={{ marginLeft: 12 }}>Última predicción: {lastPredictTime}</span>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h3>
              📈 Pronóstico de fallas{' '}
              {loading && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>⏳ consultando modelo...</span>}
            </h3>
            <div className={styles['predict-card']}>
              <div className={styles.row}>
                <span className={styles.label}>Probabilidad de falla</span>
                <span className={styles.value} style={{ color: predColor }}>{predProb}</span>
              </div>
              <div className={styles['confidence-bar']}><div className={styles.fill} style={{ width: `${fillPct}%`, background: fillColor }}></div></div>
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Variables enviadas al modelo · PIP: {lecturas.pip} psi · PDP: {lecturas.pdp} psi · PDT: {lecturas.pdt} °F · Vibración: {lecturas.vib} G
              </div>
            </div>
            <div className={styles['action-box']} style={{ color: accion.color, background: accion.bg, borderColor: accion.border }}>
              {accion.texto}
            </div>
            {error && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}
            <button
              onClick={ejecutarPrediccion}
              disabled={loading}
              style={{ marginTop: 14, width: '100%', background: 'var(--accent)', border: 'none', padding: 10, borderRadius: 12, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
            >
              🔄 Actualizar predicción
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

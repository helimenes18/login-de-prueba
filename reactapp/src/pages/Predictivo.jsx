import { useState } from 'react';
import { predecirFalla } from '../lib/api';
import { useAppData } from '../lib/AppData';
import { VARIABLES_POR_KEY, formatearValor, nivelRiesgo, variablesFueraDeUmbral } from '../lib/variables';
import EstadoCarga from '../components/EstadoCarga';
import styles from './Predictivo.module.css';

const pct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)} %` : '—');

export default function Predictivo() {
  const { actual, reproducidas, cfg, estado, error, reintentar, infoModelo, umbral } = useAppData();
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(null);
  const [errorManual, setErrorManual] = useState('');

  const pred = manual && actual && manual.recordId === actual.record_id ? manual.pred : actual?.prediccion;
  const riesgo = pred ? nivelRiesgo(pred.probabilidad, pred.umbral ?? umbral) : null;
  const alertas = variablesFueraDeUmbral(actual?.values, cfg);
  const recientesEnRiesgo = reproducidas.slice(-20).filter((l) => l.prediccion?.prediccion === 1).length;
  const test = infoModelo?.evaluation?.test;

  async function ejecutarPrediccion() {
    if (!actual) return;
    setErrorManual('');
    setLoading(true);
    try {
      setManual({ recordId: actual.record_id, pred: await predecirFalla(actual.values), hora: new Date() });
    } catch (err) {
      console.error('Error consultando el modelo predictivo:', err);
      setErrorManual(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🧠 Análisis predictivo con IA</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Detección temprana de fallas · Random Forest (34 variables)</p>
      </div>

      <EstadoCarga estado={estado} error={error} onRetry={reintentar} />

      <div className={styles['predict-grid']}>
        <div>
          <div className={styles.card}>
            <h3>🔴 Alertas por umbral</h3>
            {alertas.length === 0 && (
              <div className={styles['predict-card']} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Ninguna variable fuera de los umbrales configurados en la lectura {actual?.record_id ?? '—'}.
              </div>
            )}
            {alertas.map((a) => (
              <div key={a.key} className={`${styles['alert-card']} ${a.estado === 'warning' ? styles.warning : ''}`}>
                <div className={styles.icon}>{a.estado === 'danger' ? '⚠️' : '📊'}</div>
                <div className={styles.info}>
                  <h4>{VARIABLES_POR_KEY[a.key].label}</h4>
                  <p>
                    Lectura actual: {formatearValor(a.key, a.valor)} · Umbral {a.tipo === 'min' ? 'mínimo' : 'máximo'}: {formatearValor(a.key, a.limite)}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <span className={styles['badge-ia']}>🧠 IA activa</span>
              <span style={{ marginLeft: 12 }}>
                {recientesEnRiesgo} de las últimas {Math.min(20, reproducidas.length)} lecturas con riesgo alto
              </span>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 16 }}>
            <h3>📐 Desempeño medido del modelo</h3>
            {test ? (
              <div className={styles['predict-card']}>
                <div className={styles.row}><span className={styles.label}>Detección de fallas (recall)</span><span className={styles.value}>{pct(test.recall_fail)}</span></div>
                <div className={styles.row}><span className={styles.label}>Precisión en fallas</span><span className={styles.value}>{pct(test.precision_fail)}</span></div>
                <div className={styles.row}><span className={styles.label}>F1 de la clase falla</span><span className={styles.value}>{test.f1_fail?.toFixed(2)}</span></div>
                <div className={styles.row}><span className={styles.label}>ROC AUC</span><span className={styles.value}>{test.roc_auc?.toFixed(2)}</span></div>
                <div className={styles.row}><span className={styles.label}>Umbral de decisión</span><span className={styles.value}>{pct(umbral)}</span></div>
                <p style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Medido con partición temporal: 20 % final de esp.csv no usado en el entrenamiento.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cargando métricas del modelo...</p>
            )}
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h3>
              📈 Pronóstico de falla{' '}
              {loading && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>⏳ consultando modelo...</span>}
            </h3>
            <div className={styles['predict-card']}>
              <div className={styles.row}>
                <span className={styles.label}>Probabilidad de falla</span>
                <span className={styles.value} style={{ color: riesgo?.color }}>{pred ? pct(pred.probabilidad) : '—'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Lectura evaluada</span>
                <span className={styles.value}>{actual ? `${actual.record_id} (fila ${actual.row_number})` : '—'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Etiqueta real en esp.csv</span>
                <span className={styles.value}>{actual ? (actual.label === 1 ? 'FALLA' : 'NORMAL') : '—'}</span>
              </div>
              <div className={styles['confidence-bar']}>
                <div className={styles.fill} style={{ width: `${(pred?.probabilidad ?? 0) * 100}%`, background: riesgo?.color }}></div>
              </div>
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Variables enviadas al modelo: las 34 de la lectura · PIP {formatearValor('Intake_Pressure', actual?.values?.Intake_Pressure)} ·
                PDP {formatearValor('Discharge_Pressure', actual?.values?.Discharge_Pressure)} ·
                Bobinado {formatearValor('Motor_Winding_Temp', actual?.values?.Motor_Winding_Temp)}
              </div>
            </div>
            <div
              className={styles['action-box']}
              style={riesgo ? { color: riesgo.color, background: riesgo.color + '1A', borderColor: riesgo.color + '33' } : { color: 'var(--text-secondary)' }}
            >
              {riesgo?.texto || 'No se pudo calcular una recomendación.'}
            </div>
            {errorManual && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', fontSize: '0.8rem' }}>
                {errorManual}
              </div>
            )}
            <button
              onClick={ejecutarPrediccion}
              disabled={loading || !actual}
              style={{ marginTop: 14, width: '100%', background: 'var(--accent)', border: 'none', padding: 10, borderRadius: 12, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
            >
              🔄 Reevaluar lectura actual
            </button>
            {manual && actual && manual.recordId === actual.record_id && (
              <p style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Última reevaluación: {manual.hora.toLocaleTimeString('es-VE')}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

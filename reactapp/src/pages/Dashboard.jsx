import { useState } from 'react';
import { predecirFalla } from '../lib/api';
import { useAppData } from '../lib/AppData';
import {
  VARIABLES, VARIABLES_CLAVE, VARIABLES_POR_KEY, estadoVariable, formatearValor, nivelRiesgo, variablesFueraDeUmbral
} from '../lib/variables';
import EstadoCarga from '../components/EstadoCarga';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { actual, reproducidas, cfg, estado, error, reintentar, umbral, fuente } = useAppData();
  const [reevaluando, setReevaluando] = useState(false);
  const [prediccionManual, setPrediccionManual] = useState(null);
  const [errorManual, setErrorManual] = useState('');

  const prediccion = prediccionManual && actual && prediccionManual.recordId === actual.record_id ? prediccionManual.pred : actual?.prediccion;
  const riesgo = prediccion ? nivelRiesgo(prediccion.probabilidad, prediccion.umbral ?? umbral) : null;
  const fueraDeUmbral = variablesFueraDeUmbral(actual?.values, cfg);
  const alertasActivas = fueraDeUmbral.filter((v) => v.estado === 'danger').length + (prediccion?.prediccion === 1 ? 1 : 0);
  const fallasDetectadas = reproducidas.filter((l) => l.prediccion?.prediccion === 1).length;

  async function reevaluar() {
    if (!actual) return;
    setReevaluando(true);
    setErrorManual('');
    try {
      const pred = await predecirFalla(actual.values);
      setPrediccionManual({ recordId: actual.record_id, pred });
    } catch (err) {
      setErrorManual(err.message);
    } finally {
      setReevaluando(false);
    }
  }

  return (
    <>
      <EstadoCarga estado={estado} error={error} onRetry={reintentar} />

      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-database"></i></span>
          <div className={styles.label}>Variables monitoreadas</div>
          <div className={styles.value}>{VARIABLES.length}</div>
          <span className={`${styles.change} ${styles.up}`}>Entradas del modelo</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-check-circle"></i></span>
          <div className={styles.label}>Lectura actual</div>
          <div className={styles.value} style={{ fontSize: '1.3rem' }}>{actual?.record_id ?? '—'}</div>
          <span className={`${styles.change} ${styles.up}`}>{reproducidas.length} lecturas reproducidas</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-exclamation-triangle"></i></span>
          <div className={styles.label}>Alertas activas</div>
          <div className={styles.value}>{alertasActivas}</div>
          <span className={`${styles.change} ${alertasActivas ? styles.down : styles.up}`}>
            {alertasActivas ? `${alertasActivas} alerta${alertasActivas > 1 ? 's' : ''} en la lectura actual` : 'Sin alertas'}
          </span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles.icon}><i className="fas fa-times-circle"></i></span>
          <div className={styles.label}>Fallas detectadas</div>
          <div className={styles.value}>{fallasDetectadas}</div>
          <span className={`${styles.change} ${fallasDetectadas ? styles.down : styles.up}`}>
            predichas en {reproducidas.length} lecturas
          </span>
        </div>
      </div>

      <div className={styles['vars-section']}>
        <div className={styles.header}>
          <h3>📡 Variables operativas</h3>
          <div className={styles.live}>
            <span className={styles.dot}></span>
            <span>REPRODUCCIÓN · {fuente || 'esp.csv'}</span>
          </div>
        </div>
        <div className={styles['vars-grid']}>
          {VARIABLES_CLAVE.map((key) => {
            const valor = actual?.values?.[key];
            return (
              <div className={styles['var-item']} key={key}>
                <span className={styles.name}>{VARIABLES_POR_KEY[key].label}</span>
                <span className={`${styles.value} ${styles[estadoVariable(key, valor, cfg)]}`}>{formatearValor(key, valor)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles['welcome-box']}>
        <div>
          <h3>👋 Bienvenido al sistema predictivo</h3>
          <p>Telemetría reproducida de esp.csv · Modelo Random Forest · Umbral de decisión {Math.round(umbral * 100)} %</p>
        </div>
        <div className={styles.status}>
          <span className={styles.dot}></span>
          <span>{estado === 'listo' ? 'Sistema operativo' : estado === 'cargando' ? 'Conectando...' : 'Sin conexión con la API'}</span>
        </div>
      </div>

      <div className={styles['vars-section']} style={{ marginTop: 24 }}>
        <div className={styles.header}>
          <h3>
            🧠 Riesgo de falla (IA){' '}
            {reevaluando && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>⏳ consultando modelo...</span>}
          </h3>
          <button
            onClick={reevaluar}
            disabled={reevaluando || !actual}
            style={{
              background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              borderRadius: 30, padding: '4px 14px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit'
            }}
          >
            🔄 Reevaluar lectura actual
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: riesgo?.color || 'var(--text-secondary)' }}>
            {prediccion ? `${(prediccion.probabilidad * 100).toFixed(1)}%` : '—'}
          </div>
          <div style={{ flex: 1, minWidth: 160, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 30, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(prediccion?.probabilidad ?? 0) * 100}%`, background: riesgo?.color || 'transparent', borderRadius: 30, transition: 'width .3s' }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{riesgo?.texto || 'Sin datos del modelo.'}</div>
        </div>
        {errorManual && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', fontSize: '0.8rem' }}>
            {errorManual}
          </div>
        )}
      </div>
    </>
  );
}

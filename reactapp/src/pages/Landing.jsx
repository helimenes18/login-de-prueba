import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerInfoModelo } from '../lib/api';
import { VARIABLES } from '../lib/variables';
import styles from './Landing.module.css';

const REPO_URL = 'https://github.com/Albieri151/predictibes';
const pct = (v) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—');

export default function Landing() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [info, setInfo] = useState(null);

  // F-24: las cifras del modelo provienen de /api/v1/model/info, no de valores fijos.
  useEffect(() => {
    obtenerInfoModelo().then(setInfo).catch(() => setInfo(null));
  }, []);

  const test = info?.evaluation?.test;

  function irA(id) {
    setMenuAbierto(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <nav className={styles.navbar} id="inicio">
        <div className={styles.logo}>
          <div className={styles.icon}>🔬</div>
          <h1>Predictive<span>BES</span></h1>
          <span className={styles.badge}>AI v1.1</span>
        </div>
        <ul className={`${styles['nav-links']} ${menuAbierto ? styles['nav-links-open'] : ''}`}>
          <li><a href="#inicio" onClick={(e) => { e.preventDefault(); setMenuAbierto(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Inicio</a></li>
          <li><a href="#variables" onClick={(e) => { e.preventDefault(); irA('variables'); }}>Variables</a></li>
          <li><a href="#modelo" onClick={(e) => { e.preventDefault(); irA('modelo'); }}>Modelo</a></li>
          <li><a href="#desempeno" onClick={(e) => { e.preventDefault(); irA('desempeno'); }}>Desempeño</a></li>
        </ul>
        <div className={styles['nav-actions']}>
          <button className={styles['btn-login']} onClick={() => navigate('/login')}>
            <i className="fas fa-key"></i> Acceder
          </button>
          <button className={styles['btn-primary']} onClick={() => navigate('/login')}>
            Comenzar <i className="fas fa-arrow-right"></i>
          </button>
          <button
            className={styles.hamburger}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            ☰
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={styles.tag}><i className="fas fa-microchip"></i> Inteligencia Artificial · Industria 4.0</span>
        <h2>Anticipa fallas en Bombeo <br />Electro Sumergible con IA</h2>
        <p>
          Análisis de <strong>{VARIABLES.length} variables</strong> de operación · Clasificador <strong>Random Forest</strong> ·
          Validación con <strong>partición temporal</strong> sobre datos reales de bombas ESP.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className={styles['btn-primary']} onClick={() => navigate('/login')}>
            <i className="fas fa-chart-line"></i> Ver Dashboard
          </button>
          <button className={styles['btn-secondary']} onClick={() => irA('variables')}>
            <i className="fas fa-arrow-down"></i> Explorar Variables
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.number}>{VARIABLES.length}</span>
            <span className={styles.label}>Variables analizadas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.number}>{pct(test?.recall_fail)}</span>
            <span className={styles.label}>Fallas detectadas (recall)</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.number}>{Number.isFinite(test?.roc_auc) ? test.roc_auc.toFixed(2) : '—'}</span>
            <span className={styles.label}>ROC AUC</span>
          </div>
        </div>
      </section>

      <section className={styles.section} id="variables">
        <div className={styles['section-header']}>
          <h3><i className="fas fa-database" style={{ color: 'var(--accent)' }}></i> {VARIABLES.length} Variables Operativas</h3>
          <p>El modelo procesa cada lectura de sensores para estimar la probabilidad de falla de la bomba</p>
        </div>
        <div className={styles['variables-grid']}>
          {VARIABLES.map((v) => (
            <div className={styles['var-tag']} key={v.key}>
              <i className={`fas fa-${v.icon}`}></i>
              <span style={{ flex: 1 }}>{v.label}</span>
              <span className={styles.category}>{v.category}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        id="modelo"
        style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 40, margin: '0 auto 40px', padding: '60px 40px' }}
      >
        <div className={styles['section-header']}>
          <h3>🧠 ¿Cómo repercuten estas variables en el modelo?</h3>
          <p>Técnicas de aprendizaje automático aplicadas al monitoreo predictivo</p>
        </div>
        <div className={styles['model-grid']}>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-tree"></i></div>
            <h4>Random Forest</h4>
            <p>200 árboles de decisión combinan las {VARIABLES.length} variables de presión, temperatura, corriente y caudal para estimar la probabilidad de falla.</p>
          </div>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-clock"></i></div>
            <h4>Validación temporal</h4>
            <p>El desempeño se mide sobre el 20 % final de los datos, que el modelo nunca vio al entrenar, para evitar resultados optimistas.</p>
          </div>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-sliders-h"></i></div>
            <h4>Umbral de decisión</h4>
            <p>La alerta se emite cuando la probabilidad supera el {pct(info?.threshold)}, umbral elegido con validación cruzada por bloques.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} id="desempeno">
        <div className={styles['impact-box']}>
          <div className={styles.left}>
            <i className="fas fa-chart-pie"></i>
            <div>
              <h4>Desempeño medido del modelo</h4>
              <p>
                {test
                  ? <>Detecta el <strong>{pct(test.recall_fail)}</strong> de las fallas con una precisión de <strong>{pct(test.precision_fail)}</strong> (F1 {test.f1_fail?.toFixed(2)}) en datos no vistos.</>
                  : 'Consultando las métricas del modelo...'}
              </p>
            </div>
          </div>
          <span className={styles['badge-impact']}><i className="fas fa-flask"></i> Prototipo de investigación</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 PredictiveBES · Desarrollado para la industria de hidrocarburos</p>
        <div className={styles.social}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Repositorio en GitHub"><i className="fab fa-github"></i></a>
        </div>
      </footer>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const VARIABLES = [
  { name: 'FALLA', category: 'estado', icon: 'exclamation-triangle' },
  { name: 'Petróleo', category: 'producción', icon: 'oil-can' },
  { name: 'Gas', category: 'producción', icon: 'wind' },
  { name: 'Agua', category: 'producción', icon: 'tint' },
  { name: 'Corriente del Drive', category: 'eléctrica', icon: 'bolt' },
  { name: 'Voltaje del Drive', category: 'eléctrica', icon: 'bolt' },
  { name: 'Presión de Entrada', category: 'presión', icon: 'tachometer-alt' },
  { name: 'Temp. Apagado Motor', category: 'térmica', icon: 'thermometer-half' },
  { name: 'Temp. Enrollado Motor', category: 'térmica', icon: 'thermometer-half' },
  { name: 'Frecuencia de Salida', category: 'eléctrica', icon: 'wave-square' },
  { name: 'Vibración X', category: 'mecánica', icon: 'wave-square' },
  { name: 'Cuenta de Inicio', category: 'operativa', icon: 'power-off' },
  { name: 'Entrada de Petróleo', category: 'fluidos', icon: 'oil-can' },
  { name: 'Entrada de Agua', category: 'fluidos', icon: 'tint' },
  { name: 'Entrada de Gas', category: 'fluidos', icon: 'wind' },
  { name: 'Entrada de Líquido', category: 'fluidos', icon: 'water' },
  { name: 'Saturación de Gas en Entrada', category: 'fluidos', icon: 'chart-line' },
  { name: 'Eficiencia Separador de Gas', category: 'operativa', icon: 'percent' },
  { name: 'Gas por el Anillo en Entrada', category: 'fluidos', icon: 'wind' },
  { name: 'Gas por ESP en Entrada', category: 'fluidos', icon: 'wind' },
  { name: 'Gas por el Anillo', category: 'fluidos', icon: 'wind' },
  { name: 'Gas por ESP', category: 'fluidos', icon: 'wind' },
  { name: 'Pb ESP', category: 'operativa', icon: 'chart-line' },
  { name: 'Presión de Descarga', category: 'presión', icon: 'tachometer-alt' },
  { name: 'Fluido ESP', category: 'fluidos', icon: 'water' },
  { name: 'Saturación de Gas en Descarga', category: 'fluidos', icon: 'chart-line' },
  { name: 'Delta de Presión Bomba', category: 'presión', icon: 'tachometer-alt' },
  { name: 'Presión Promedio Bomba', category: 'presión', icon: 'tachometer-alt' },
  { name: 'Saturación de Gas en Bomba', category: 'fluidos', icon: 'chart-line' },
  { name: 'Potencia de Bomba', category: 'eléctrica', icon: 'bolt' },
  { name: 'Potencia del Drive', category: 'eléctrica', icon: 'bolt' },
  { name: 'Relación de Potencia', category: 'eléctrica', icon: 'chart-line' },
  { name: 'Diferencia de Potencia', category: 'eléctrica', icon: 'chart-line' },
  { name: 'Temperatura ESP', category: 'térmica', icon: 'thermometer-half' },
  { name: 'Límite Inferior', category: 'operativa', icon: 'arrow-down' }
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <div className={styles.icon}>🔬</div>
          <h1>Predictive<span>BES</span></h1>
          <span className={styles.badge}>AI v1.0</span>
        </div>
        <ul className={styles['nav-links']} style={menuAbierto ? { display: 'flex', flexDirection: 'column' } : undefined}>
          <li><a href="#">Inicio</a></li>
          <li><a href="#variables">Variables</a></li>
          <li><a href="#modelo">Modelo</a></li>
          <li><a href="#impacto">Impacto</a></li>
        </ul>
        <div className={styles['nav-actions']}>
          <button className={styles['btn-login']} onClick={() => navigate('/login')}>
            <i className="fas fa-key"></i> Acceder
          </button>
          <button className={styles['btn-primary']} onClick={() => navigate('/login')}>
            Comenzar <i className="fas fa-arrow-right"></i>
          </button>
          <button className={styles.hamburger} onClick={() => setMenuAbierto((v) => !v)}>☰</button>
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={styles.tag}><i className="fas fa-microchip"></i> Inteligencia Artificial · Industria 4.0</span>
        <h2>Anticipa fallas en Bombeo <br />Electro Sumergible con IA</h2>
        <p>Monitoreo de <strong>35 variables</strong> en tiempo real · Redes <strong>LSTM</strong> · Detección temprana de anomalías con <strong>Random Forest</strong> y <strong>XGBoost</strong>.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className={styles['btn-primary']} onClick={() => navigate('/login')}>
            <i className="fas fa-chart-line"></i> Ver Dashboard
          </button>
          <button
            className={styles['btn-secondary']}
            onClick={() => document.getElementById('variables')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <i className="fas fa-arrow-down"></i> Explorar Variables
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.number}>35</span>
            <span className={styles.label}>Variables monitoreadas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.number}>96.4%</span>
            <span className={styles.label}>Precisión del modelo</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.number}>-67%</span>
            <span className={styles.label}>Reducción de paradas</span>
          </div>
        </div>
      </section>

      <section className={styles.section} id="variables">
        <div className={styles['section-header']}>
          <h3><i className="fas fa-database" style={{ color: 'var(--accent)' }}></i> 35 Variables Operativas</h3>
          <p>Nuestro modelo procesa cada señal para detectar patrones de falla antes de que ocurran</p>
        </div>
        <div className={styles['variables-grid']}>
          {VARIABLES.map((v) => (
            <div className={styles['var-tag']} key={v.name}>
              <i className={`fas fa-${v.icon}`}></i>
              <span style={{ flex: 1 }}>{v.name}</span>
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
          <p>Tecnologías de inteligencia artificial aplicadas al monitoreo predictivo</p>
        </div>
        <div className={styles['model-grid']}>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-chart-line"></i></div>
            <h4>Series Temporales LSTM</h4>
            <p>Analiza la evolución de presión, temperatura y caudal para anticipar la degradación de los equipos BES.</p>
          </div>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-tree"></i></div>
            <h4>Random Forest</h4>
            <p>Clasifica fallas mecánicas y eléctricas basándose en las 35 características operativas del pozo.</p>
          </div>
          <div className={styles['model-card']}>
            <div className={styles.icon}><i className="fas fa-bolt"></i></div>
            <h4>Detección de Anomalías</h4>
            <p>Identifica desbalances de voltaje, sobrecalentamiento y desgaste prematuro antes de que ocurran.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} id="impacto">
        <div className={styles['impact-box']}>
          <div className={styles.left}>
            <i className="fas fa-chart-pie"></i>
            <div>
              <h4>Impacto operativo</h4>
              <p>Reducción del <strong>67%</strong> en paradas no programadas · Ahorro estimado de <strong>$2.3M</strong> anuales por pozo</p>
            </div>
          </div>
          <span className={styles['badge-impact']}><i className="fas fa-rocket"></i> ROI garantizado</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 PredictiveBES · Desarrollado para la industria de hidrocarburos</p>
        <div className={styles.social}>
          <a href="#"><i className="fab fa-github"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
        </div>
      </footer>
    </>
  );
}

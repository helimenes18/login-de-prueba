import { useEffect, useState } from 'react';
import styles from './Mapa.module.css';

const ESTADO_COLOR = { Operando: '#22C55E', Alerta: '#F59E0B', Falla: '#EF4444', Mantenimiento: '#8B5CF6', Parado: '#64748B' };
const ESTADO_EMOJI = { Operando: '🟢', Alerta: '🟡', Falla: '🔴', Mantenimiento: '🟣', Parado: '⏸' };
const ESTADO_CLASE = { Operando: 'operando', Alerta: 'alerta', Falla: 'falla', Mantenimiento: 'mantenimiento', Parado: 'parado' };

const POZOS = [
  { id: 'BES-01', cx: 140, cy: 210, estado: 'Operando', petroleo: '386 bpd', gas: '121 bpd' },
  { id: 'BES-02', cx: 250, cy: 180, estado: 'Operando', petroleo: '412 bpd', gas: '135 bpd' },
  { id: 'BES-03', cx: 340, cy: 220, estado: 'Alerta', petroleo: '298 bpd', gas: '98 bpd' },
  { id: 'BES-04', cx: 450, cy: 150, estado: 'Falla', petroleo: '0 bpd', gas: '0 bpd' },
  { id: 'BES-05', cx: 550, cy: 130, estado: 'Operando', petroleo: '425 bpd', gas: '148 bpd' },
  { id: 'BES-06', cx: 650, cy: 200, estado: 'Mantenimiento', petroleo: '---', gas: '---' },
  { id: 'BES-07', cx: 760, cy: 140, estado: 'Operando', petroleo: '375 bpd', gas: '118 bpd' },
  { id: 'BES-08', cx: 860, cy: 230, estado: 'Operando', petroleo: '398 bpd', gas: '125 bpd' },
  { id: 'BES-09', cx: 300, cy: 350, estado: 'Alerta', petroleo: '210 bpd', gas: '75 bpd' },
  { id: 'BES-10', cx: 500, cy: 370, estado: 'Parado', petroleo: '0 bpd', gas: '0 bpd' }
];

export default function Mapa() {
  const [fecha, setFecha] = useState('Cargando...');
  const [pozoSeleccionado, setPozoSeleccionado] = useState(null);

  useEffect(() => {
    const now = new Date();
    setFecha('📅 ' + now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🗺️ Mapa de Bombas Electro Sumergibles</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Ubicación y estado operativo de las bombas BES en el campo petrolero
        </p>
      </div>

      <div className={styles['metricas-grid']}>
        <div className={styles['metrica-card']} style={{ borderLeft: '3px solid #22C55E' }}>
          <div className={styles.label}>⚡ Petróleo</div>
          <div className={styles.value}>2,914</div>
          <div className={styles.meta}>Meta: <span>4,100</span> bpd</div>
        </div>
        <div className={styles['metrica-card']} style={{ borderLeft: '3px solid #3B82F6' }}>
          <div className={styles.label}>💧 Gas</div>
          <div className={styles.value}>555,126</div>
          <div className={styles.meta}>Meta: <span>410,000</span> Mscf</div>
        </div>
        <div className={styles['metrica-card']} style={{ borderLeft: '3px solid #F59E0B' }}>
          <div className={styles.label}>💧 Agua</div>
          <div className={styles.value}>1,245</div>
          <div className={styles.meta}>Meta: <span>1,100</span> bwpd</div>
        </div>
        <div className={styles['metrica-card']} style={{ borderLeft: '3px solid #8B5CF6' }}>
          <div className={styles.label}>🛢️ Pozos activos</div>
          <div className={styles.value}>7/10</div>
          <div className={styles.meta}>2 en alerta · 1 falla</div>
        </div>
      </div>

      <div className={styles['mapa-wrapper']}>
        <div className={styles['mapa-titulo']}>
          <h3>📍 MAPA DE PRODUCCIÓN · CAMPO BES</h3>
          <span className={styles.fecha}>{fecha}</span>
        </div>

        <div className={styles['mapa-container']}>
          <svg className={styles['mapa-svg']} viewBox="0 0 1000 450" xmlns="http://www.w3.org/2000/svg">
            <rect fill="rgba(0,0,0,0.3)" height="450" rx="12" width="1000"></rect>
            <defs>
              <pattern height="50" id="grid" patternUnits="userSpaceOnUse" width="50">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect fill="url(#grid)" height="450" opacity="0.6" width="1000"></rect>

            <path d="M 120 230 Q 200 170, 300 200 Q 400 230, 500 170 Q 600 110, 700 130 Q 800 150, 880 110" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="2.5"></path>
            <path d="M 120 230 Q 250 270, 400 290 Q 550 310, 700 330 Q 800 350, 880 390" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="2.5"></path>

            <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="11" fontWeight="600" x="60" y="100">ZONA NORTE</text>
            <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="11" fontWeight="600" x="420" y="100">ZONA CENTRAL</text>
            <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="11" fontWeight="600" x="780" y="100">ZONA SUR</text>

            {POZOS.map((p) => (
              <g
                key={p.id}
                className={styles['pozo-punto']}
                onClick={() => setPozoSeleccionado(p)}
              >
                <circle cx={p.cx} cy={p.cy} fill={ESTADO_COLOR[p.estado]} opacity="0.15" r="18"></circle>
                <circle cx={p.cx} cy={p.cy} fill={ESTADO_COLOR[p.estado]} opacity="0.3" r="12"></circle>
                <circle className={`${styles.circulo} ${styles[ESTADO_CLASE[p.estado]]}`} cx={p.cx} cy={p.cy} r="8"></circle>
                <text className={styles.label} fill={ESTADO_COLOR[p.estado]} x={p.cx} y={p.cy + 28}>{p.id}</text>
                <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="7" textAnchor="middle" x={p.cx} y={p.cy + 40}>
                  {p.estado === 'Mantenimiento' ? 'Mantenimiento' : p.estado === 'Parado' ? 'Parado' : p.petroleo}
                </text>
              </g>
            ))}

            <rect fill="rgba(0,0,0,0.6)" height="60" rx="8" stroke="var(--border-color)" width="200" x="780" y="380"></rect>
            <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="9" fontWeight="600" x="795" y="398">📊 RESUMEN</text>
            <text fill="var(--text-secondary)" fontSize="7" x="795" y="415">🟢 Operando: <tspan fill="#22C55E" fontWeight="700">6</tspan></text>
            <text fill="var(--text-secondary)" fontSize="7" x="795" y="430">🟡 Alerta: <tspan fill="#F59E0B" fontWeight="700">2</tspan></text>
            <text fill="var(--text-secondary)" fontSize="7" x="920" y="415">🔴 Falla: <tspan fill="#EF4444" fontWeight="700">1</tspan></text>
            <text fill="var(--text-secondary)" fontSize="7" x="920" y="430">🟣 Mantenimiento: <tspan fill="#8B5CF6" fontWeight="700">1</tspan></text>

            <rect fill="rgba(0,0,0,0.6)" height="30" rx="8" stroke="var(--border-color)" width="420" x="20" y="410"></rect>
            <text fill="var(--text-secondary)" fontFamily="Inter" fontSize="7" fontWeight="600" x="35" y="430">LEYENDA:</text>
            <circle cx="95" cy="427" fill="#22C55E" r="5" stroke="white" strokeWidth="1"></circle>
            <text fill="var(--text-secondary)" fontSize="7" x="106" y="430">Operando</text>
            <circle cx="170" cy="427" fill="#F59E0B" r="5" stroke="white" strokeWidth="1"></circle>
            <text fill="var(--text-secondary)" fontSize="7" x="181" y="430">Alerta</text>
            <circle cx="240" cy="427" fill="#EF4444" r="5" stroke="white" strokeWidth="1"></circle>
            <text fill="var(--text-secondary)" fontSize="7" x="251" y="430">Falla</text>
            <circle cx="305" cy="427" fill="#8B5CF6" r="5" stroke="white" strokeWidth="1"></circle>
            <text fill="var(--text-secondary)" fontSize="7" x="316" y="430">Mantenimiento</text>
            <circle cx="405" cy="427" fill="#64748B" r="5" stroke="white" strokeWidth="1"></circle>
            <text fill="var(--text-secondary)" fontSize="7" x="416" y="430">Parado</text>
          </svg>
        </div>

        <div className={styles['pozos-lista']}>
          {POZOS.map((p) => (
            <div key={p.id} className={styles['pozo-mini']} style={{ borderLeftColor: ESTADO_COLOR[p.estado] }}>
              <span className={styles.nombre}>{p.id}</span>
              <span className={styles.produccion}>{p.estado === 'Mantenimiento' ? '---' : p.petroleo}</span>
              <span className={`${styles['estado-text']} ${styles[ESTADO_CLASE[p.estado]]}`}>
                {ESTADO_EMOJI[p.estado]} {p.estado.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.leyenda}>
          <div className={styles.item}><span className={`${styles.dot} ${styles.operando}`}></span> Operando</div>
          <div className={styles.item}><span className={`${styles.dot} ${styles.alerta}`}></span> Alerta</div>
          <div className={styles.item}><span className={`${styles.dot} ${styles.falla}`}></span> Falla</div>
          <div className={styles.item}><span className={`${styles.dot} ${styles.mantenimiento}`}></span> Mantenimiento</div>
          <div className={styles.item}><span className={`${styles.dot} ${styles.parado}`}></span> Parado</div>
        </div>
      </div>

      {pozoSeleccionado && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPozoSeleccionado(null); }}
        >
          <div style={{ background: 'var(--gradient-main)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, width: 320, maxWidth: '90vw', boxShadow: '0 0 40px rgba(139,92,246,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem' }}>🛢️ Pozo {pozoSeleccionado.id}</h3>
              <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem' }} onClick={() => setPozoSeleccionado(null)}>✕</span>
            </div>
            <div style={{ marginBottom: 12, fontWeight: 600, color: ESTADO_COLOR[pozoSeleccionado.estado] }}>
              {ESTADO_EMOJI[pozoSeleccionado.estado]} {pozoSeleccionado.estado}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>⛽ Petróleo</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{pozoSeleccionado.petroleo}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>💧 Gas</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{pozoSeleccionado.gas}</div>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              💡 Datos de ejemplo. Para telemetría real por pozo se requiere una tabla "pozos" en Supabase.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

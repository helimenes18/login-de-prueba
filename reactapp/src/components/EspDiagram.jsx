import styles from './EspDiagram.module.css';

function estadoColor(valor, warnAt, dangerAt, invert) {
  if (!invert) {
    if (dangerAt !== undefined && valor >= dangerAt) return 'var(--status-danger)';
    if (warnAt !== undefined && valor >= warnAt) return 'var(--status-warning)';
  } else {
    if (dangerAt !== undefined && valor <= dangerAt) return 'var(--status-danger)';
    if (warnAt !== undefined && valor <= warnAt) return 'var(--status-warning)';
  }
  return 'var(--status-ok)';
}

// Posiciones en porcentaje, calculadas sobre el viewBox "60 10 860 470" del SVG.
const READOUTS = [
  { key: 'thp', label: 'THP', sublabel: 'Presión Cabezal de la Tubería', unit: 'psi', top: 8.5, left: 8.7, warnAt: 260, dangerAt: 285 },
  { key: 'chp', label: 'CHP', sublabel: 'Presión Cabezal del Revestidor', unit: 'psi', top: 18, left: 4, warnAt: 380, dangerAt: 420 },
  { key: 'plp', label: 'PLP', sublabel: 'Presión Línea de Producción', unit: 'psi', top: 17, left: 41.9, warnAt: 210, dangerAt: 235 },
  { key: 'tlp', label: 'TLP', sublabel: 'Temp. Línea de Producción', unit: '°F', top: 17, left: 64, warnAt: 140, dangerAt: 152 },
  { key: 'pdp', label: 'PDP', sublabel: 'Presión de Descarga de Bomba', unit: 'psi', top: 65, left: 20.4, warnAt: 1450, dangerAt: 1550 },
  { key: 'pdt', label: 'PDT', sublabel: 'Temp. Descarga de Bomba', unit: '°F', top: 71, left: 4, warnAt: 195, dangerAt: 205 },
  { key: 'pip', label: 'PIP', sublabel: 'Presión de Entrada de Bomba', unit: 'psi', top: 80, left: 20.4, warnAt: 100, dangerAt: 80, invert: true }
];

export default function EspDiagram({ lecturas }) {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-ES');
  const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <span className={styles.system}>🛢️ ESP-01 · Monitoreo de pozo</span>
        <span className={styles.clock}>{fecha} · {hora}</span>
      </div>

      <div className={styles.canvas}>
        <svg viewBox="60 10 860 470" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
          {/* Línea de producción (superficie) */}
          <line x1="150" y1="90" x2="770" y2="90" className={styles.pipe} />
          <polygon points="770,83 785,90 770,97" className={styles.pipeArrow} />

          {/* Cabezal del pozo (wellhead / árbol de válvulas) */}
          <g>
            <rect x="120" y="75" width="30" height="30" rx="4" className={styles.equipBody} />
            <line x1="135" y1="50" x2="135" y2="75" className={styles.pipeThin} />
            <circle cx="135" cy="50" r="8" className={styles.valveWheel} />
            <line x1="135" y1="105" x2="135" y2="135" className={styles.pipeThin} />
          </g>
          <text x="135" y="200" className={styles.equipLabel}>CABEZAL</text>

          {/* VSD / variador de velocidad, junto a la línea */}
          <g>
            <rect x="290" y="35" width="64" height="40" rx="6" className={styles.vsdBody} />
            <text x="322" y="59" className={styles.vsdText}>VSD</text>
            <circle cx="342" cy="43" r="4" className={`${styles.statusDot} ${styles.pulse}`} />
          </g>
          <line x1="322" y1="75" x2="322" y2="90" className={styles.cable} />

          {/* Separador trifásico al final de la línea, con salidas */}
          <g>
            <rect x="770" y="60" width="90" height="60" rx="8" className={styles.tankBody} />
            <line x1="815" y1="120" x2="815" y2="140" className={styles.pipeThin} />
            <line x1="775" y1="145" x2="775" y2="175" className={styles.pipeThin} />
            <line x1="815" y1="145" x2="815" y2="175" className={styles.pipeThin} />
            <line x1="855" y1="145" x2="855" y2="175" className={styles.pipeThin} />
          </g>
          <text x="815" y="140" className={styles.equipLabel}>SEPARADOR</text>
          <text x="775" y="192" className={styles.equipSub}>Gas</text>
          <text x="815" y="192" className={styles.equipSub}>Petróleo</text>
          <text x="855" y="192" className={styles.equipSub}>Agua</text>

          {/* Pozo (revestidor + tubería descendiendo) */}
          <line x1="122" y1="135" x2="122" y2="440" className={styles.casing} />
          <line x1="148" y1="135" x2="148" y2="440" className={styles.casing} />
          <line x1="135" y1="138" x2="135" y2="420" className={styles.tubing} />

          {/* Cable de potencia bajando por el pozo hasta el motor */}
          <path d="M 128 138 L 128 420" className={styles.cableDown} />

          {/* Ensamble ESP en el fondo del pozo */}
          <g>
            <rect x="108" y="308" width="55" height="16" rx="3" className={styles.pumpStage} />
            <ellipse cx="135" cy="338" rx="27" ry="9" className={styles.pumpStage} />
            <ellipse cx="135" cy="353" rx="27" ry="9" className={styles.pumpStage} />
            <ellipse cx="135" cy="368" rx="27" ry="9" className={styles.pumpStage} />
            <rect x="112" y="380" width="46" height="14" rx="3" className={styles.pumpStage} />
            <rect x="105" y="400" width="60" height="34" rx="6" className={styles.motorBody} />
            <text x="135" y="422" className={styles.motorText}>M</text>
            <circle cx="152" cy="408" r="5" className={`${styles.statusDot} ${styles.pulse}`} />
          </g>
          <text x="135" y="458" className={styles.equipLabel}>ENSAMBLE ESP</text>
          <text x="135" y="473" className={styles.equipSub}>Bomba · Motor · Cable</text>

          {/* Producción acumulada, panel derecho para equilibrar el espacio */}
          <g>
            <rect x="640" y="230" width="220" height="150" rx="10" className={styles.infoPanelBody} />
            <text x="750" y="256" className={styles.equipLabel}>PRODUCCIÓN ACTUAL</text>
            <text x="670" y="290" className={styles.infoRowLabel}>Petróleo</text>
            <text x="850" y="290" className={styles.infoRowValue} textAnchor="end">386 bpd</text>
            <text x="670" y="316" className={styles.infoRowLabel}>Gas</text>
            <text x="850" y="316" className={styles.infoRowValue} textAnchor="end">121 Mscf</text>
            <text x="670" y="342" className={styles.infoRowLabel}>Agua</text>
            <text x="850" y="342" className={styles.infoRowValue} textAnchor="end">42 bwpd</text>
            <line x1="660" y1="356" x2="840" y2="356" className={styles.divider} />
            <text x="670" y="374" className={styles.infoRowLabel}>Frecuencia VSD</text>
            <text x="850" y="374" className={styles.infoRowValue} textAnchor="end">58 Hz</text>
          </g>
        </svg>

        {READOUTS.map((r) => {
          const valor = lecturas[r.key];
          const color = estadoColor(valor, r.warnAt, r.dangerAt, r.invert);
          return (
            <div
              key={r.key}
              className={styles.readout}
              style={{ top: `${r.top}%`, left: `${r.left}%`, borderColor: color }}
            >
              <div className={styles.readoutLabel}>{r.label}</div>
              <div className={styles.readoutValue} style={{ color }}>
                {Number.isFinite(valor) ? valor : '—'}
                <span className={styles.readoutUnit}>{r.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista compacta para pantallas pequeñas: el diagrama de proceso completo
          no cabe con claridad en un teléfono, así que ahí se muestra esta lista
          en su lugar (el diagrama de arriba se oculta por CSS bajo ese ancho). */}
      <div className={styles.mobileList}>
        {READOUTS.map((r) => {
          const valor = lecturas[r.key];
          const color = estadoColor(valor, r.warnAt, r.dangerAt, r.invert);
          return (
            <div key={r.key} className={styles.mobileRow} style={{ borderLeftColor: color }}>
              <div>
                <div className={styles.mobileLabel}>{r.label}</div>
                <div className={styles.mobileSublabel}>{r.sublabel}</div>
              </div>
              <div className={styles.mobileValue} style={{ color }}>
                {Number.isFinite(valor) ? valor : '—'}
                <span className={styles.readoutUnit}>{r.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerbar}>
        <span className={styles.footerStatus}>
          <span className={styles.footerDot}></span>
          Bomba operando con normalidad
        </span>
        <span className={styles.footerHint}>Valores simulados · listo para conectar telemetría real</span>
      </div>
    </div>
  );
}

import { VARIABLES_POR_KEY, estadoVariable } from '../lib/variables';
import styles from './EspDiagram.module.css';

const COLOR_ESTADO = {
  normal: 'var(--status-ok)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)'
};

function numero(valor) {
  if (!Number.isFinite(valor)) return '—';
  const decimales = Math.abs(valor) < 100 ? 1 : 0;
  return valor.toLocaleString('es-VE', { maximumFractionDigits: decimales });
}

// Posiciones en porcentaje, calculadas sobre el viewBox "60 10 860 570" del SVG.
// Cada indicador muestra una de las 34 variables reales de esp.csv; el color sale de los
// umbrales configurados por el usuario (Configuración) cuando la variable tiene regla.
const READOUTS = [
  { key: 'Drive_Voltage', label: 'VOLT', top: 7, left: 8.7 },
  { key: 'Drive_Current', label: 'AMP', top: 14.8, left: 4 },
  { key: 'Output_Frequency', label: 'FREQ', top: 14, left: 41.9 },
  { key: 'Oil', label: 'PETRÓLEO', top: 14, left: 64 },
  { key: 'Discharge_Pressure', label: 'PDP', top: 53.6, left: 20.4 },
  { key: 'Motor_Winding_Temp', label: 'T. MOTOR', top: 58.6, left: 4 },
  { key: 'Intake_Pressure', label: 'PIP', top: 66, left: 20.4 }
];

/**
 * Diagrama de proceso del pozo con la lectura actual reproducida desde esp.csv.
 * valores: las 34 variables de la lectura · cfg: umbrales del usuario ·
 * riesgo: resultado de nivelRiesgo() para la predicción del modelo (o null).
 */
export default function EspDiagram({ valores, cfg, riesgo, recordId, fuente, cargando }) {
  const lecturas = valores || {};
  const estadoDe = (key) => COLOR_ESTADO[estadoVariable(key, lecturas[key], cfg)];
  const produccion = [
    ['Petróleo', 'Oil'], ['Gas', 'Gas'], ['Agua', 'Water'], ['Frecuencia VSD', 'Output_Frequency']
  ];
  const estadoTexto = cargando
    ? 'Cargando lecturas...'
    : riesgo?.texto || 'Sin predicción del modelo';
  const estadoColor = riesgo?.color || 'var(--text-secondary)';

  const now = new Date();
  const fecha = now.toLocaleDateString('es-ES');
  const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <span className={styles.system}>🛢️ ESP · Lectura {recordId ?? '—'}</span>
        <span className={styles.clock}>{fecha} · {hora}</span>
      </div>

      <div className={styles.canvas}>
        <svg viewBox="60 10 860 570" preserveAspectRatio="xMidYMid meet" className={styles.svg}>
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

          {/* Línea de nivel de suelo: marca dónde termina la superficie y empieza el pozo */}
          <line x1="60" y1="135" x2="220" y2="135" className={styles.groundLine} />
          <text x="225" y="139" className={styles.groundLabel}>NIVEL DEL SUELO</text>
          <text x="98" y="128" className={styles.equipSub} textAnchor="middle">Superficie</text>
          <text x="98" y="452" className={styles.equipSub} textAnchor="middle" style={{ opacity: 0.5 }}>▼ Subsuelo</text>

          {/* Cable de potencia bajando por el pozo hasta el motor */}
          <path d="M 128 138 L 128 420" className={styles.cableDown} />
          <line x1="163" y1="160" x2="132" y2="160" className={styles.leaderLine} />
          <text x="168" y="164" className={styles.calloutText}>Cable eléctrico</text>

          <line x1="163" y1="230" x2="150" y2="230" className={styles.leaderLine} />
          <text x="168" y="234" className={styles.calloutText}>Tubería (producción)</text>

          <line x1="163" y1="255" x2="123" y2="255" className={styles.leaderLine} />
          <text x="168" y="259" className={styles.calloutText}>Revestidor (casing)</text>

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
          <line x1="170" y1="353" x2="163" y2="353" className={styles.leaderLine} />
          <text x="176" y="349" className={styles.calloutText}>Bomba multietapa</text>
          <text x="176" y="361" className={styles.calloutTextSub}>(cada óvalo = una etapa)</text>

          <line x1="168" y1="408" x2="163" y2="408" className={styles.leaderLine} />
          <text x="172" y="412" className={styles.calloutText}>Motor eléctrico</text>

          <text x="135" y="458" className={styles.equipLabel}>ENSAMBLE ESP</text>
          <text x="135" y="473" className={styles.equipSub}>Bomba · Motor · Cable</text>

          {/* Producción acumulada, panel derecho para equilibrar el espacio */}
          <g>
            <rect x="640" y="230" width="220" height="150" rx="10" className={styles.infoPanelBody} />
            <text x="750" y="256" className={styles.equipLabel}>PRODUCCIÓN ACTUAL</text>
            {produccion.map(([etiqueta, key], i) => {
              const y = i < 3 ? 290 + i * 26 : 374;
              return (
                <g key={key}>
                  <text x="670" y={y} className={styles.infoRowLabel}>{etiqueta}</text>
                  <text x="850" y={y} className={styles.infoRowValue} textAnchor="end">
                    {numero(lecturas[key])} {VARIABLES_POR_KEY[key].unit}
                  </text>
                </g>
              );
            })}
            <line x1="660" y1="356" x2="840" y2="356" className={styles.divider} />
          </g>

          {/* Leyenda: qué significa cada símbolo del diagrama */}
          <g>
            <rect x="640" y="400" width="220" height="150" rx="10" className={styles.infoPanelBody} />
            <text x="750" y="426" className={styles.equipLabel}>LEYENDA</text>

            <line x1="660" y1="446" x2="690" y2="446" className={styles.pipe} />
            <text x="698" y="450" className={styles.legendText}>Línea de flujo (producción)</text>

            <line x1="660" y1="468" x2="690" y2="468" className={styles.casing} />
            <line x1="660" y1="468" x2="690" y2="468" transform="translate(0,4)" className={styles.casing} />
            <text x="698" y="472" className={styles.legendText}>Revestidor / tubería del pozo</text>

            <line x1="660" y1="490" x2="690" y2="490" className={styles.cableDown} />
            <text x="698" y="494" className={styles.legendText}>Cable de potencia</text>

            <ellipse cx="675" cy="512" rx="15" ry="5" className={styles.pumpStage} />
            <text x="698" y="516" className={styles.legendText}>Etapa de bomba centrífuga</text>

            <circle cx="675" cy="534" r="4" className={`${styles.statusDot} ${styles.pulse}`} />
            <text x="698" y="538" className={styles.legendText}>Equipo operando</text>
          </g>
        </svg>

        {READOUTS.map((r) => {
          const valor = lecturas[r.key];
          const color = estadoDe(r.key);
          return (
            <div
              key={r.key}
              className={styles.readout}
              style={{ top: `${r.top}%`, left: `${r.left}%`, borderColor: color }}
              title={VARIABLES_POR_KEY[r.key].label}
            >
              <div className={styles.readoutLabel}>{r.label}</div>
              <div className={styles.readoutValue} style={{ color }}>
                {numero(valor)}
                <span className={styles.readoutUnit}>{VARIABLES_POR_KEY[r.key].unit}</span>
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
          const color = estadoDe(r.key);
          return (
            <div key={r.key} className={styles.mobileRow} style={{ borderLeftColor: color }}>
              <div>
                <div className={styles.mobileLabel}>{r.label}</div>
                <div className={styles.mobileSublabel}>{VARIABLES_POR_KEY[r.key].label}</div>
              </div>
              <div className={styles.mobileValue} style={{ color }}>
                {numero(valor)}
                <span className={styles.readoutUnit}>{VARIABLES_POR_KEY[r.key].unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerbar}>
        <span className={styles.footerStatus} style={{ color: estadoColor }}>
          <span className={styles.footerDot} style={{ background: estadoColor }}></span>
          {estadoTexto}
        </span>
        <span className={styles.footerHint}>Reproducción de lecturas reales · {fuente || 'esp.csv'}</span>
      </div>
    </div>
  );
}

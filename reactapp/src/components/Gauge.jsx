import styles from './Gauge.module.css';

/**
 * Medidor circular estilo SCADA/HMI (arco de 270°).
 * value/min/max definen el rango físico de la variable.
 * warnAt / dangerAt (opcionales) definen a partir de qué valor
 * el arco cambia a amarillo / rojo. Si se omiten, siempre se ve en verde.
 */
export default function Gauge({
  label,
  sublabel,
  value,
  min = 0,
  max = 100,
  unit = '',
  warnAt,
  dangerAt,
  invert = false, // true: alerta cuando el valor es BAJO (ej. presión de entrada)
  size = 168
}) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const sweep = 0.75; // arco de 270° de 360°

  const clamped = Math.max(min, Math.min(max, value));
  const pct = max > min ? (clamped - min) / (max - min) : 0;

  let color = 'var(--status-ok)';
  if (!invert) {
    if (dangerAt !== undefined && value >= dangerAt) color = 'var(--status-danger)';
    else if (warnAt !== undefined && value >= warnAt) color = 'var(--status-warning)';
  } else {
    if (dangerAt !== undefined && value <= dangerAt) color = 'var(--status-danger)';
    else if (warnAt !== undefined && value <= warnAt) color = 'var(--status-warning)';
  }

  const trackDash = `${circumference * sweep} ${circumference}`;
  const valueDash = `${circumference * sweep * pct} ${circumference}`;

  return (
    <div className={styles.wrap} style={{ width: size }}>
      <svg viewBox="0 0 180 180" width={size} height={size}>
        <g transform="rotate(135 90 90)">
          <circle
            cx="90" cy="90" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={trackDash}
          />
          <circle
            cx="90" cy="90" r={r}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={valueDash}
            style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.4s ease' }}
          />
        </g>
      </svg>
      <div className={styles.center}>
        <div className={styles.value} style={{ color }}>
          {Number.isFinite(value) ? value : '—'}
        </div>
        <div className={styles.unit}>{unit}</div>
        <div className={styles.label}>{label}</div>
      </div>
      {sublabel && <div className={styles.sublabel}>{sublabel}</div>}
    </div>
  );
}

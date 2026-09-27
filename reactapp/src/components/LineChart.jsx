/**
 * Gráfica de líneas en SVG, sin dependencias. Todas las series comparten la escala vertical
 * (misma unidad); los valores actuales se muestran en la leyenda y las líneas de umbral
 * (opcionales) se dibujan punteadas.
 */
export default function LineChart({ data, series, height = 180, umbrales = [] }) {
  const width = 600;
  const pad = { top: 10, right: 10, bottom: 18, left: 10 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        Esperando lecturas...
      </div>
    );
  }

  // Escala común: las series de una misma gráfica comparten unidad (psi o °F).
  const valores = series.flatMap((s) => data.map((d) => d[s.key]).filter(Number.isFinite));
  umbrales.forEach((u) => { if (Number.isFinite(u.valor)) valores.push(u.valor); });
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) { min -= 1; max += 1; }
  const margen = (max - min) * 0.08;
  const rango = { min: min - margen, max: max + margen };

  const x = (i) => pad.left + (i / (data.length - 1)) * innerW;
  const y = (_key, v) => pad.top + innerH - ((v - rango.min) / (rango.max - rango.min)) * innerH;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Gráfica de tendencias">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad.left} x2={width - pad.right} y1={pad.top + innerH * f} y2={pad.top + innerH * f}
            stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
        ))}
        {umbrales.map((u) => {
          const s = series.find((ss) => ss.key === u.key);
          if (!s || !Number.isFinite(u.valor)) return null;
          const yy = y(u.key, u.valor);
          return (
            <g key={`u-${u.key}`}>
              <line x1={pad.left} x2={width - pad.right} y1={yy} y2={yy} stroke={s.color} strokeDasharray="5 4" strokeWidth="1" opacity="0.7" />
              <text x={width - pad.right} y={yy - 3} fill={s.color} fontSize="10" textAnchor="end">{u.etiqueta}</text>
            </g>
          );
        })}
        {series.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            points={data.map((d, i) => (Number.isFinite(d[s.key]) ? `${x(i)},${y(s.key, d[s.key])}` : null)).filter(Boolean).join(' ')}
          />
        ))}
        <text x={pad.left} y={pad.top + 8} fill="var(--text-secondary)" fontSize="10">{Math.round(rango.max).toLocaleString('es-VE')}</text>
        <text x={pad.left} y={pad.top + innerH - 2} fill="var(--text-secondary)" fontSize="10">{Math.round(rango.min).toLocaleString('es-VE')}</text>
        <text x={pad.left} y={height - 4} fill="var(--text-secondary)" fontSize="10">{data.length} lecturas</text>
        <text x={width - pad.right} y={height - 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end">actual</text>
      </svg>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.72rem', marginTop: 4 }}>
        {series.map((s) => {
          const ultimo = data[data.length - 1]?.[s.key];
          return (
            <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 3, background: s.color, borderRadius: 2, display: 'inline-block' }} />
              {s.label}: <strong style={{ color: 'var(--text-primary)' }}>{s.formato ? s.formato(ultimo) : ultimo}</strong>
            </span>
          );
        })}
      </div>
    </div>
  );
}

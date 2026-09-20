import { useState } from 'react';
import Card from '../components/Card';
import { POZOS } from '../mock/mockData';

const ESTADO_COLOR = { Operando: '#22C55E', Alerta: '#F59E0B', Falla: '#EF4444', Mantenimiento: '#8B5CF6', Parado: '#64748B' };
const ESTADO_EMOJI = { Operando: '🟢', Alerta: '🟡', Falla: '🔴', Mantenimiento: '🟣', Parado: '⏸' };

/**
 * ARREGLADO: antes esta página mostraba los pozos como una simple grilla de
 * botones (no un mapa real). Cada pozo en src/mock/mockData.js ya tenía guardadas
 * sus coordenadas (x, y como % del área), pero nunca se usaban para ubicarlo. Ahora
 * sí: cada pin se posiciona con `left: x%` / `top: y%` sobre un lienzo tipo
 * "terreno", como un mapa de verdad. Esto NO depende del backend — es puro
 * frontend. Cuando conectes datos reales, solo hay que traer lat/lng (o tus propias
 * coordenadas de planta) desde tu API y usarlas en vez de las de mockData.js.
 */
export default function Mapa() {
  const [seleccionado, setSeleccionado] = useState(null);

  return (
    <Card title="🗺️ Mapa de pozos">
      <div className="campo-mapa">
        <svg className="campo-fondo" viewBox="0 0 100 60" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="60" fill="url(#grid)" />
          <path d="M 5 5 Q 40 25 90 15" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          <path d="M 10 55 Q 45 35 85 50" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
        </svg>

        {POZOS.map((p) => (
          <button
            key={p.id}
            className="pozo-pin-mapa"
            style={{ left: `${p.x}%`, top: `${p.y}%`, borderColor: ESTADO_COLOR[p.estado] }}
            onClick={() => setSeleccionado(p)}
            title={p.id}
          >
            <span className="pozo-pin-dot" style={{ background: ESTADO_COLOR[p.estado] }} />
            <span className="pozo-pin-label">{p.id}</span>
          </button>
        ))}
      </div>

      <div className="mapa-leyenda">
        {Object.entries(ESTADO_COLOR).map(([estado, color]) => (
          <span key={estado} className="mapa-leyenda-item">
            <span className="pozo-pin-dot" style={{ background: color }} /> {estado}
          </span>
        ))}
      </div>

      {seleccionado && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSeleccionado(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>🛢️ Pozo {seleccionado.id}</h3>
              <span className="modal-close" onClick={() => setSeleccionado(null)}>✕</span>
            </div>
            <div style={{ color: ESTADO_COLOR[seleccionado.estado], fontWeight: 600, marginBottom: 12 }}>
              {ESTADO_EMOJI[seleccionado.estado]} {seleccionado.estado}
            </div>
            <div className="grid-2">
              <div className="mini-stat">
                <div className="lab">⛽ Petróleo</div>
                <div className="num">{seleccionado.petroleo}</div>
              </div>
              <div className="mini-stat">
                <div className="lab">💧 Gas</div>
                <div className="num">{seleccionado.gas}</div>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              💡 Datos y posiciones de ejemplo (sin backend conectado todavía).
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

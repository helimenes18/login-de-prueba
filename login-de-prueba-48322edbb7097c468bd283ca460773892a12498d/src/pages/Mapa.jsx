import { useState } from 'react';
import Card from '../components/Card';
import { POZOS } from '../mock/mockData';

const ESTADO_COLOR = { Operando: '#22C55E', Alerta: '#F59E0B', Falla: '#EF4444', Mantenimiento: '#8B5CF6', Parado: '#64748B' };
const ESTADO_EMOJI = { Operando: '🟢', Alerta: '🟡', Falla: '🔴', Mantenimiento: '🟣', Parado: '⏸' };

export default function Mapa() {
  const [seleccionado, setSeleccionado] = useState(null);

  return (
    <Card title="🗺️ Pozos">
      <div className="mapa-grid">
        {POZOS.map((p) => (
          <button
            key={p.id}
            className="pozo-pin"
            style={{ borderColor: ESTADO_COLOR[p.estado] }}
            onClick={() => setSeleccionado(p)}
          >
            <span style={{ color: ESTADO_COLOR[p.estado] }}>{ESTADO_EMOJI[p.estado]}</span> {p.id}
          </button>
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
              💡 Datos de ejemplo (sin backend conectado todavía).
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

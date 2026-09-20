import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VARIABLES } from '../mock/mockData';

/**
 * AGREGADO: esquema tipo SCADA del sistema BES (bomba electrosumergible),
 * calcado del diagrama de referencia que mandaste (planta con 7 equipos:
 * tanque, tolva, quemador, tambor rotativo, torre de ciclones, silos y
 * ventiladores), pero con sus 7 equivalentes reales de un pozo con BES:
 *
 *   Diagrama original          →  Equivalente BES (acá)
 *   ------------------------------------------------------------
 *   Tanque de agua              →  (no aplica directo; se omite)
 *   Cámara de combustión         →  Transformador (fuente de energía)
 *   Ventiladores/extractores     →  VSD / variador de velocidad
 *   Tolva de alimentación        →  Cabezal de pozo (wellhead)
 *   Tambor rotativo (equipo ppal)→  Bomba + Motor ESP (fondo de pozo)
 *   (equipo adicional de proceso)→  Separador de gas (fondo de pozo)
 *   Torre de ciclones            →  Separador de producción (superficie)
 *   Silos de producto final      →  Tanques de almacenamiento
 *
 * Igual que en tu referencia: valores en vivo superpuestos, puntos de color
 * por estado, franja de estado + reloj arriba, y ticker de alarmas + botones
 * de acceso rápido (Alarmas / Tendencias / Reportes / Límites) abajo.
 */

// Variables agrupadas por zona física, para las dos franjas de chips
const GRUPO_SUPERFICIE = ['voltaje', 'corriente', 'chp', 'thp', 'plp', 'tlp'];
const GRUPO_FONDO = ['pip', 'pdp', 'pdt', 'vibracion'];

const POSICIONES = {
  voltaje: { x: 8, y: 34 },
  corriente: { x: 21, y: 34 },
  chp: { x: 46, y: 34 },
  thp: { x: 60, y: 34 },
  plp: { x: 74, y: 34 },
  tlp: { x: 90, y: 34 },
  pip: { x: 58, y: 76 },
  pdp: { x: 78, y: 76 },
  pdt: { x: 58, y: 90 },
  vibracion: { x: 78, y: 90 },
};

const ESTADO_COLOR = { normal: '#22C55E', warning: '#F59E0B', danger: '#EF4444' };

function estadoDe(v, lectura, umbrales) {
  const valor = lectura[v.key];
  if (!v.regla) return 'normal';
  return v.regla(valor, umbrales) ? 'danger' : 'normal';
}

export default function PozoEsquema({ lectura, umbrales }) {
  const [verAlarmas, setVerAlarmas] = useState(false);
  const alarmas = VARIABLES.filter((v) => estadoDe(v, lectura, umbrales) === 'danger');

  return (
    <div>
      <div className="scada-barra">
        <span className={'scada-estado ' + (alarmas.length ? 'danger' : 'normal')}>
          {alarmas.length ? `⚠️ ${alarmas.length} variable(s) en alarma` : '✅ Sistema operando normal'}
        </span>
        <span className="scada-reloj">{new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'medium' })}</span>
      </div>

      <div className="esquema-bes">
        <svg className="esquema-fondo" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 1) Transformador */}
          <rect x="2" y="10" width="10" height="13" rx="1.5" className="esq-equipo" />
          <path d="M4.5 13 l2 2.2 -1.2 2.2 2 2.2 -1.2 2.2 2 2.2" className="esq-linea" fill="none" />
          <text x="7" y="26.5" textAnchor="middle" className="esq-texto">TRAFO</text>

          {/* 2) VSD / variador de velocidad */}
          <rect x="16" y="10" width="10" height="13" rx="1.5" className="esq-equipo" />
          <circle cx="21" cy="16.5" r="2.3" className="esq-linea" fill="none" />
          <path d="M21 14.5 L21 16.5 L22.3 17.3" className="esq-linea" fill="none" />
          <text x="21" y="26.5" textAnchor="middle" className="esq-texto">VSD</text>

          {/* cableado hasta el cabezal */}
          <line x1="26" y1="16.5" x2="37" y2="16.5" className="esq-linea" />
          <line x1="37" y1="16.5" x2="37" y2="9" className="esq-linea" />

          {/* 3) Cabezal de pozo (wellhead) */}
          <rect x="34" y="4" width="6" height="6" className="esq-equipo" />
          <text x="37" y="26.5" textAnchor="middle" className="esq-texto">CABEZAL</text>

          {/* tubería / casing bajando al fondo del pozo */}
          <line x1="35.5" y1="10" x2="35.5" y2="63" className="esq-tuberia" />
          <line x1="38.5" y1="10" x2="38.5" y2="63" className="esq-tuberia" />

          {/* línea de flujo en superficie hacia el separador de producción */}
          <line x1="38.5" y1="9" x2="59" y2="9" className="esq-tuberia" />

          {/* 6) Separador de producción (torre, análogo a la torre de ciclones) */}
          <path d="M59 3 h11 v13 l-5.5 6 -5.5 -6 z" className="esq-equipo" />
          <text x="64.5" y="25.5" textAnchor="middle" className="esq-texto">SEPARADOR</text>
          <line x1="64.5" y1="22" x2="64.5" y2="27" className="esq-tuberia" />
          <line x1="64.5" y1="27" x2="82" y2="16" className="esq-tuberia" />

          {/* 7) Tanques de almacenamiento (análogo a los silos) */}
          <rect x="82" y="6" width="6.5" height="15" rx="1" className="esq-equipo" />
          <rect x="90.5" y="6" width="6.5" height="15" rx="1" className="esq-equipo" />
          <line x1="88.5" y1="13" x2="90.5" y2="13" className="esq-linea" />
          <text x="87" y="24" textAnchor="middle" className="esq-texto">TANQUES</text>

          {/* fondo de pozo: separador de gas + bomba/motor ESP */}
          <line x1="35.5" y1="63" x2="35.5" y2="69" className="esq-tuberia" />
          <line x1="38.5" y1="63" x2="38.5" y2="69" className="esq-tuberia" />

          {/* 4) Separador de gas (fondo de pozo) */}
          <rect x="30" y="69" width="14" height="7" rx="2" className="esq-equipo" />
          <text x="37" y="80" textAnchor="middle" className="esq-texto">SEP. GAS</text>

          {/* 5) Bomba + Motor ESP (equipo principal, análogo al tambor rotativo) */}
          <rect x="28" y="82" width="18" height="11" rx="3" className="esq-equipo esq-tambor" />
          <line x1="31" y1="82" x2="31" y2="93" className="esq-linea" />
          <line x1="34" y1="82" x2="34" y2="93" className="esq-linea" />
          <line x1="40" y1="82" x2="40" y2="93" className="esq-linea" />
          <line x1="43" y1="82" x2="43" y2="93" className="esq-linea" />
          <text x="37" y="88.5" textAnchor="middle" className="esq-texto esq-texto-fuerte">ESP</text>
        </svg>

        {VARIABLES.map((v) => {
          const pos = POSICIONES[v.key];
          if (!pos) return null;
          const estado = estadoDe(v, lectura, umbrales);
          return (
            <div key={v.key} className="esq-chip" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
              <span className="esq-dot" style={{ background: ESTADO_COLOR[estado], boxShadow: `0 0 8px ${ESTADO_COLOR[estado]}` }} />
              <div className="esq-chip-texto">
                <div className="esq-chip-label">{v.label}</div>
                <div className="esq-chip-valor">{lectura[v.key]} {v.unidad}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticker de alarmas, como el "F34 ..." del pie de tu imagen de referencia */}
      <div className="scada-ticker">
        {alarmas.length > 0
          ? `⚠️ ${alarmas[0].label} fuera de rango (${lectura[alarmas[0].key]} ${alarmas[0].unidad})${alarmas.length > 1 ? ` · +${alarmas.length - 1} más` : ''}`
          : 'Sin alarmas activas'}
      </div>

      <div className="scada-tabs">
        <button className={'scada-tab' + (verAlarmas ? ' active' : '')} onClick={() => setVerAlarmas((v) => !v)}>
          🔔 Alarmas ({alarmas.length})
        </button>
        <Link className="scada-tab" to="/historial">📈 Tendencias</Link>
        <Link className="scada-tab" to="/reportes">📄 Reportes</Link>
        <Link className="scada-tab" to="/configuracion">🎚️ Límites</Link>
      </div>

      {verAlarmas && (
        <div className="scada-alarmas-lista">
          {alarmas.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>No hay variables fuera de rango en este momento.</p>}
          {alarmas.map((v) => (
            <div key={v.key} className="scada-alarma-item">
              <span className="esq-dot" style={{ background: ESTADO_COLOR.danger }} />
              {v.label}: <strong>{lectura[v.key]} {v.unidad}</strong>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 10 }}>
        💡 Diagrama simplificado del sistema BES (bomba electrosumergible), con los mismos
        7 tipos de equipo de tu imagen de referencia. Los puntos de color siguen los
        umbrales configurados en Configuración.
      </p>

      <details className="scada-glosario">
        <summary>📖 Glosario de variables (Capítulo I)</summary>
        <div className="scada-glosario-grid">
          {VARIABLES.map((v) => (
            <div key={v.key}>
              <strong>{v.label}</strong> — {v.nombreCompleto}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

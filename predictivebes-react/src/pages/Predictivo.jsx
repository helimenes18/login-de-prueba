import { useState } from 'react';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { generarLecturaSensores, predecirRiesgo, VARIABLES } from '../mock/mockData';

const NIVEL_COLOR = { Bajo: '#22C55E', Medio: '#F59E0B', Alto: '#EF4444' };

export default function Predictivo() {
  const { settings } = useSettings();
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  function actualizarPrediccion() {
    setCargando(true);
    setTimeout(() => {
      const lectura = generarLecturaSensores();
      setResultado({ lectura, riesgo: predecirRiesgo(lectura, settings) });
      setCargando(false);
    }, 600);
  }

  return (
    <Card title="🤖 Predicción de falla">
      <button className="btn-primary" onClick={actualizarPrediccion} disabled={cargando}>
        {cargando ? '⏳ Calculando...' : '🔄 Actualizar predicción'}
      </button>

      {resultado && (
        <div style={{ marginTop: 20 }}>
          <div className="num" style={{ fontSize: '2.2rem', color: NIVEL_COLOR[resultado.riesgo.nivel] }}>
            {resultado.riesgo.score}%
          </div>
          <p style={{ color: NIVEL_COLOR[resultado.riesgo.nivel], fontWeight: 600 }}>
            Riesgo {resultado.riesgo.nivel}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Modelo: {resultado.riesgo.algoritmo}</p>
          <table className="var-table" style={{ marginTop: 16 }}>
            <tbody>
              {VARIABLES.map((v) => (
                <tr key={v.key} title={v.nombreCompleto}>
                  <td>{v.label}</td>
                  <td>{resultado.lectura[v.key]} {v.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

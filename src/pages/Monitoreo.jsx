import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { generarLecturaSensores, predecirRiesgo } from '../mock/mockData';

const VARIABLES = [
  { key: 'corriente', label: 'Corriente', unidad: 'A', regla: (v, u) => v < u.corrienteMin },
  { key: 'voltaje', label: 'Voltaje', unidad: 'V' },
  { key: 'chp', label: 'CHP', unidad: 'psi' },
  { key: 'thp', label: 'THP', unidad: 'psi' },
  { key: 'plp', label: 'PLP', unidad: 'psi' },
  { key: 'pip', label: 'PIP', unidad: 'psi', regla: (v, u) => v < u.pipMin },
  { key: 'pdp', label: 'PDP', unidad: 'psi', regla: (v, u) => v > u.pdpMax },
  { key: 'pdt', label: 'PDT', unidad: '°F', regla: (v, u) => v > u.pdtMax },
  { key: 'tlp', label: 'TLP', unidad: '°F' },
  { key: 'vibracion', label: 'Vibración', unidad: 'G', regla: (v) => v > 1.5 },
];

export default function Monitoreo() {
  const { settings } = useSettings();
  const [lectura, setLectura] = useState(generarLecturaSensores());
  const [riesgo, setRiesgo] = useState(null);

  useEffect(() => {
    const ms = (settings.intervaloSegundos || 3) * 1000;
    const id = setInterval(() => setLectura(generarLecturaSensores()), ms);
    return () => clearInterval(id);
  }, [settings.intervaloSegundos]);

  function analizar() {
    setRiesgo(predecirRiesgo(lectura, settings));
  }

  return (
    <div className="grid-2">
      <Card title="📡 Variables en tiempo real">
        <table className="var-table">
          <tbody>
            {VARIABLES.map((v) => {
              const valor = lectura[v.key];
              const fueraDeRango = v.regla ? v.regla(valor, settings) : false;
              return (
                <tr key={v.key} className="var-row">
                  <td>{v.label}</td>
                  <td className={'value ' + (fueraDeRango ? 'danger' : 'normal')}>
                    {valor} {v.unidad}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          Se actualiza cada {settings.intervaloSegundos}s. Los valores en rojo superan los
          umbrales definidos en Configuración.
        </p>
      </Card>

      <Card title="🤖 Análisis puntual">
        <button className="btn-primary" onClick={analizar}>Analizar con IA ahora</button>
        {riesgo && (
          <p style={{ marginTop: 12 }}>
            Riesgo estimado: <strong>{riesgo.score}%</strong> ({riesgo.nivel})
          </p>
        )}
      </Card>
    </div>
  );
}

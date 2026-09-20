import { useEffect, useState } from 'react';
import Card from '../components/Card';
import PozoEsquema from '../components/PozoEsquema';
import { useSettings } from '../context/SettingsContext';
import { generarLecturaSensores, predecirRiesgo, VARIABLES } from '../mock/mockData';

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
    <>
      <Card title="🛢️ Esquema del pozo (BES)" style={{ marginBottom: 16 }}>
        <PozoEsquema lectura={lectura} umbrales={settings} />
      </Card>

      <div className="grid-2">
        <Card title="📋 Detalle de variables">
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
    </>
  );
}

import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { generarLecturaSensores, predecirRiesgo } from '../mock/mockData';

const NIVEL_COLOR = { Bajo: '#22C55E', Medio: '#F59E0B', Alto: '#EF4444' };

export default function Dashboard() {
  const { settings } = useSettings();
  const [lectura, setLectura] = useState(generarLecturaSensores());
  const [riesgo, setRiesgo] = useState(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  useEffect(() => {
    const ms = (settings.intervaloSegundos || 3) * 1000;
    const id = setInterval(() => setLectura(generarLecturaSensores()), ms);
    return () => clearInterval(id);
  }, [settings.intervaloSegundos]);

  function analizarIA() {
    setCargandoIA(true);
    // Simula la latencia de una llamada real a un modelo (antes: fetch a Render)
    setTimeout(() => {
      setRiesgo(predecirRiesgo(lectura, settings));
      setCargandoIA(false);
    }, 500);
  }

  useEffect(() => { analizarIA(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="grid-2">
      <Card title="⚡ Corriente / Voltaje">
        <div className="stats-mini">
          <div className="item"><div className="num">{lectura.corriente} A</div><div className="lab">Corriente</div></div>
          <div className="item"><div className="num">{lectura.voltaje} V</div><div className="lab">Voltaje</div></div>
        </div>
      </Card>

      <Card title="🤖 Riesgo de falla (IA)">
        {riesgo ? (
          <>
            <div className="num" style={{ fontSize: '2rem', color: NIVEL_COLOR[riesgo.nivel] }}>
              {riesgo.score}%
            </div>
            <p style={{ color: NIVEL_COLOR[riesgo.nivel], fontWeight: 600 }}>Riesgo {riesgo.nivel}</p>
          </>
        ) : <p>Calculando...</p>}
        <button className="btn-primary" onClick={analizarIA} disabled={cargandoIA}>
          {cargandoIA ? '⏳ Analizando...' : '🔄 Analizar con IA'}
        </button>
      </Card>

      <Card title="ℹ️ Nota">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Estos valores son simulados en el navegador (no hay backend conectado). El
          intervalo de actualización ({settings.intervaloSegundos}s) y los umbrales de
          riesgo se toman de la página Configuración.
        </p>
      </Card>
    </div>
  );
}

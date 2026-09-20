import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { generarLecturaSensores, predecirRiesgo } from '../mock/mockData';

const NIVEL_COLOR = { Bajo: '#22C55E', Medio: '#F59E0B', Alto: '#EF4444' };

/**
 * AJUSTADO según el Capítulo I: "...el dashboard final no solo mostrará
 * probabilidades de falla, sino que presentará en tiempo real las variables de
 * superficie como la Presión y Temperatura en la Línea de Producción (PLP, TLP),
 * así como la Presión en el Cabezal de la Tubería (THP)". Por eso, además del
 * riesgo de IA, el dashboard ahora muestra esas 3 variables de superficie.
 */
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
      <Card title="🤖 Riesgo de falla (Random Forest / LSTM)">
        {riesgo ? (
          <>
            <div className="num" style={{ fontSize: '2rem', color: NIVEL_COLOR[riesgo.nivel] }}>
              {riesgo.score}%
            </div>
            <p style={{ color: NIVEL_COLOR[riesgo.nivel], fontWeight: 600 }}>Riesgo {riesgo.nivel}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Modelo: {riesgo.algoritmo}</p>
          </>
        ) : <p>Calculando...</p>}
        <button className="btn-primary" onClick={analizarIA} disabled={cargandoIA}>
          {cargandoIA ? '⏳ Analizando...' : '🔄 Analizar con IA'}
        </button>
      </Card>

      <Card title="📟 Variables de superficie en tiempo real">
        <div className="stats-mini">
          <div className="item"><div className="num">{lectura.plp} psi</div><div className="lab">PLP</div></div>
          <div className="item"><div className="num">{lectura.tlp} °F</div><div className="lab">TLP</div></div>
          <div className="item"><div className="num">{lectura.thp} psi</div><div className="lab">THP</div></div>
        </div>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 10 }}>
          Para contrastar la alerta de la IA con la lectura hidráulica del sistema
          (Presión y Temperatura en la Línea de Producción, Presión en el Cabezal
          de la Tubería), tal como pide el planteamiento del problema.
        </p>
      </Card>

      <Card title="⚡ Corriente / Voltaje del motor">
        <div className="stats-mini">
          <div className="item"><div className="num">{lectura.corriente} A</div><div className="lab">Corriente</div></div>
          <div className="item"><div className="num">{lectura.voltaje} V</div><div className="lab">Voltaje</div></div>
        </div>
      </Card>

      <Card title="ℹ️ Nota">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Estos valores son simulados en el navegador (el backend de predicción con
          Random Forest/LSTM todavía no está reconectado). El intervalo de
          actualización ({settings.intervaloSegundos}s) y los umbrales de riesgo se
          toman de la página Configuración (guardados en Supabase).
        </p>
      </Card>
    </div>
  );
}

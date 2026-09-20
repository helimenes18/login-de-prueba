import { useState } from 'react';
import Card from '../components/Card';
import { generarRegistrosHistorial } from '../mock/mockData';

const STORAGE_KEY = 'pbes_reportes';

function cargarHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarHistorial(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export default function Reportes() {
  const [formato, setFormato] = useState('csv');
  const [historial, setHistorial] = useState(cargarHistorial());

  function generarReporte() {
    const registros = generarRegistrosHistorial(40);
    const filename = `reporte_${Date.now()}.${formato}`;
    let blob;

    if (formato === 'csv') {
      const encabezado = 'id,categoria,valor,timestamp\n';
      const filas = registros.map((r) => `${r.id},${r.categoria},${r.valor},${r.timestamp}`).join('\n');
      blob = new Blob([encabezado + filas], { type: 'text/csv' });
    } else {
      blob = new Blob([JSON.stringify(registros, null, 2)], { type: 'application/json' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    const nuevo = { filename, formato, total: registros.length, fecha: new Date().toISOString() };
    const nuevaLista = [nuevo, ...historial].slice(0, 10);
    setHistorial(nuevaLista);
    guardarHistorial(nuevaLista);
  }

  return (
    <div className="grid-2">
      <Card title="📄 Generar reporte">
        <div className="form-group">
          <label>Formato</label>
          <select value={formato} onChange={(e) => setFormato(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <button className="btn-primary" onClick={generarReporte}>📥 Generar y descargar</button>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 10 }}>
          Los datos son simulados (no hay backend conectado). El archivo se descarga
          directo desde el navegador.
        </p>
      </Card>

      <Card title="📋 Reportes generados">
        {historial.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aún no generaste ningún reporte.</p>}
        {historial.map((r, i) => (
          <div className="report-item" key={i}>
            <span>{r.filename}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              {new Date(r.fecha).toLocaleDateString('es-MX')}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

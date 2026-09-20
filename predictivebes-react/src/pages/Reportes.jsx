import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { generarRegistrosHistorial } from '../mock/mockData';

export default function Reportes() {
  const { user } = useAuth();
  const [formato, setFormato] = useState('csv');
  const [historial, setHistorial] = useState([]);
  const [avisoTabla, setAvisoTabla] = useState('');

  async function cargarHistorial() {
    if (!user) return;
    const { data, error } = await supabase
      .from('reportes_generados')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      setAvisoTabla('No se pudo cargar el historial (¿existe la tabla "reportes_generados" en Supabase?).');
      return;
    }
    setAvisoTabla('');
    setHistorial(data || []);
  }

  useEffect(() => { cargarHistorial(); /* eslint-disable-next-line */ }, [user]);

  async function generarReporte() {
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

    if (user) {
      const { error } = await supabase.from('reportes_generados').insert({
        user_id: user.id,
        tipo: 'historial',
        formato,
        total_registros: registros.length,
        filename,
      });
      if (error) setAvisoTabla('El reporte se descargó, pero no se pudo guardar en el historial (¿existe la tabla "reportes_generados" en Supabase?).');
    }
    cargarHistorial();
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
          Los datos del reporte son simulados (el backend de predicción/sensores todavía
          no está reconectado). El historial de reportes sí es real, vía Supabase.
        </p>
      </Card>

      <Card title="📋 Reportes generados">
        {avisoTabla && <p style={{ color: '#F59E0B', fontSize: '0.75rem', marginBottom: 8 }}>⚠️ {avisoTabla}</p>}
        {historial.length === 0 && !avisoTabla && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aún no generaste ningún reporte.</p>}
        {historial.map((r) => (
          <div className="report-item" key={r.id}>
            <span>{r.filename}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              {new Date(r.created_at).toLocaleDateString('es-MX')}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

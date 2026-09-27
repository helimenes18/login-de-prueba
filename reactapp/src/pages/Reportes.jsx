import { useEffect, useState } from 'react';
import { obtenerResumen, obtenerRegistrosCrudos } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import styles from './Reportes.module.css';

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('Reporte operativo');
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-06-30');
  const [formato, setFormato] = useState('CSV');
  const [generando, setGenerando] = useState(false);

  const [resumen, setResumen] = useState(null); // entries [k,v] o null mientras carga
  const [resumenError, setResumenError] = useState('');
  const [resumenLoading, setResumenLoading] = useState(true);

  const [reportesGenerados, setReportesGenerados] = useState(null); // null = cargando
  const [reportesError, setReportesError] = useState('');

  const cargarResumen = async () => {
    setResumenLoading(true);
    setResumenError('');
    try {
      const data = await obtenerResumen();
      const entries = Object.entries(data || {});
      setResumen(entries);
    } catch (err) {
      console.error('Error cargando resumen:', err);
      setResumenError(err.message);
      setResumen(null);
    } finally {
      setResumenLoading(false);
    }
  };

  const cargarHistorialReportes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('reportes_generados')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setReportesGenerados(data || []);
    } catch (err) {
      console.warn('No se pudo cargar el historial de reportes (¿existe "reportes_generados" en Supabase?):', err.message);
      setReportesError('No se pudo cargar el historial (la tabla "reportes_generados" aún no existe en Supabase).');
      setReportesGenerados([]);
    }
  };

  useEffect(() => {
    cargarResumen();
    cargarHistorialReportes();
  }, []);

  async function registrarReporteGenerado({ tipo, formato, fechaInicio, fechaFin, totalRegistros, filename }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('reportes_generados').insert({
        user_id: session.user.id,
        tipo, formato,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        total_registros: totalRegistros,
        filename
      });
      if (error) throw error;
    } catch (err) {
      console.warn('No se pudo registrar el reporte (¿existe "reportes_generados" en Supabase?):', err.message);
    } finally {
      cargarHistorialReportes();
    }
  }

  async function handleGenerarReporte() {
    setGenerando(true);
    try {
      const registros = await obtenerRegistrosCrudos(1000);

      if (registros.length === 0) {
        alert('⚠️ No hay registros disponibles para exportar.');
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const tipoSlug = tipoReporte.replace(/\s/g, '_').toLowerCase();
      let blob, filename;

      if (formato === 'CSV') {
        const header = 'record_id,category,value,timestamp\n';
        const rows = registros.map((r) =>
          `${r.record_id || 'N/A'},${r.category || 'N/A'},${r.value || 'N/A'},${r.timestamp || 'N/A'}`
        ).join('\n');
        blob = new Blob([header + rows], { type: 'text/csv' });
        filename = `reporte_${tipoSlug}_${timestamp}.csv`;
      } else {
        const reporte = {
          tipo: tipoReporte,
          fecha_generacion: new Date().toISOString(),
          periodo: { inicio: fechaInicio, fin: fechaFin },
          total_registros: registros.length,
          datos: registros
        };
        blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
        filename = `reporte_${tipoSlug}_${timestamp}.json`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      await registrarReporteGenerado({
        tipo: tipoReporte, formato, fechaInicio, fechaFin,
        totalRegistros: registros.length, filename
      });
    } catch (err) {
      console.error('Error generando el reporte:', err);
      alert('❌ No se pudo generar el reporte: ' + err.message);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📄 Reportes y exportación</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Genera reportes operativos y exporta datos de monitoreo</p>
      </div>

      <div className={styles['report-grid']}>
        <div className={styles.card}>
          <h3>📊 Generar reporte</h3>
          <div className={styles['form-group']}>
            <label>Tipo de reporte</label>
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option>Reporte operativo</option>
              <option>Reporte de fallas</option>
              <option>Reporte predictivo</option>
              <option>Reporte de variables</option>
            </select>
          </div>
          <div className={styles['form-group']}>
            <label>Fecha de inicio</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className={styles['form-group']}>
            <label>Fecha de fin</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className={styles['form-group']}>
            <label>Formato</label>
            <select value={formato} onChange={(e) => setFormato(e.target.value)}>
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
            </select>
          </div>
          <button className={styles['btn-primary']} disabled={generando} onClick={handleGenerarReporte}>
            <i className="fas fa-download"></i> {generando ? 'Generando...' : 'Generar y descargar'}
          </button>
          <p style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Exporta los registros reales disponibles en el backend.
          </p>
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <h3>
              📈 Resumen del período
              <button
                onClick={cargarResumen}
                style={{ float: 'right', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
              >
                🔄
              </button>
            </h3>
            <div className={styles['stats-mini']}>
              {resumenLoading && (
                <div className={styles.item} style={{ gridColumn: '1/-1' }}><div className={styles.lab}>⏳ Cargando resumen desde el backend...</div></div>
              )}
              {!resumenLoading && resumenError && (
                <div className={styles.item} style={{ gridColumn: '1/-1' }}><div className={styles.lab} style={{ color: '#EF4444' }}>⚠️ No se pudo cargar el resumen. Detalle: {resumenError}</div></div>
              )}
              {!resumenLoading && !resumenError && resumen && resumen.length === 0 && (
                <div className={styles.item} style={{ gridColumn: '1/-1' }}><div className={styles.lab}>El backend no devolvió datos de resumen.</div></div>
              )}
              {!resumenLoading && !resumenError && resumen && resumen.slice(0, 8).map(([k, v]) => (
                <div className={styles.item} key={k}>
                  <div className={styles.num}>{typeof v === 'number' || typeof v === 'string' ? v : JSON.stringify(v)}</div>
                  <div className={styles.lab}>{k.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3>📋 Reportes generados</h3>
            <div>
              {reportesGenerados === null && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏳ Cargando historial...</p>
              )}
              {reportesGenerados && reportesGenerados.length === 0 && !reportesError && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aún no has generado ningún reporte.</p>
              )}
              {reportesError && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{reportesError}</p>
              )}
              {reportesGenerados && reportesGenerados.length > 0 && reportesGenerados.map((r) => (
                <div className={styles['report-item']} key={r.id ?? r.filename}>
                  <span>{r.filename}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {new Date(r.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 8, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Historial real de tu cuenta. El archivo ya se descargó a tu equipo al generarlo; aquí solo se guarda el registro.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

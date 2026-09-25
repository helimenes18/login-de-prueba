import { useEffect, useState } from 'react';
import { obtenerLecturas, obtenerResumen, predecirLote } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { VARIABLES, VARIABLES_CLAVE, VARIABLES_POR_KEY } from '../lib/variables';
import styles from './Reportes.module.css';

const TIPOS = {
  operativo: { nombre: 'Reporte operativo', descripcion: 'Variables clave de cada lectura.' },
  fallas: { nombre: 'Reporte de fallas', descripcion: 'Solo lecturas con falla real en esp.csv y la evaluación del modelo.' },
  predictivo: { nombre: 'Reporte predictivo', descripcion: 'Probabilidad, clase y nivel de riesgo que asigna el modelo a cada lectura.' },
  variables: { nombre: 'Reporte de variables', descripcion: 'Las 34 variables completas de cada lectura.' }
};

/** F-16: escapa comillas, comas y saltos de línea; conserva el valor 0. */
function celdaCsv(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  return /[",\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function aCsv(filas, columnas) {
  const encabezado = columnas.map((c) => celdaCsv(c.titulo)).join(',');
  const cuerpo = filas.map((f) => columnas.map((c) => celdaCsv(f[c.campo])).join(',')).join('\r\n');
  return `﻿${encabezado}\r\n${cuerpo}`; // BOM: Excel respeta los acentos
}

function columnasVariables(keys) {
  return keys.map((k) => ({ campo: k, titulo: `${VARIABLES_POR_KEY[k].label}${VARIABLES_POR_KEY[k].unit ? ` (${VARIABLES_POR_KEY[k].unit})` : ''}` }));
}

async function construirReporte(tipo, cantidad) {
  const { lecturas, fuente } = await obtenerLecturas({ limit: cantidad, soloFallas: tipo === 'fallas' });
  if (!lecturas.length) return { filas: [], columnas: [], fuente };

  const base = lecturas.map((l) => ({ lectura: l.record_id, fila: l.row_number, etiqueta_real: l.label === 1 ? 'FALLA' : 'NORMAL', ...l.values }));
  const colsBase = [
    { campo: 'lectura', titulo: 'Lectura' },
    { campo: 'fila', titulo: 'Fila esp.csv' },
    { campo: 'etiqueta_real', titulo: 'Etiqueta real' }
  ];

  if (tipo === 'operativo') return { filas: base, columnas: [...colsBase, ...columnasVariables(VARIABLES_CLAVE)], fuente };
  if (tipo === 'variables') return { filas: base, columnas: [...colsBase, ...columnasVariables(VARIABLES.map((v) => v.key))], fuente };

  const predicciones = await predecirLote(lecturas.map((l) => l.values));
  const filas = base.map((f, i) => ({
    ...f,
    probabilidad: Number(predicciones[i].probabilidad.toFixed(4)),
    prediccion: predicciones[i].prediccion === 1 ? 'FALLA' : 'NORMAL',
    riesgo: predicciones[i].nivel,
    umbral: predicciones[i].umbral
  }));
  const colsPred = [
    { campo: 'probabilidad', titulo: 'Probabilidad de falla' },
    { campo: 'prediccion', titulo: 'Predicción' },
    { campo: 'riesgo', titulo: 'Nivel de riesgo' },
    { campo: 'umbral', titulo: 'Umbral' }
  ];
  const extra = tipo === 'fallas' ? columnasVariables(VARIABLES_CLAVE) : [];
  return { filas, columnas: [...colsBase, ...colsPred, ...extra], fuente };
}

export default function Reportes() {
  const [tipo, setTipo] = useState('operativo');
  const [cantidad, setCantidad] = useState(100);
  const [formato, setFormato] = useState('CSV');
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { color, texto }

  const [resumen, setResumen] = useState(null);
  const [resumenError, setResumenError] = useState('');
  const [resumenLoading, setResumenLoading] = useState(true);

  const [reportesGenerados, setReportesGenerados] = useState(null); // null = cargando
  const [reportesError, setReportesError] = useState('');

  const cargarResumen = async () => {
    setResumenLoading(true);
    setResumenError('');
    try {
      setResumen(await obtenerResumen());
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
      setReportesError('');
      setReportesGenerados(data || []);
    } catch (err) {
      console.warn('No se pudo cargar el historial de reportes:', err.message);
      setReportesError('No se pudo cargar el historial de reportes desde Supabase.');
      setReportesGenerados([]);
    }
  };

  useEffect(() => {
    cargarResumen();
    cargarHistorialReportes();
  }, []);

  async function registrarReporteGenerado({ totalRegistros, filename }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('reportes_generados').insert({
        user_id: session.user.id,
        tipo: TIPOS[tipo].nombre,
        formato,
        fecha_inicio: null,
        fecha_fin: null,
        total_registros: totalRegistros,
        filename
      });
      if (error) throw error;
    } catch (err) {
      console.warn('No se pudo registrar el reporte en Supabase:', err.message);
    } finally {
      cargarHistorialReportes();
    }
  }

  async function handleGenerarReporte() {
    setGenerando(true);
    setMensaje(null);
    try {
      const { filas, columnas, fuente } = await construirReporte(tipo, cantidad);
      if (filas.length === 0) {
        setMensaje({ color: '#F59E0B', texto: '⚠️ No hay registros disponibles para exportar.' });
        return;
      }

      const fecha = new Date().toISOString().slice(0, 10);
      let blob;
      let filename;
      if (formato === 'CSV') {
        blob = new Blob([aCsv(filas, columnas)], { type: 'text/csv;charset=utf-8' });
        filename = `reporte_${tipo}_${fecha}.csv`;
      } else {
        const reporte = {
          tipo: TIPOS[tipo].nombre,
          fecha_generacion: new Date().toISOString(),
          fuente,
          total_registros: filas.length,
          columnas: columnas.map((c) => c.titulo),
          datos: filas
        };
        blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
        filename = `reporte_${tipo}_${fecha}.json`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMensaje({ color: '#22C55E', texto: `✅ ${filename} descargado (${filas.length} registros).` });
      await registrarReporteGenerado({ totalRegistros: filas.length, filename });
    } catch (err) {
      console.error('Error generando el reporte:', err);
      setMensaje({ color: '#EF4444', texto: `❌ No se pudo generar el reporte: ${err.message}` });
    } finally {
      setGenerando(false);
    }
  }

  const metricas = resumen
    ? [
        { num: resumen.total_available, lab: 'Lecturas disponibles' },
        { num: resumen.total_fail, lab: 'Con falla real' },
        { num: resumen.total_normal, lab: 'Operación normal' },
        { num: `${(Number(resumen.fail_rate || 0) * 100).toFixed(1)} %`, lab: 'Tasa de falla' }
      ]
    : [];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📄 Reportes y exportación</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Genera reportes a partir de las lecturas reales de esp.csv y del modelo predictivo</p>
      </div>

      <div className={styles['report-grid']}>
        <div className={styles.card}>
          <h3>📊 Generar reporte</h3>
          <div className={styles['form-group']}>
            <label>Tipo de reporte</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {Object.entries(TIPOS).map(([k, t]) => <option key={k} value={k}>{t.nombre}</option>)}
            </select>
            <p style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{TIPOS[tipo].descripcion}</p>
          </div>
          <div className={styles['form-group']}>
            <label>Cantidad de lecturas</label>
            <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}>
              {[50, 100, 200, 500].map((n) => <option key={n} value={n}>{n} lecturas</option>)}
            </select>
            <p style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              esp.csv no incluye fechas: el periodo se define por número de lecturas.
            </p>
          </div>
          <div className={styles['form-group']}>
            <label>Formato</label>
            <select value={formato} onChange={(e) => setFormato(e.target.value)}>
              <option value="CSV">CSV (compatible con Excel)</option>
              <option value="JSON">JSON</option>
            </select>
          </div>
          <button className={styles['btn-primary']} disabled={generando} onClick={handleGenerarReporte}>
            <i className="fas fa-download"></i> {generando ? 'Generando...' : 'Generar y descargar'}
          </button>
          {mensaje && <p style={{ marginTop: 8, fontSize: '0.75rem', color: mensaje.color }}>{mensaje.texto}</p>}
        </div>

        <div>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <h3>
              📈 Resumen de datos
              <button
                onClick={cargarResumen}
                aria-label="Actualizar resumen"
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
              {!resumenLoading && !resumenError && metricas.map((m) => (
                <div className={styles.item} key={m.lab}>
                  <div className={styles.num}>{m.num}</div>
                  <div className={styles.lab}>{m.lab}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3>📋 Reportes generados</h3>
            <div>
              {reportesGenerados === null && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏳ Cargando historial...</p>}
              {reportesGenerados && reportesGenerados.length === 0 && !reportesError && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aún no has generado ningún reporte.</p>
              )}
              {reportesError && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{reportesError}</p>}
              {reportesGenerados && reportesGenerados.length > 0 && reportesGenerados.map((r) => (
                <div className={styles['report-item']} key={r.id ?? r.filename}>
                  <span>{r.filename}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {new Date(r.created_at).toLocaleDateString('es-VE')}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 8, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Historial real de tu cuenta. El archivo se descarga a tu equipo al generarlo; aquí solo se guarda el registro.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

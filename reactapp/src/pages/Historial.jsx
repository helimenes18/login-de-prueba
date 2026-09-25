import { useEffect, useMemo, useState } from 'react';
import { obtenerRegistros, obtenerResumen } from '../lib/api';
import { useAppData } from '../lib/AppData';
import styles from './Historial.module.css';

export default function Historial() {
  const { umbral } = useAppData();
  const [registros, setRegistros] = useState([]);
  const [total, setTotal] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualizado, setActualizado] = useState(null);

  const cargarHistorial = async (category) => {
    setLoading(true);
    setError('');
    try {
      const { registros: regs, total: tot } = await obtenerRegistros({ category, limit: 1000 });
      setRegistros(regs);
      setTotal(tot);
      setActualizado(new Date());
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err.message);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
    // F-21: las categorías salen del resumen del backend, no de los registros filtrados.
    obtenerResumen()
      .then((r) => setCategorias(Array.isArray(r?.active_categories) ? r.active_categories : []))
      .catch((err) => console.warn('No se pudo cargar el resumen:', err.message));
  }, []);

  const registrosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return registros;
    return registros.filter((r) => `${r.record_id} ${r.row_number} ${r.category}`.toLowerCase().includes(texto));
  }, [registros, busqueda]);

  function handleCategoriaChange(e) {
    const val = e.target.value;
    setCategoria(val);
    cargarHistorial(val || undefined);
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📋 Historial de lecturas evaluadas</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Lecturas reales de esp.csv (bloque de prueba) con su etiqueta real y la probabilidad de falla asignada por el modelo
        </p>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por lectura, fila o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={categoria} onChange={handleCategoriaChange}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className={styles.btnRecargar} disabled={loading} onClick={() => cargarHistorial(categoria || undefined)}>
          🔄 Recargar
        </button>
      </div>

      {error && <div className={styles.errorBox}>⚠️ No se pudo cargar el historial desde el backend. Detalle: {error}</div>}

      <div className={styles['table-container']}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lectura</th>
              <th>Fila en esp.csv</th>
              <th>Etiqueta real</th>
              <th>Probabilidad del modelo</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>⏳ Cargando registros desde el backend...</td></tr>
            )}
            {!loading && registrosFiltrados.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>No hay registros para mostrar.</td></tr>
            )}
            {!loading && registrosFiltrados.map((r) => {
              const predijoFalla = r.value >= umbral;
              const esFalla = r.category === 'FALLA';
              const acierto = predijoFalla === esFalla;
              return (
                <tr key={r.record_id}>
                  <td>{r.record_id}</td>
                  <td>{r.row_number}</td>
                  <td style={{ color: esFalla ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{r.category}</td>
                  <td>{(r.value * 100).toFixed(1)} %</td>
                  <td style={{ color: acierto ? '#22C55E' : '#F59E0B' }}>
                    {predijoFalla ? 'Alerta' : 'Sin alerta'} · {acierto ? 'coincide' : esFalla ? 'falla no detectada' : 'falsa alarma'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles['footer-table']}>
        {!loading && !error && actualizado &&
          `Mostrando ${registrosFiltrados.length} de ${total} registros · Umbral ${Math.round(umbral * 100)} % · Actualizado a las ${actualizado.toLocaleTimeString('es-VE')}`}
      </div>
    </>
  );
}

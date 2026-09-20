import { useEffect, useMemo, useState } from 'react';
import { obtenerRegistros } from '../lib/api';
import styles from './Historial.module.css';

function formatFecha(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Historial() {
  const [registros, setRegistros] = useState([]);
  const [total, setTotal] = useState(0);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarHistorial = async (category) => {
    setLoading(true);
    setError('');
    try {
      const { registros: regs, total: tot } = await obtenerRegistros({ category, limit: 100 });
      setRegistros(regs);
      setTotal(tot);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categorias = useMemo(
    () => [...new Set(registros.map((r) => r.category))].sort(),
    [registros]
  );

  const registrosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();
    if (!texto) return registros;
    return registros.filter((r) =>
      `${formatFecha(r.timestamp)} ${r.record_id} ${r.category} ${r.value}`.toLowerCase().includes(texto)
    );
  }, [registros, busqueda]);

  function handleCategoriaChange(e) {
    const val = e.target.value;
    setCategoria(val);
    cargarHistorial(val || undefined);
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📋 Historial de fallas</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Registro histórico de eventos y anomalías detectadas</p>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por ID o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={categoria} onChange={handleCategoriaChange}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className={styles.btnRecargar}
          disabled={loading}
          onClick={() => cargarHistorial(categoria || undefined)}
        >
          🔄 Recargar
        </button>
      </div>

      {error && <div className={styles.errorBox}>⚠️ No se pudo cargar el historial desde el backend. Detalle: {error}</div>}

      <div className={styles['table-container']}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>ID de registro</th>
              <th>Categoría</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>⏳ Cargando registros desde el backend...</td></tr>
            )}
            {!loading && registrosFiltrados.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>No hay registros para mostrar.</td></tr>
            )}
            {!loading && registrosFiltrados.map((r, i) => (
              <tr key={r.record_id ?? i}>
                <td>{formatFecha(r.timestamp)}</td>
                <td>{r.record_id}</td>
                <td>{r.category}</td>
                <td>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles['footer-table']}>
        {!loading && !error && `Mostrando ${registrosFiltrados.length} de ${total} registros · Última actualización: hace unos segundos`}
      </div>
    </>
  );
}

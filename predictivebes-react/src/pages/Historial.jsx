import { useMemo, useState } from 'react';
import Card from '../components/Card';
import { generarRegistrosHistorial } from '../mock/mockData';

const registrosBase = generarRegistrosHistorial(40);

export default function Historial() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const categorias = useMemo(
    () => ['Todas', ...new Set(registrosBase.map((r) => r.categoria))],
    []
  );

  const filtrados = registrosBase.filter((r) => {
    const coincideCategoria = categoria === 'Todas' || r.categoria === categoria;
    const coincideBusqueda = r.id.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <Card title="🕒 Historial de registros">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <table className="var-table">
        <thead>
          <tr><th>ID</th><th>Categoría</th><th>Valor</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {filtrados.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.categoria}</td>
              <td>{r.valor}</td>
              <td>{new Date(r.timestamp).toLocaleString('es-MX')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtrados.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Sin resultados.</p>}
    </Card>
  );
}

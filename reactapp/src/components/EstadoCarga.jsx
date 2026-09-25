/** Aviso de conexión con la API: carga inicial (posible arranque en frío de Render) o error con reintento. */
export default function EstadoCarga({ estado, error, onRetry }) {
  if (estado === 'listo') return null;
  const esError = estado === 'error';
  return (
    <div
      role="status"
      style={{
        marginBottom: 20, padding: '12px 16px', borderRadius: 12, fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        background: esError ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
        border: `1px solid ${esError ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
        color: esError ? '#EF4444' : 'var(--text-secondary)'
      }}
    >
      <span>
        {esError
          ? error
          : '⏳ Conectando con la API de predicción. Si el servidor estaba inactivo, la primera carga puede tardar hasta un minuto.'}
      </span>
      {esError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ background: 'none', border: '1px solid currentColor', color: 'inherit', borderRadius: 30, padding: '4px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem' }}
        >
          🔄 Reintentar
        </button>
      )}
    </div>
  );
}

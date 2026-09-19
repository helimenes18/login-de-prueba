/**
 * AGREGADO: componente <Card>.
 * PARA QUÉ SIRVE: en el HTML original, cada "card" (Dashboard, Monitoreo, etc.) era
 * un <div class="card"> con estilos embebidos repetidos. Ahora es un componente:
 * <Card title="...">contenido</Card>. Un solo lugar controla cómo se ve una tarjeta
 * en toda la app.
 */
export default function Card({ title, children, style }) {
  return (
    <div className="card" style={style}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

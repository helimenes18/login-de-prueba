import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-brand">⚡ PredictiveBES</div>
        <h1>Monitoreo y mantenimiento predictivo de pozos con BES</h1>
        <p>
          Supervisá variables operativas en tiempo real, recibí alertas antes de una
          falla y generá reportes, todo desde un solo panel.
        </p>
        <div className="landing-actions">
          <Link to="/login" className="btn-primary">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}

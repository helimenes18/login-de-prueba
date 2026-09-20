import { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

function contarReportes() {
  try {
    return (JSON.parse(localStorage.getItem('pbes_reportes')) || []).length;
  } catch {
    return 0;
  }
}

export default function Perfil() {
  const { user, updateProfile } = useAuth();
  const [nombre, setNombre] = useState(user?.name || '');
  const [msg, setMsg] = useState('');

  function guardar() {
    if (!nombre.trim()) return setMsg('⚠️ El nombre no puede estar vacío.');
    updateProfile({ name: nombre.trim() });
    setMsg('✅ Perfil actualizado.');
    setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div className="grid-2">
      <Card title="👤 Datos personales">
        <div className="form-group">
          <label>Correo</label>
          <input type="email" value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={guardar}>💾 Actualizar perfil</button>
        {msg && <p style={{ marginTop: 10, fontSize: '0.8rem' }}>{msg}</p>}
      </Card>

      <div>
        <Card title="🕐 Información de la cuenta" style={{ marginBottom: 16 }}>
          <div className="activity-item"><span>Cuenta creada</span><span className="time">{new Date(user?.createdAt).toLocaleString('es-MX')}</span></div>
          <div className="activity-item"><span>Último inicio de sesión</span><span className="time">{new Date(user?.lastLogin || user?.createdAt).toLocaleString('es-MX')}</span></div>
        </Card>
        <Card title="📊 Estadísticas">
          <div className="stats-mini">
            <div className="item"><div className="num">{contarReportes()}</div><div className="lab">Reportes generados</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

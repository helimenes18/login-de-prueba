import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Perfil() {
  const { user, updateProfile } = useAuth();
  const [nombre, setNombre] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState('');
  const [reportesCount, setReportesCount] = useState('—');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('reportes_generados')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count, error }) => {
        if (!error) setReportesCount(count ?? 0);
      });
  }, [user]);

  async function guardar() {
    setMsg('');
    if (!nombre.trim()) return setMsg('⚠️ El nombre no puede estar vacío.');
    if (password || password2) {
      if (password.length < 6) return setMsg('⚠️ La nueva contraseña debe tener al menos 6 caracteres.');
      if (password !== password2) return setMsg('⚠️ Las contraseñas no coinciden.');
    }
    try {
      await updateProfile({ name: nombre.trim(), password: password || undefined });
      setMsg('✅ Perfil actualizado.');
      setPassword('');
      setPassword2('');
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
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
        <div className="form-group">
          <label>Nueva contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiarla" />
        </div>
        <div className="form-group">
          <label>Confirmar nueva contraseña</label>
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={guardar}>💾 Actualizar perfil</button>
        {msg && <p style={{ marginTop: 10, fontSize: '0.8rem' }}>{msg}</p>}
      </Card>

      <div>
        <Card title="🕐 Información de la cuenta" style={{ marginBottom: 16 }}>
          <div className="activity-item"><span>Proveedor</span><span className="time">{user?.provider}</span></div>
          <div className="activity-item"><span>Cuenta creada</span><span className="time">{user?.createdAt ? new Date(user.createdAt).toLocaleString('es-MX') : '—'}</span></div>
          <div className="activity-item"><span>Último inicio de sesión</span><span className="time">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString('es-MX') : '—'}</span></div>
        </Card>
        <Card title="📊 Estadísticas">
          <div className="stats-mini">
            <div className="item"><div className="num">{reportesCount}</div><div className="lab">Reportes generados</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

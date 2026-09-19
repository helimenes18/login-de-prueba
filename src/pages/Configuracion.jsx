import { useState } from 'react';
import Card from '../components/Card';
import ToggleSwitch from '../components/ToggleSwitch';
import { useSettings } from '../context/SettingsContext';

export default function Configuracion() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [guardado, setGuardado] = useState(false);

  function campo(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function guardar() {
    updateSettings(form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="grid-2">
      <Card title="🎚️ Umbrales operativos">
        <div className="form-group">
          <label>Presión mínima (PIP)</label>
          <input type="number" value={form.pipMin} onChange={(e) => campo('pipMin', +e.target.value)} /> psi
        </div>
        <div className="form-group">
          <label>Presión máxima (PDP)</label>
          <input type="number" value={form.pdpMax} onChange={(e) => campo('pdpMax', +e.target.value)} /> psi
        </div>
        <div className="form-group">
          <label>Temperatura máxima (PDT)</label>
          <input type="number" value={form.pdtMax} onChange={(e) => campo('pdtMax', +e.target.value)} /> °F
        </div>
        <div className="form-group">
          <label>Corriente mínima</label>
          <input type="number" step="0.1" value={form.corrienteMin} onChange={(e) => campo('corrienteMin', +e.target.value)} /> A
        </div>
      </Card>

      <div>
        <Card title="🔔 Notificaciones" style={{ marginBottom: 16 }}>
          <ToggleSwitch label="Alertas por email" description="Recibir notificaciones vía correo"
            checked={form.emailAlerts} onChange={(v) => campo('emailAlerts', v)} />
          <ToggleSwitch label="Alertas en dashboard" description="Mostrar notificaciones en tiempo real"
            checked={form.dashboardAlerts} onChange={(v) => campo('dashboardAlerts', v)} />
          <ToggleSwitch label="Reportes automáticos" description="Enviar reportes semanales (requiere backend)"
            checked={form.autoReports} onChange={(v) => campo('autoReports', v)} />
        </Card>

        <Card title="📡 Frecuencia de monitoreo">
          <div className="form-group">
            <label>Intervalo de actualización</label>
            <select value={form.intervaloSegundos} onChange={(e) => campo('intervaloSegundos', +e.target.value)}>
              <option value={1}>1 segundo</option>
              <option value={3}>3 segundos</option>
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
              <option value={30}>30 segundos</option>
            </select>
          </div>
          <button className="btn-primary" onClick={guardar}>💾 Guardar configuración</button>
          {guardado && <p style={{ color: '#22C55E', fontSize: '0.8rem', marginTop: 8 }}>✅ Guardado. Se aplica en Monitoreo y Dashboard al instante.</p>}
        </Card>
      </div>
    </div>
  );
}

/** Catálogo de las 34 variables del modelo (mismo orden que esp.csv) con etiqueta y unidad. */
export const VARIABLES = [
  { key: 'Oil', label: 'Petróleo', unit: 'bpd', category: 'producción', icon: 'oil-can' },
  { key: 'Gas', label: 'Gas', unit: 'Mscf/d', category: 'producción', icon: 'wind' },
  { key: 'Water', label: 'Agua', unit: 'bpd', category: 'producción', icon: 'tint' },
  { key: 'Drive_Current', label: 'Corriente del variador', unit: 'A', category: 'eléctrica', icon: 'bolt' },
  { key: 'Drive_Voltage', label: 'Voltaje del variador', unit: 'V', category: 'eléctrica', icon: 'bolt' },
  { key: 'Intake_Pressure', label: 'Presión de succión (PIP)', unit: 'psi', category: 'presión', icon: 'tachometer-alt' },
  { key: 'Motor_Shutdown_Temp', label: 'Temp. de apagado del motor', unit: '°F', category: 'térmica', icon: 'thermometer-half' },
  { key: 'Motor_Winding_Temp', label: 'Temp. del bobinado del motor', unit: '°F', category: 'térmica', icon: 'thermometer-half' },
  { key: 'Output_Frequency', label: 'Frecuencia de salida', unit: 'Hz', category: 'eléctrica', icon: 'wave-square' },
  { key: 'Vibration_X', label: 'Vibración eje X', unit: '', category: 'mecánica', icon: 'wave-square' },
  { key: 'Startup_Count', label: 'Número de arranques', unit: '', category: 'operativa', icon: 'power-off' },
  { key: 'Oil_Intake', label: 'Petróleo en la succión', unit: 'bpd', category: 'fluidos', icon: 'oil-can' },
  { key: 'Water_Intake', label: 'Agua en la succión', unit: 'bpd', category: 'fluidos', icon: 'tint' },
  { key: 'Gas_Intake', label: 'Gas en la succión', unit: 'bpd', category: 'fluidos', icon: 'wind' },
  { key: 'Liquid_Intake', label: 'Líquido en la succión', unit: 'bpd', category: 'fluidos', icon: 'water' },
  { key: 'Gas_Saturation_at_Intake', label: 'Saturación de gas en la succión', unit: '', category: 'fluidos', icon: 'chart-line' },
  { key: 'Gas_Separator_Efficiency', label: 'Eficiencia del separador de gas', unit: '', category: 'operativa', icon: 'percent' },
  { key: 'Gas_through_Annulus_Intake', label: 'Gas por el anular (succión)', unit: 'bpd', category: 'fluidos', icon: 'wind' },
  { key: 'Gas_through_ESP_Intake', label: 'Gas por el ESP (succión)', unit: 'bpd', category: 'fluidos', icon: 'wind' },
  { key: 'Gas_through_Annulus', label: 'Gas por el anular', unit: 'bpd', category: 'fluidos', icon: 'wind' },
  { key: 'Gas_through_ESP', label: 'Gas por el ESP', unit: 'bpd', category: 'fluidos', icon: 'wind' },
  { key: 'Pb_ESP', label: 'Presión de burbuja en el ESP', unit: 'psi', category: 'presión', icon: 'chart-line' },
  { key: 'Discharge_Pressure', label: 'Presión de descarga (PDP)', unit: 'psi', category: 'presión', icon: 'tachometer-alt' },
  { key: 'ESP_Fluid', label: 'Fluido manejado por el ESP', unit: 'bpd', category: 'fluidos', icon: 'water' },
  { key: 'Gas_Saturation_at_Discharge', label: 'Saturación de gas en la descarga', unit: '', category: 'fluidos', icon: 'chart-line' },
  { key: 'Pump_Delta_Pressure', label: 'Delta de presión de la bomba', unit: 'psi', category: 'presión', icon: 'tachometer-alt' },
  { key: 'Pump_Average_Pressure', label: 'Presión promedio de la bomba', unit: 'psi', category: 'presión', icon: 'tachometer-alt' },
  { key: 'Gas_Saturation_in_Pump', label: 'Saturación de gas en la bomba', unit: '', category: 'fluidos', icon: 'chart-line' },
  { key: 'Pump_Power', label: 'Potencia de la bomba', unit: 'kW', category: 'eléctrica', icon: 'bolt' },
  { key: 'Drive_Power', label: 'Potencia del variador', unit: 'kW', category: 'eléctrica', icon: 'bolt' },
  { key: 'Power_Ratio', label: 'Relación de potencia', unit: '', category: 'eléctrica', icon: 'chart-line' },
  { key: 'Power_Difference', label: 'Diferencia de potencia', unit: 'kW', category: 'eléctrica', icon: 'chart-line' },
  { key: 'ESP_Temperature', label: 'Temperatura del ESP', unit: '°F', category: 'térmica', icon: 'thermometer-half' },
  { key: 'Lower_Limit', label: 'Límite operativo inferior', unit: '', category: 'operativa', icon: 'arrow-down' }
];

export const VARIABLES_POR_KEY = Object.fromEntries(VARIABLES.map((v) => [v.key, v]));

/** Variables que se muestran en Dashboard y Monitoreo. */
export const VARIABLES_CLAVE = [
  'Intake_Pressure', 'Discharge_Pressure', 'Pump_Delta_Pressure', 'Motor_Winding_Temp',
  'ESP_Temperature', 'Drive_Current', 'Drive_Voltage', 'Output_Frequency', 'Vibration_X', 'Oil'
];

/**
 * Umbrales recomendados, derivados de los percentiles 5 % / 95 % de esp.csv.
 * Se conservan los nombres de columna de la tabla user_settings de Supabase.
 */
export const DEFAULT_SETTINGS = {
  pip_min: 480,          // Intake_Pressure mínima (psi)
  pdp_max: 3700,         // Discharge_Pressure máxima (psi)
  pdt_max: 196,          // Motor_Winding_Temp máxima (°F)
  corriente_min: 125,    // Drive_Current mínima (A)
  email_alerts: true,
  dashboard_alerts: true,
  auto_reports: false,
  monitor_interval_seconds: 3
};

/** Valores por defecto de la versión anterior (escala incompatible con esp.csv). */
const LEGACY_DEFAULTS = { pip_min: 100, pdp_max: 1500, pdt_max: 200, corriente_min: 2 };

export function normalizarSettings(guardados) {
  if (!guardados) return { ...DEFAULT_SETTINGS };
  const cfg = { ...DEFAULT_SETTINGS, ...guardados };
  const esLegacy = Object.entries(LEGACY_DEFAULTS).every(([k, v]) => Number(cfg[k]) === v);
  if (esLegacy) Object.assign(cfg, {
    pip_min: DEFAULT_SETTINGS.pip_min,
    pdp_max: DEFAULT_SETTINGS.pdp_max,
    pdt_max: DEFAULT_SETTINGS.pdt_max,
    corriente_min: DEFAULT_SETTINGS.corriente_min
  });
  return cfg;
}

/** Reglas de umbral: variable, tipo (min/max), campo de configuración. */
export const REGLAS_UMBRAL = [
  { key: 'Intake_Pressure', tipo: 'min', campo: 'pip_min' },
  { key: 'Discharge_Pressure', tipo: 'max', campo: 'pdp_max' },
  { key: 'Motor_Winding_Temp', tipo: 'max', campo: 'pdt_max' },
  { key: 'Drive_Current', tipo: 'min', campo: 'corriente_min' }
];

/** Estado de una variable respecto a los umbrales: 'normal' | 'warning' | 'danger'. */
export function estadoVariable(key, valor, cfg) {
  const regla = REGLAS_UMBRAL.find((r) => r.key === key);
  if (!regla || !Number.isFinite(valor)) return 'normal';
  const limite = Number(cfg[regla.campo]);
  if (!Number.isFinite(limite)) return 'normal';
  const margen = Math.abs(limite) * 0.05;
  if (regla.tipo === 'min') {
    if (valor < limite) return 'danger';
    if (valor < limite + margen) return 'warning';
  } else {
    if (valor > limite) return 'danger';
    if (valor > limite - margen) return 'warning';
  }
  return 'normal';
}

/** Lista de variables fuera de umbral para una lectura. */
export function variablesFueraDeUmbral(valores, cfg) {
  if (!valores) return [];
  return REGLAS_UMBRAL
    .map((r) => ({ ...r, valor: valores[r.key], estado: estadoVariable(r.key, valores[r.key], cfg), limite: Number(cfg[r.campo]) }))
    .filter((r) => r.estado !== 'normal');
}

export function formatearValor(key, valor) {
  if (!Number.isFinite(valor)) return '—';
  const v = VARIABLES_POR_KEY[key];
  const decimales = Math.abs(valor) < 10 ? 2 : Math.abs(valor) < 1000 ? 1 : 0;
  const numero = valor.toLocaleString('es-VE', { maximumFractionDigits: decimales, minimumFractionDigits: 0 });
  return v?.unit ? `${numero} ${v.unit}` : numero;
}

export function nivelRiesgo(prob, umbral) {
  if (!Number.isFinite(prob)) return null;
  if (prob >= umbral) return { nivel: 'alto', color: '#EF4444', texto: '🔴 Riesgo alto: programar mantenimiento' };
  if (prob >= umbral * 0.6) return { nivel: 'moderado', color: '#F59E0B', texto: '🟠 Riesgo moderado: monitorear de cerca' };
  return { nivel: 'bajo', color: '#22C55E', texto: '✅ Riesgo bajo: operación normal' };
}

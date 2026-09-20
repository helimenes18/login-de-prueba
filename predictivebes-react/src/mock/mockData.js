/**
 * AGREGADO: capa de datos simulados.
 * PARA QUÉ SIRVE: quitaste el backend (Render + Supabase), así que todo lo que antes
 * era un fetch() a una API real ahora es una función local que devuelve datos de
 * mentira, pero con la misma forma que tendrían los datos reales. Esto te deja
 * navegar y probar TODA la app sin depender de ningún servidor externo.
 *
 * Cuando quieras reconectar tu backend real: buscá cada función de este archivo por
 * su nombre dentro de src/pages/*.jsx y reemplazá la llamada por tu fetch/axios real.
 * El resto del código (los componentes) no tiene que cambiar, porque ya esperan
 * datos con esta misma forma (mismos campos).
 */

export function randomBetween(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

// Simula una lectura de las 10 variables del pozo (antes venían de sensores reales)
export function generarLecturaSensores() {
  return {
    corriente: randomBetween(2.5, 4.5, 2),
    voltaje: randomBetween(115, 125, 1),
    chp: randomBetween(350, 450, 0),
    thp: randomBetween(190, 240, 0),
    plp: randomBetween(170, 220, 0),
    pip: randomBetween(100, 140, 0),
    pdp: randomBetween(1300, 1500, 0),
    pdt: randomBetween(170, 190, 0),
    tlp: randomBetween(95, 125, 0),
    vibracion: randomBetween(0.5, 2.0, 2),
  };
}

// Simula lo que antes respondía /api/v1/predict/single del backend en Render.
// Según el Capítulo I, el modelo real debe basarse en Random Forest o redes LSTM;
// acá se simula el resultado con esa misma forma (score + nivel + algoritmo usado)
// para que, al reconectar el backend real, el resto del código no tenga que cambiar.
export function predecirRiesgo(lectura, umbrales) {
  let score = 0;
  if (lectura.pip < umbrales.pipMin) score += 30;
  if (lectura.pdp > umbrales.pdpMax) score += 25;
  if (lectura.pdt > umbrales.pdtMax) score += 25;
  if (lectura.vibracion > 1.5) score += 20;
  score += randomBetween(0, 15, 0);
  score = Math.min(100, Math.round(score));

  let nivel = 'Bajo';
  if (score > 70) nivel = 'Alto';
  else if (score > 35) nivel = 'Medio';

  return { score, nivel, algoritmo: 'Random Forest (simulado)' };
}

// Lista de pozos de ejemplo para el Mapa (antes hubiera sido una tabla "pozos")
export const POZOS = [
  { id: 'BES-01', estado: 'Operando', petroleo: '450 bpd', gas: '120 mcf/d', x: 20, y: 30 },
  { id: 'BES-02', estado: 'Alerta', petroleo: '210 bpd', gas: '80 mcf/d', x: 45, y: 20 },
  { id: 'BES-03', estado: 'Operando', petroleo: '520 bpd', gas: '140 mcf/d', x: 65, y: 35 },
  { id: 'BES-04', estado: 'Falla', petroleo: '0 bpd', gas: '0 mcf/d', x: 30, y: 60 },
  { id: 'BES-05', estado: 'Operando', petroleo: '390 bpd', gas: '95 mcf/d', x: 55, y: 65 },
  { id: 'BES-06', estado: 'Mantenimiento', petroleo: '0 bpd', gas: '0 mcf/d', x: 75, y: 55 },
  { id: 'BES-07', estado: 'Operando', petroleo: '460 bpd', gas: '110 mcf/d', x: 15, y: 80 },
  { id: 'BES-08', estado: 'Alerta', petroleo: '180 bpd', gas: '60 mcf/d', x: 85, y: 25 },
  { id: 'BES-09', estado: 'Operando', petroleo: '410 bpd', gas: '100 mcf/d', x: 60, y: 85 },
  { id: 'BES-10', estado: 'Parado', petroleo: '0 bpd', gas: '0 mcf/d', x: 40, y: 45 },
];

// Simula lo que antes venía de /api/v1/context/records (para Historial y Reportes)
export function generarRegistrosHistorial(n = 40) {
  const categorias = ['Corriente', 'Voltaje', 'Presión', 'Temperatura', 'Vibración'];
  return Array.from({ length: n }).map((_, i) => ({
    id: `REG-${1000 + i}`,
    categoria: categorias[i % categorias.length],
    valor: randomBetween(10, 500, 2),
    timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  }));
}

// AGREGADO: catálogo único de las 10 variables del BES (antes estaba repetido en
// Monitoreo.jsx). "regla" define cuándo una variable se marca en alarma (rojo),
// comparando contra los umbrales configurados en Configuración. Tanto la tabla de
// Monitoreo como el esquema tipo SCADA (PozoEsquema.jsx) usan este mismo catálogo,
// así que agregar o cambiar una variable se hace en un solo lugar.
//
// "nombreCompleto" usa la redacción textual del Capítulo I: "...la visualización
// de las variables de presión en superficie y fondo: Presión en el Cabezal del
// Revestidor (CHP), Temperatura de Descarga de la Bomba (PDT), Presión en el
// Cabezal de la Tubería (THP), Presión en la Línea de Producción (PLP),
// Temperatura en la Línea de Producción (TLP), la Presión de Entrada de la Bomba
// (PIP) y la Presión de Descarga de la Bomba (PDP)".
export const VARIABLES = [
  { key: 'corriente', label: 'Corriente', nombreCompleto: 'Corriente eléctrica del motor', unidad: 'A', regla: (v, u) => v < u.corrienteMin },
  { key: 'voltaje', label: 'Voltaje', nombreCompleto: 'Voltaje del motor', unidad: 'V' },
  { key: 'chp', label: 'CHP', nombreCompleto: 'Presión en el Cabezal del Revestidor', unidad: 'psi' },
  { key: 'thp', label: 'THP', nombreCompleto: 'Presión en el Cabezal de la Tubería', unidad: 'psi' },
  { key: 'plp', label: 'PLP', nombreCompleto: 'Presión en la Línea de Producción', unidad: 'psi' },
  { key: 'pip', label: 'PIP', nombreCompleto: 'Presión de Entrada de la Bomba', unidad: 'psi', regla: (v, u) => v < u.pipMin },
  { key: 'pdp', label: 'PDP', nombreCompleto: 'Presión de Descarga de la Bomba', unidad: 'psi', regla: (v, u) => v > u.pdpMax },
  { key: 'pdt', label: 'PDT', nombreCompleto: 'Temperatura de Descarga de la Bomba', unidad: '°F', regla: (v, u) => v > u.pdtMax },
  { key: 'tlp', label: 'TLP', nombreCompleto: 'Temperatura en la Línea de Producción', unidad: '°F' },
  { key: 'vibracion', label: 'Vibración', nombreCompleto: 'Vibración del motor', unidad: 'G', regla: (v) => v > 1.5 },
];

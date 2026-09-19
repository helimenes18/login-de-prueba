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

// Simula lo que antes respondía /api/v1/predict/single del backend en Render
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

  return { score, nivel };
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

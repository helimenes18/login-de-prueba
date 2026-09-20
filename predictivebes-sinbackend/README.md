# PredictiveBES — versión SIN backend ni Supabase

Esta es la versión mínima, para descartar que el problema de deploy en Vercel
viniera del backend o de Supabase. **Todo funciona con datos simulados en el
navegador** (localStorage): login, configuración y reportes no persisten en
ningún servidor externo, solo en tu propio navegador.

## Cómo correrlo

```bash
npm install
npm run build
```

Si `npm run build` termina bien y te genera `dist/`, subilo a Vercel (o a un
proyecto nuevo, para no arrastrar configuración vieja) y confirmá que carga.
Una vez que esto funcione, avisame y volvemos a sumar Supabase paso a paso.

## Qué NO tiene esta versión (a propósito)

- Sin `@supabase/supabase-js` en las dependencias
- Sin `src/lib/supabaseClient.js`
- Login simulado (cualquier correo/contraseña entra), sin Google
- Configuración y Reportes guardan en `localStorage`, no en una base de datos

## Qué SÍ tiene (se mantiene igual que la versión completa)

- El esquema tipo SCADA del pozo BES (`PozoEsquema.jsx`) con las 7 variables del
  Capítulo I (CHP, PDT, THP, PLP, TLP, PIP, PDP)
- El mapa de pozos con posiciones reales (`Mapa.jsx`)
- El dashboard con variables de superficie en tiempo real
- `vercel.json` con los rewrites para que React Router funcione en Vercel
- `index.html` limpio (sin el bug del script suelto en el `<head>`)

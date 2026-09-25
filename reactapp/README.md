# PredictiveBES · versión React

Migración del proyecto original (HTML + CSS + JS embebido) a **React 18 + Vite + react-router-dom**,
manteniendo exactamente el mismo diseño visual y toda la funcionalidad ya conectada
(Supabase Auth y el backend de Machine Learning en Render).

## Cómo correrlo en tu máquina

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Cómo desplegarlo en Vercel

1. Sube esta carpeta a un repositorio (GitHub, GitLab, etc.) — o arrástrala directo en
   [vercel.com/new](https://vercel.com/new).
2. Vercel detecta automáticamente que es un proyecto **Vite** (por `package.json` y `vite.config.js`).
   Los comandos por defecto ya son correctos:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. El archivo `vercel.json` ya incluye la regla necesaria para que las rutas internas
   (`/dashboard`, `/monitoreo`, etc.) no den error 404 al recargar la página o entrar directo por URL.

Variables de entorno (opcionales, ver `.env.example`): `VITE_ML_API_BASE`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY` y, si se quiere mostrar el acceso de demostración en el login,
`VITE_DEMO_EMAIL` y `VITE_DEMO_PASSWORD`. Sin ellas se usan los valores del proyecto y el botón
de demostración queda oculto.

Además, ejecutar una vez `supabase/seguridad.sql` en el SQL Editor de Supabase (políticas RLS,
protección de la cuenta demo y roles en `app_metadata`).

## Estructura del proyecto

```
src/
  lib/
    supabaseClient.js   → cliente único de Supabase (antes repetido en cada .html)
    api.js              → conexión con el backend ML (predict, context, model) con token de sesión
    AppData.jsx         → estado compartido: configuración del usuario, lecturas de esp.csv
                          reproducidas con sus predicciones y métricas del modelo
    variables.js        → catálogo de las 34 variables, unidades, umbrales y niveles de riesgo
    demo.js             → configuración de la cuenta de demostración
    useSession.js        → hook de sesión (reacciona a cambios de autenticación) + logout
  components/
    Layout.jsx           → sidebar + navbar compartidos (antes copiados en cada .html)
    LineChart.jsx        → gráfica SVG de tendencias (Monitoreo)
    EstadoCarga.jsx      → aviso de conexión / reintento con la API
  pages/
    Landing.jsx          → antes index.html
    Login.jsx            → antes login.html
    Dashboard.jsx
    Monitoreo.jsx
    Mapa.jsx
    Predictivo.jsx
    Historial.jsx
    Reportes.jsx
    Configuracion.jsx
    Perfil.jsx
```

Cada página tiene su propio archivo `NombrePagina.module.css` — son **CSS Modules**,
así que los estilos de una página nunca chocan con los de otra, aunque usen los
mismos nombres de clase (esto es más seguro que el HTML original, donde todo el
CSS estaba en el mismo documento global).

## Qué cambió respecto a la versión HTML

- **Nada visualmente.** El diseño, colores, textos y layout son idénticos.
- **Toda la lógica de sesión, logout, llamadas al backend ML y a Supabase** funciona
  igual que antes, pero ahora vive en componentes de React con estado (`useState`/`useEffect`)
  en lugar de manipular el DOM directamente con `document.getElementById(...)`.
- El sidebar y la barra superior ya **no están duplicados en 8 archivos distintos**:
  ahora es un solo componente (`Layout.jsx`) que envuelve las páginas internas.
- Las rutas son limpias (`/dashboard`, `/monitoreo`, etc.) en vez de `dashboard.html`,
  `monitoreo.html`. `vercel.json` se encarga de que funcionen al recargar o compartir el link.

## Correcciones del informe de pruebas (v1.1)

- La interfaz envía a `/predict` las **34 variables** reales que exige el modelo y lee
  `fail_probability` / `fail_prediction` (antes enviaba `feature_1..4` y leía `prediction`).
- Monitoreo, Dashboard y Predictivo reproducen **lecturas reales de esp.csv** servidas por la API
  (`/context/readings`) y evaluadas en un solo lote; se rotulan como reproducción, no "en vivo".
- Los umbrales y el intervalo de Configuración se validan y **se aplican** en todos los módulos.
- Historial y Reportes usan datos reales; los reportes filtran por tipo, escapan el CSV y conservan el 0.
- Mapa calcula sus totales a partir de los pozos; la landing muestra las métricas reales del modelo.
- Registro con confirmación de correo, rol desde `app_metadata`, cambio de contraseña con la
  contraseña actual y cuenta demo protegida.
- Menú lateral y menú de la landing corregidos en pantallas angostas.

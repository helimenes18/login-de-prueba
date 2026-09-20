# PredictiveBES — versión React

Refactor del proyecto original (10 archivos `.html` con estilos embebidos) a una
app de React con Vite. **Supabase está conectado de nuevo** (autenticación real, umbrales y reportes).
Lo único que sigue simulado es el backend de predicción/sensores (Render/Python) —
eso se quitó a propósito y todavía no está reconectado; ver `src/mock/mockData.js`.

Antes de correrlo, ejecutá `supabase_setup.sql` en tu proyecto de Supabase (SQL
Editor) si todavía no lo hiciste — crea las tablas `user_settings` y
`reportes_generados`.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

Para generar la versión de producción (por ejemplo, para subir a Vercel):

```bash
npm run build
```

Esto crea la carpeta `dist/` lista para desplegar. En Vercel, elegí el framework
"Vite" (o dejá que lo detecte solo) — ya no hace falta el `vercel.json` que usabas
para archivos estáticos sueltos.

## Qué está simulado y qué es real ahora

| Parte | Estado | Dónde |
|---|---|---|
| Login / registro / Google | **Real** (Supabase Auth) | `src/context/AuthContext.jsx`, `src/lib/supabaseClient.js` |
| Umbrales y configuración | **Real** (tabla `user_settings`) | `src/context/SettingsContext.jsx` |
| Historial de reportes | **Real** (tabla `reportes_generados`) | `src/pages/Reportes.jsx`, `src/pages/Perfil.jsx` |
| Lecturas de sensores / predicción IA | Simulado (backend de Render aún no reconectado) | `src/mock/mockData.js` |
| Mapa de pozos | Simulado (posiciones y estado de ejemplo) | `src/mock/mockData.js` |

## Qué cambió y por qué (resumen)

| Antes (HTML crudo) | Ahora (React) | Para qué sirve |
|---|---|---|
| 10 archivos `.html` con el mismo sidebar copiado y pegado | `src/components/Layout.jsx` | Un solo lugar controla el menú lateral, el header y "Cerrar sesión" para las 8 páginas protegidas |
| `<a href="dashboard.html">` (recarga toda la página) | `react-router-dom` (`src/App.jsx`) | Navegar entre pantallas sin recargar el navegador |
| Función `verificarSesion()` copiada en cada archivo | `src/components/ProtectedRoute.jsx` + `src/context/AuthContext.jsx` | Un solo lugar decide si mandarte a `/login` |
| Cada página leía/escribía Supabase directamente | `src/mock/mockData.js` | Genera datos de ejemplo con la misma forma que tendrían los datos reales; cuando conectes tu API, solo tocás este archivo |
| Tabla `user_settings` de Supabase | `src/context/SettingsContext.jsx` (guarda en `localStorage`) | Los umbrales y el intervalo de refresco se guardan localmente y los usan Monitoreo y Dashboard al instante |
| Lista de reportes hardcodeada / tabla `reportes_generados` | `localStorage` dentro de `src/pages/Reportes.jsx` | El historial de reportes generados persiste entre recargas sin necesitar backend |
| `alert()` del navegador al hacer clic en un pozo | Modal propio (`.modal-overlay` en `src/pages/Mapa.jsx`) | Mejor apariencia, integrado al diseño |
| No existía "Iniciar sesión con Google" | Google Identity Services en `src/pages/Login.jsx` + `loginWithGoogle()` en `AuthContext.jsx` | Botón real de Google; hay que poner tu propio Client ID (instrucciones en el comentario del archivo) |
| El Mapa era una grilla de botones, no mostraba ubicación real | `src/pages/Mapa.jsx` ahora posiciona cada pozo con `left/top` sobre un lienzo, usando las coordenadas `x`/`y` que ya traía `mockData.js` | Mapa real, sin depender del backend |
| Monitoreo era solo una tabla de números | `src/components/PozoEsquema.jsx` — diagrama tipo SCADA del sistema BES con los valores en vivo superpuestos en el punto físico donde se miden, y una franja de estado arriba (estilo tu imagen de referencia, con el tema visual de la app) | Monitoreo "de un vistazo", como un HMI real |
| Cada página tenía su propio `<style>` | `src/styles/global.css` | Un solo sistema de diseño (colores, tarjetas, botones, tablas) para toda la app |
| Interruptores (toggles) que no guardaban nada | `src/components/ToggleSwitch.jsx` + `SettingsContext` | Ahora si tienen estado real y persisten |

## Cómo volver a conectar un backend real

Todo lo simulado vive en dos archivos:

- **`src/mock/mockData.js`** — reemplazá cada función (`generarLecturaSensores`,
  `predecirRiesgo`, `generarRegistrosHistorial`, `POZOS`) por un `fetch`/`axios` a
  tu API real. Las páginas no necesitan cambiar, porque ya esperan datos con esa
  misma forma.
- **`src/context/AuthContext.jsx`** — reemplazá `login()`/`logout()` por llamadas
  reales a tu proveedor de autenticación (Supabase u otro).
- **`src/context/SettingsContext.jsx`** — cambiá el `useEffect` que guarda en
  `localStorage` por un guardado real en tu base de datos.

## Estructura

```
src/
  main.jsx              punto de entrada
  App.jsx                rutas de la app
  context/
    AuthContext.jsx       sesión simulada
    SettingsContext.jsx   umbrales y config (reemplaza user_settings)
  components/
    Layout.jsx            sidebar + topbar compartidos
    ProtectedRoute.jsx     redirige a /login si no hay sesión
    Card.jsx               tarjeta reutilizable
    ToggleSwitch.jsx        interruptor reutilizable
  mock/
    mockData.js            generador de datos simulados
  pages/
    Landing.jsx, Login.jsx, Dashboard.jsx, Monitoreo.jsx, Mapa.jsx,
    Predictivo.jsx, Historial.jsx, Reportes.jsx, Configuracion.jsx, Perfil.jsx
  styles/
    global.css              sistema de diseño único
```

## Trazabilidad con el Capítulo I

Las 7 variables (CHP, PDT, THP, PLP, TLP, PIP, PDP) y el enfoque de IA (Random
Forest / LSTM) están tomados textualmente del planteamiento del problema del
Capítulo I. Los nombres completos de cada variable están en
`src/mock/mockData.js` (campo `nombreCompleto`) y se pueden ver en la app abriendo
**"📖 Glosario de variables (Capítulo I)"**, debajo del esquema BES en Monitoreo.

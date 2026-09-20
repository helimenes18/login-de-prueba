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

No necesitas configurar nada más — las claves de Supabase y la URL del backend ML
ya están en el código (igual que en la versión HTML original).

## Estructura del proyecto

```
src/
  lib/
    supabaseClient.js   → cliente único de Supabase (antes repetido en cada .html)
    api.js              → toda la conexión con el backend ML (predict, context)
    useSession.js        → hook de sesión + logout robusto, reutilizado en todas las páginas
  components/
    Layout.jsx           → sidebar + navbar compartidos (antes copiados en cada .html)
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

## Próximos pasos sugeridos (opcionales)

- Reemplazar los `<div class="chart-placeholder">` de Monitoreo por gráficas reales
  (por ejemplo con `recharts`, ya que el proyecto usa Vite y puede instalar cualquier
  paquete de npm libremente).
- Si el equipo crece, mover cada página a su propia carpeta con sub-componentes
  (por ejemplo `pages/dashboard/StatCard.jsx`, `pages/dashboard/RiesgoIA.jsx`) para
  ir troceando los archivos más grandes.

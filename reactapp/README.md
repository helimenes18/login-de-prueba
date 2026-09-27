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

---

## 🔌 Guía de backend — para quien conecte los datos reales

Esta app ya está **100% conectada** a dos backends. Si otra persona va a reemplazar
los datos simulados por datos reales, esto es exactamente lo que necesita saber
y lo único que falta por hacer.

### 1. Supabase (autenticación + 2 tablas)

Cliente único en `src/lib/supabaseClient.js`. Usa:
- `https://qkpkmgmidffdqaqwfiho.supabase.co`
- Publishable key `sb_publishable_IfsgsenpGA1BM5_aMkMrfQ_BtoQN8Ke`

**Auth ya funciona sin nada extra**: login con email/contraseña, registro,
Google OAuth y `updateUser` (para cambiar nombre/contraseña en Perfil) — todo
usa el Auth nativo de Supabase, no requiere tablas propias.

**Dos tablas opcionales** que la app intenta usar y **degrada con gracia si no existen**
(muestra un aviso, no rompe nada). Para que Configuración, Perfil y Reportes
guarden/lean datos reales, hay que crearlas en el SQL Editor de Supabase:

```sql
-- Umbrales y preferencias de cada usuario (Configuración)
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pip_min numeric default 100,
  pdp_max numeric default 1500,
  pdt_max numeric default 200,
  corriente_min numeric default 2.0,
  email_alerts boolean default true,
  dashboard_alerts boolean default true,
  auto_reports boolean default false,
  monitor_interval_seconds integer default 3,
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Cada usuario ve y edita solo su propia fila"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Historial de reportes generados (Reportes y Perfil)
create table reportes_generados (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  tipo text,
  formato text,
  fecha_inicio date,
  fecha_fin date,
  total_registros integer,
  filename text,
  created_at timestamptz default now()
);

alter table reportes_generados enable row level security;

create policy "Cada usuario ve y crea solo sus propios reportes"
  on reportes_generados for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Para que "Iniciar sesión con Google" funcione en producción**, en el dashboard
de Supabase: Authentication → Providers → Google (con su Client ID/Secret de
Google Cloud), y en Authentication → URL Configuration agregar el dominio real
de Vercel a "Redirect URLs".

### 2. Backend de Machine Learning (Render)

Todo centralizado en `src/lib/api.js`, apuntando a `https://predictibes.onrender.com`.
Endpoints usados hoy:

| Función en `api.js`      | Endpoint real                     | Usado en                          |
|---------------------------|------------------------------------|-----------------------------------|
| `predecirFalla()`         | `POST /api/v1/predict/single`      | Dashboard, Monitoreo, Predictivo  |
| `obtenerRegistros()`      | `GET /api/v1/context/records`      | Historial                         |
| `obtenerResumen()`        | `GET /api/v1/context/summary`      | Reportes                         |
| `obtenerRegistrosCrudos()`| `GET /api/v1/context/records`      | Reportes (exportar CSV/JSON)      |

Este backend ya funciona — no hay nada pendiente de conectar ahí. Lo único
**simulado** hoy es la **lectura de sensores** (`generarLecturas()` en `api.js`):
genera valores aleatorios para CHP, THP, PLP, TLP, PIP, PDP, PDT y vibración,
dentro de rangos realistas, porque **todavía no hay una fuente de telemetría
real del pozo conectada**.

**Si la próxima persona va a conectar sensores/telemetría real**, el único
cambio necesario es reemplazar `generarLecturas()` en `src/lib/api.js` por
una llamada a la fuente real (otro endpoint REST, MQTT, Supabase Realtime,
lo que sea) que devuelva un objeto con esta forma exacta:

```js
{ chp, thp, plp, tlp, pip, pdp, pdt, vib } // todos números
```

Ese objeto se usa en 3 lugares: `Dashboard.jsx` (los 7 medidores SCADA),
`Monitoreo.jsx` (la lista de variables) y como entrada del modelo predictivo
(`pip`, `pdp`, `pdt`, `vib` → `feature_1..4`). Cambiando solo esa función,
toda la app pasa a mostrar datos reales sin tocar ningún componente.

### Checklist de verificación rápida

- [x] Un solo cliente de Supabase (`supabaseClient.js`), importado igual en las 5
      páginas que lo necesitan — sin duplicados, sin claves sueltas por archivo.
- [x] Login, registro, Google OAuth, logout y actualización de perfil usan el
      Auth nativo de Supabase (no dependen de las tablas opcionales).
- [x] Si `user_settings` o `reportes_generados` no existen todavía, la app no
      se rompe: muestra un aviso y sigue funcionando con valores por defecto.
- [x] El backend de IA (Render) está conectado de verdad en Dashboard, Monitoreo,
      Predictivo, Historial y Reportes, con manejo de timeout/JSON inválido/CORS.
- [ ] Pendiente (para quien siga): crear las 2 tablas de Supabase de arriba,
      configurar Google OAuth en producción, y conectar telemetría real en
      `generarLecturas()` cuando exista.


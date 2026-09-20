import { createClient } from '@supabase/supabase-js';

/**
 * AGREGADO DE VUELTA: cliente de Supabase.
 * Es el mismo proyecto que usaban las páginas .html originales — recuperado a
 * pedido tuyo ("solo quité el backend [de Render/Python], no quería quitar Supabase").
 *
 * Lo que SÍ sigue simulado (sin backend propio): las lecturas de sensores y la
 * predicción de IA (src/mock/mockData.js) — porque el backend de Render/Python es
 * la parte que se removió a propósito y todavía no está reconectada.
 *
 * Lo que ya NO está simulado (vuelve a ser real, vía Supabase):
 *  - Autenticación (login/registro/Google) → src/context/AuthContext.jsx
 *  - Umbrales y configuración (tabla "user_settings") → src/context/SettingsContext.jsx
 *  - Historial de reportes (tabla "reportes_generados") → src/pages/Reportes.jsx, Perfil.jsx
 *
 * Si en algún momento cambia el proyecto de Supabase, solo hay que actualizar las
 * dos constantes de acá abajo.
 */
const SUPABASE_URL = 'https://qkpkmgmidffdqaqwfiho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IfsgsenpGA1BM5_aMkMrfQ_BtoQN8Ke';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

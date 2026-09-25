import { createClient } from '@supabase/supabase-js';

// La clave "publishable" es pública por diseño: la seguridad de los datos depende de las políticas RLS
// (ver supabase/seguridad.sql). Se puede sobrescribir con variables de entorno en Vercel.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qkpkmgmidffdqaqwfiho.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IfsgsenpGA1BM5_aMkMrfQ_BtoQN8Ke';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

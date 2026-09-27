import { createClient } from '@supabase/supabase-js';

// La clave "publishable" es pública por diseño: la seguridad de los datos depende de las políticas RLS
// (ver supabase/seguridad.sql). Se puede sobrescribir con variables de entorno en Vercel.
const DEFAULT_URL = 'https://qkpkmgmidffdqaqwfiho.supabase.co';
const DEFAULT_KEY = 'sb_publishable_IfsgsenpGA1BM5_aMkMrfQ_BtoQN8Ke';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// La URL y la clave pertenecen a un mismo proyecto: solo se usan las del entorno si están ambas.
// Mezclar la URL de un proyecto con la clave de otro hace fallar todo el inicio de sesión.
const usarEntorno = Boolean(envUrl && envKey);
if ((envUrl || envKey) && !usarEntorno) {
  console.warn('VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben definirse juntas; se usa el proyecto por defecto.');
}

const SUPABASE_URL = usarEntorno ? envUrl : DEFAULT_URL;
const SUPABASE_KEY = usarEntorno ? envKey : DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

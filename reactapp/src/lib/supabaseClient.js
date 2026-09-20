import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qkpkmgmidffdqaqwfiho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IfsgsenpGA1BM5_aMkMrfQ_BtoQN8Ke';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

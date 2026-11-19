// ============================================================================
// CRIPTO MYNERS — CLIENTE OFICIAL DO SUPABASE
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gknnbkwykvijewqxmbbr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4f-ijt_wSQrMuHHciugFyA_w5jGsHJp';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Credenciais não detectadas ou usando template. O jogo operará em modo LocalStorage offline.');
} else {
  console.log('[Supabase] Conectado com sucesso ao backend:', supabaseUrl);
}

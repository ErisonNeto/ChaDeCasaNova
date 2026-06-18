import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawAnonKey &&
    rawUrl.startsWith('https://') &&
    rawUrl.includes('.supabase.co') &&
    rawAnonKey.length > 20,
);

export const supabaseConfigStatus = {
  hasUrl: Boolean(rawUrl),
  hasKey: Boolean(rawAnonKey),
  urlLooksValid: Boolean(rawUrl?.startsWith('https://') && rawUrl.includes('.supabase.co')),
};

const supabaseUrl = isSupabaseConfigured ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey! : 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado corretamente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local ou .env',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

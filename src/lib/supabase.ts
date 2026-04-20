import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');

declare global {
  // eslint-disable-next-line no-var
  var __yuvaSupabase: ReturnType<typeof createClient> | undefined;
}

if (!isConfigured) {
  console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Settings menu.');
}

export const supabase =
  globalThis.__yuvaSupabase ??
  createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );

globalThis.__yuvaSupabase = supabase;

export const checkSupabaseConfig = () => {
  if (!isConfigured) {
    throw new Error('Supabase is not configured. Please add your credentials in the Settings -> Secrets menu.');
  }
  return true;
};

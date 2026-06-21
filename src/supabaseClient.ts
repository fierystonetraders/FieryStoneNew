/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Retrieve the Supabase Client lazily.
 * This prevents application crashes on startup if environment keys are not configured yet,
 * providing the user clear feedback instead of an operational failure.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Standard Supabase client instance using conditional fallback to prevent crash.
 */
export const supabase = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    return null as unknown as SupabaseClient;
  }
  return createClient(url, key);
})();

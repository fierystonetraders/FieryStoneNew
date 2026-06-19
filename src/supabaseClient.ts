/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Retrieve the Supabase Client lazily.
 * This prevents application crashes on startup if environment keys are not configured yet,
 * providing the user clear feedback instead of an operational failure.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase credentials are missing. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your system environment or in your Secrets/Settings configuration.'
    );
    // Return a dummy client or throw a functional error to ensure the developer has immediate context
    throw new Error(
      'Supabase Client configuration error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please provide these values in the environment Settings.'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
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

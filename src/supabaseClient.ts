/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global variable attached to the window object or module scope to guarantee uniqueness
let globalSupabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  // If an instance already exists anywhere in memory, return it instantly
  if (globalSupabaseInstance) {
    return globalSupabaseInstance;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase Client configuration error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }

  // Create the instance exactly ONCE
  globalSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return globalSupabaseInstance;
}

// Keep a fallback matching export if other old components still look for raw variable bindings
export const supabase = getSupabase();
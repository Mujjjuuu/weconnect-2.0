import { createClient, SupabaseClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;

/**
 * Validates and retrieves the Supabase key from the environment.
 */
const getSupabaseKey = () => {
  const key = process.env?.SUPABASE_ANON_KEY;
  if (key && key.trim().length > 20 && !key.includes('placeholder') && key !== '') {
    return key.trim();
  }
  return null;
};

const activeKey = getSupabaseKey();

/**
 * Shared Supabase instance.
 */
export const supabase: SupabaseClient | null = activeKey 
  ? createClient(supabaseUrl, activeKey) 
  : null;

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Validates the connection with a lightweight ping.
 * Returns true if the key is not only present but functional.
 */
export const testConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const seedInitialData = async () => {
  if (!supabase) {
    console.info("WeConnect: Running in Local Demo Mode.");
    return;
  }
  console.log("WeConnect: Cloud Handshake Initialized...");
};
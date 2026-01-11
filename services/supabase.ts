
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;

/**
 * Validates and retrieves the Supabase key from the environment.
 * Ensures the app handles missing keys gracefully for local demo states.
 */
const getSupabaseKey = () => {
  // Check window.process for browser shim or process.env for standard environments
  const env = (window as any).process?.env || (import.meta as any).env;
  const key = env?.SUPABASE_ANON_KEY || env?.VITE_SUPABASE_ANON_KEY;
  
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

/**
 * Helper to check configuration state.
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Validates the connection with a lightweight ping.
 * Returns true if the key is functional in the current network context.
 */
export const testConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  try {
    // Attempt to read from the public profiles table as a heartbeat
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn("Supabase Handshake Rejected:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Supabase Network Exception:", e);
    return false;
  }
};

/**
 * Initialization logging for deployment debugging.
 */
export const seedInitialData = async () => {
  if (!supabase) {
    console.info("WeConnect Runtime: LOCAL_DEMO_MODE (SUPABASE_ANON_KEY not detected).");
    return;
  }
  const connected = await testConnection();
  if (connected) {
    console.info("WeConnect Runtime: CLOUD_HANDSHAKE_VERIFIED.");
  } else {
    console.warn("WeConnect Runtime: CLOUD_CONNECTED_BUT_AUTH_FAIL.");
  }
};

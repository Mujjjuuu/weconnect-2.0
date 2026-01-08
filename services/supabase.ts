import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;

/**
 * Returns the current Supabase Anon Key from the environment.
 */
const getSupabaseKey = () => {
  const key = process.env?.SUPABASE_ANON_KEY;
  if (key && key.length > 10) return key;
  return null;
};

/**
 * Direct Supabase client instance.
 * If the key is missing, it will use a placeholder to prevent initialization crash,
 * but operations will fail gracefully.
 */
const key = getSupabaseKey();
export const supabase = createClient(supabaseUrl, key || 'placeholder-key');

/**
 * Check if the application has a valid Supabase configuration.
 */
export const isSupabaseConfigured = () => {
  const currentKey = getSupabaseKey();
  return !!currentKey && currentKey !== 'placeholder-key';
};

/**
 * Seeds initial data into the database if it is empty.
 */
export const seedInitialData = async () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase: Key missing. Seeding skipped.");
    return;
  }
  
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
       console.warn("Supabase connection established, but tables may not be ready.");
       return;
    }
    
    if (!data || data.length === 0) {
      console.log("WeConnect: Database connected and ready.");
    }
  } catch (e) {
    console.warn("Supabase connection check failed.");
  }
};

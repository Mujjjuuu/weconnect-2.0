import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;

// Internal cache for the client instance
let cachedClient: any = null;

/**
 * Returns the Supabase client instance. 
 * If initialization fails, it returns a proxy that prevents runtime crashes.
 */
export const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  // Use the injected key or a dummy string to prevent the client constructor from throwing
  const anonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) 
    ? process.env.SUPABASE_ANON_KEY 
    : 'placeholder-key-for-local-development';

  try {
    // If the key is placeholder, don't even try to connect
    if (anonKey.includes('placeholder')) throw new Error('Supabase key not provided');
    
    cachedClient = createClient(supabaseUrl, anonKey);
    return cachedClient;
  } catch (err) {
    console.warn("Supabase Init Warning: Database connection disabled. Using offline mode.");
    
    // Return a 'Safe Proxy' that mimics the Supabase API but returns empty results
    // This prevents App.tsx from crashing when it calls supabase.from().select()
    const safeProxy = {
      from: () => ({
        select: () => ({ 
          limit: () => Promise.resolve({ data: [], error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
          or: () => Promise.resolve({ data: [], error: null }),
          eq: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) })
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    };
    cachedClient = safeProxy;
    return safeProxy;
  }
};

// Exporting as a constant for backwards compatibility with existing imports
export const supabase = getSupabaseClient();

export const isSupabaseConfigured = () => {
  const anonKey = process.env?.SUPABASE_ANON_KEY;
  return !!(anonKey && anonKey.length > 20 && !anonKey.includes('placeholder'));
};

export const seedInitialData = async () => {
  if (!isSupabaseConfigured()) return;
  
  const client = getSupabaseClient();
  try {
    const { data } = await client.from('profiles').select('id').limit(1);
    if (!data || data.length === 0) {
      console.log("Seeding initial data...");
      // Add seeding logic here if needed
    }
  } catch (e) {
    console.warn("Seed operation bypassed (offline or schema mismatch).");
  }
};

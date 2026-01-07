
import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_0AEQWHKsP1TddFfnTRtN8w_sR6UCqFH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseAnonKey !== 'MISSING_SUPABASE_KEY' && supabaseAnonKey.length > 20;
};

/**
 * Ensures all required tables exist and are seeded with initial test data.
 */
export const seedInitialData = async () => {
  if (!isSupabaseConfigured()) return;

  // Prevent repeated seeding logs in a single session
  if (sessionStorage.getItem('weconnect_seed_attempted')) return;
  sessionStorage.setItem('weconnect_seed_attempted', 'true');

  try {
    // 1. Verify 'profiles' table health
    const { data: profileCheck, error: pError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (pError) {
      if (pError.code === '42P01') {
        console.error("WeConnect: Database tables not found. Please run the Clean Reset SQL in your Supabase SQL Editor.");
      } else if (pError.message.includes('column') || pError.message.includes('avatar_url')) {
        console.error(`WeConnect Schema Mismatch: The column 'avatar_url' appears to be missing. Please run the Clean Reset SQL.`);
      } else {
        console.error("WeConnect DB Connection Error:", pError.message);
      }
      return;
    }

    // 2. Only seed if the table is empty
    if (!profileCheck || profileCheck.length === 0) {
      console.log("WeConnect: Initializing cloud data...");
      
      const mockProfiles = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Sarah Jenkins',
          email: 'sarah@creator.ai',
          avatar_url: 'https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg?auto=compress&cs=tinysrgb&w=800',
          bio: 'Elite Lifestyle & Tech Creator focusing on sustainable living and minimalist tech gadgets.',
          role: 'influencer',
          location: 'New York, USA'
        }
      ];

      const { error: insertError } = await supabase.from('profiles').insert(mockProfiles);
      
      if (insertError) {
        console.error("Seeding Error:", insertError.message);
      } else {
        console.log("WeConnect: Cloud storage successfully initialized.");
      }
    }
  } catch (err: any) {
    const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error("Supabase Initialization Exception:", msg);
  }
};

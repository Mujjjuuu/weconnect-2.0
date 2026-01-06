
import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'viwoqqthqypwlruzamfz';
const supabaseUrl = `https://${PROJECT_ID}.supabase.co`;

/**
 * We check if the environment variable is available. 
 * If not, we use a recognizable placeholder.
 */
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'MISSING_SUPABASE_KEY';

/**
 * We create the client, but we will check its validity before making calls.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to determine if we are in "Mock Mode" (no valid Supabase config)
 */
export const isSupabaseConfigured = () => {
  return supabaseAnonKey !== 'MISSING_SUPABASE_KEY' && supabaseAnonKey.length > 20;
};

/**
 * Ensures basic data exists if Supabase is connected.
 * If not configured, it fails silently to avoid "Invalid API key" console spam.
 */
export const seedInitialData = async () => {
  if (!isSupabaseConfigured()) {
    console.warn("WeConnect: Supabase key is missing. Running in Mock Mode with local data.");
    return;
  }

  try {
    const { data: influencers, error: infError } = await supabase.from('influencers').select('id').limit(1);
    
    if (infError) {
      if (infError.message?.includes('API key')) {
        console.warn("WeConnect: Supabase API key appears invalid. Falling back to local data.");
      } else if (infError.code === '42P01') {
        console.warn("WeConnect: Tables missing in Supabase. Falling back to local data.");
      } else {
        console.error("Supabase Setup Error:", infError.message);
      }
      return;
    }

    if (!influencers || influencers.length === 0) {
      const mockInfluencers = [
        {
          name: 'Sarah Jenkins',
          handle: '@sarahj_lifestyle',
          niche: ['Beauty', 'Lifestyle'],
          followers: '245K',
          engagement_rate: '4.8%',
          ai_score: 98,
          avatar: 'https://picsum.photos/seed/sarah/200',
          bio: 'Lifestyle & Tech Creator for Gen Z.',
          location: 'New York, USA'
        },
        {
          name: 'Marcus Chen',
          handle: '@marcus_visuals',
          niche: ['Travel', 'Tech'],
          followers: '102K',
          engagement_rate: '5.2%',
          ai_score: 92,
          avatar: 'https://picsum.photos/seed/marcus/200',
          bio: 'Cinematic storyteller and tech reviewer.',
          location: 'London, UK'
        }
      ];
      await supabase.from('influencers').insert(mockInfluencers);
    }
  } catch (err) {
    // Fail silently to keep the app functional
  }
};

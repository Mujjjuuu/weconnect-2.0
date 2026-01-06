
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
  if (!isSupabaseConfigured()) {
    console.warn("WeConnect: Running in Mock Mode - Database connection restricted.");
    return;
  }

  try {
    const { data: profileCheck, error: pError } = await supabase.from('profiles').select('id').limit(1);
    
    if (pError) {
      console.error("Critical Schema Error: Ensure tables are initialized in Supabase Dashboard.");
      return;
    }

    if (!profileCheck || profileCheck.length === 0) {
      console.log("Database empty. Seeding structured system data with interactive assets...");
      
      const mockProfiles = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          full_name: 'Sarah Jenkins',
          email: 'sarah@creator.ai',
          phone: '+1 (555) 123-4567',
          avatar_url: 'https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg?auto=compress&cs=tinysrgb&w=800',
          bio: 'Elite Lifestyle & Tech Creator focusing on sustainable living and minimalist tech gadgets.',
          role: 'influencer',
          location: 'New York, USA',
          website: 'https://sarahjenkins.media',
          work_videos: [
            'https://cdn.pixabay.com/video/2021/04/12/70860-536967812_tiny.mp4',
            'https://cdn.pixabay.com/video/2020/09/24/50849-463121516_tiny.mp4'
          ],
          social_links: { 
            instagram: { handle: '@sarahj_lifestyle', stats: { followers: 245000, engagementRate: 4.8, verified: true } }, 
            youtube: { handle: 'SarahJ', stats: { followers: 50000, engagementRate: 3.2, verified: true } }
          }
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          full_name: 'EcoSkin Brand',
          email: 'hq@ecoskin.com',
          phone: '+1 (555) 999-0000',
          avatar_url: 'https://images.pexels.com/photos/3685271/pexels-photo-3685271.jpeg?auto=compress&cs=tinysrgb&w=800',
          bio: 'Leading the revolution in organic, neural-tested skincare for the next generation of consumers.',
          role: 'brand',
          location: 'San Francisco, USA',
          website: 'https://ecoskin.bio',
          social_links: { instagram: '@ecoskin_official', tiktok: '@ecoskin_skin', youtube: 'youtube.com/ecoskin' }
        }
      ];

      await supabase.from('profiles').insert(mockProfiles);

      await supabase.from('influencers').insert([
        {
          profile_id: '00000000-0000-0000-0000-000000000001',
          handle: '@sarahj_lifestyle',
          niche: ['Beauty', 'Lifestyle', 'Tech'],
          followers: '245K',
          engagement_rate: '4.8%',
          ai_score: 98,
          work_videos: [
            'https://cdn.pixabay.com/video/2021/04/12/70860-536967812_tiny.mp4',
            'https://cdn.pixabay.com/video/2020/09/24/50849-463121516_tiny.mp4'
          ]
        }
      ]);

      await supabase.from('campaigns').insert([
        {
          id: 'camp_1',
          name: 'Summer Neural Launch',
          status: 'active',
          budget: '$5,000',
          progress: 45,
          deliverables: ['2x Instagram Reels', '1x TikTok'],
          influencers_count: 3,
          brand_id: '00000000-0000-0000-0000-000000000002'
        }
      ]);
    }
  } catch (err) {
    console.error("Supabase Initialization Failed:", err);
  }
};

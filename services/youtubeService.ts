
/**
 * YouTube Data API Service
 * Uses the provided API key to fetch channel statistics.
 */

const YOUTUBE_API_KEY = 'AIzaSyDuXxnZRqvLjAN6kpNoK24DXM1T0WCMR88';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  channelName: string;
  thumbnail: string;
  engagementRate: number;
}

/**
 * Extracts a handle or ID from various YouTube URL formats.
 */
export const parseYouTubeInput = (input: string): { type: 'id' | 'handle' | 'unknown'; value: string } => {
  const trimmed = input.trim();
  
  // Direct ID check (UC followed by 22 chars)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed };
  }

  // Handle check (@name)
  if (trimmed.startsWith('@')) {
    return { type: 'handle', value: trimmed };
  }

  // URL checks
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const path = url.pathname;

    if (path.includes('/channel/')) {
      const id = path.split('/channel/')[1].split('/')[0];
      return { type: 'id', value: id };
    }

    if (path.includes('/@')) {
      const handle = '@' + path.split('/@')[1].split('/')[0];
      return { type: 'handle', value: handle };
    }
  } catch (e) {
    // If not a valid URL, check if it's just a handle without @
    if (trimmed.length > 0 && !trimmed.includes(' ')) {
        return { type: 'handle', value: trimmed.startsWith('@') ? trimmed : `@${trimmed}` };
    }
  }

  return { type: 'unknown', value: trimmed };
};

/**
 * Fetches YouTube channel data by channel ID or handle.
 */
export const fetchYouTubeChannelData = async (input: string): Promise<YouTubeStats | null> => {
  try {
    const { type, value } = parseYouTubeInput(input);
    if (type === 'unknown') throw new Error("Invalid YouTube reference");

    const param = type === 'id' ? `id=${value}` : `forHandle=${value}`;
    
    const response = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&${param}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      // If forHandle fails, try a search fallback (sometimes API handles are finicky)
      if (type === 'handle') {
        const searchRes = await fetch(
          `${BASE_URL}/search?part=snippet&q=${value}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchRes.json();
        if (searchData.items?.[0]?.snippet?.channelId) {
          return fetchYouTubeChannelData(searchData.items[0].snippet.channelId);
        }
      }
      throw new Error("Channel not found");
    }

    const channel = data.items[0];
    const stats = channel.statistics;
    const snippet = channel.snippet;

    const subs = parseInt(stats.subscriberCount) || 1;
    const views = parseInt(stats.viewCount) || 0;
    const vids = parseInt(stats.videoCount) || 1;
    
    // Heuristic engagement
    const avgViewsPerVid = views / vids;
    const engagementRate = Math.min(((avgViewsPerVid / subs) * 10), 100).toFixed(2);

    return {
      subscriberCount: stats.subscriberCount,
      viewCount: stats.viewCount,
      videoCount: stats.videoCount,
      channelName: snippet.title,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      engagementRate: parseFloat(engagementRate)
    };
  } catch (error) {
    console.error("YouTube API Error:", error);
    return null;
  }
};

/**
 * Formats large numbers for display (e.g., 1200000 -> 1.2M)
 */
export const formatCount = (count: string | number): string => {
  const num = typeof count === 'string' ? parseInt(count) : count;
  if (isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

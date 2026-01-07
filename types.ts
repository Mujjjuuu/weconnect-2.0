
export type UserRole = 'brand' | 'influencer';

export interface SocialStats {
  followers: number;
  engagementRate: number;
  avgLikes?: number;
  avgComments?: number;
  verified: boolean;
  lastSync?: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  location: string;
  website?: string;
  gender?: string;
  languages?: string[];
  categories?: string[];
  address?: string;
  workVideos?: string[]; 
  socialLinks?: {
    instagram?: { handle: string; stats?: SocialStats };
    tiktok?: { handle: string; stats?: SocialStats };
    youtube?: { handle: string; stats?: SocialStats };
  };
  createdAt?: string;
  securitySettings?: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  activeEntityId: string;
  entities: Profile[];
}

/**
 * Influencer interface for marketplace and discovery
 */
export interface Influencer {
  id: string;
  name: string;
  handle: string;
  niche: string[];
  followers: string;
  engagementRate: string;
  aiScore: number;
  avatar: string;
  bio: string;
  location: string;
  workVideos?: string[];
  portfolio: any[];
  packages: any[];
  socialStats?: {
    instagram?: SocialStats;
    tiktok?: SocialStats;
    youtube?: SocialStats;
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'draft' | 'pending';
  budget: string;
  progress: number;
  deliverables: string[];
  influencersCount: number;
  brandName?: string;
  brandId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface Payment {
  id: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  campaignId: string;
  type: 'payout' | 'deposit';
}

export interface AIAnalysisResult {
  creativityScore: number;
  engagementPotential: number;
  brandFriendliness: number;
  summary: string;
  recommendations: string[];
}

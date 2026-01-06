
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
  workVideos?: string[]; // Array of video URLs for portfolio
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

export interface BrandProfile extends Profile {
  industry: string;
  companySize?: string;
  brandValues?: string[];
}

export interface InfluencerProfile extends Profile {
  handle: string;
  niche: string[];
  followers: string;
  engagementRate: string;
  aiScore: number;
  portfolio: string[];
}

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
  portfolio: string[];
  workVideos?: string[]; // Added for marketplace preview
  packages: any[];
  socialStats?: {
    instagram?: SocialStats;
    youtube?: SocialStats;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  currentRole: UserRole;
  profileData?: Profile;
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

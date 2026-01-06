
export type UserRole = 'brand' | 'influencer';

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  niche: string[];
  followers: string;
  engagementRate: string;
  aiScore: number;
  avatar: string;
  portfolio: string[];
  bio: string;
  location: string;
  packages: PricingPackage[];
}

export interface PricingPackage {
  name: string;
  price: number;
  features: string[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'draft' | 'pending';
  budget: string;
  progress: number;
  deliverables: string[];
  influencersCount: number;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface AIAnalysisResult {
  creativityScore: number;
  engagementPotential: number;
  brandFriendliness: number;
  summary: string;
  recommendations: string[];
}

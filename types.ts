
export type Screen = 'home' | 'scanning' | 'results' | 'history' | 'profile';

export type Language = 'English' | 'Chinese (Simplified)' | 'Chinese (Traditional)' | 'Japanese' | 'Korean' | 'Spanish' | 'French' | 'Thai' | 'Vietnamese' | 'German' | 'Italian';

export type ScanType = 'dish' | 'menu';

export interface UserProfile {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  default_language: Language;
  chef_card_language?: Language;
  allergens: string[];
  dietary_notes: string;
}

export interface Dish {
  id: string;
  user_id?: string; // Optional for local state before sync
  name: string;
  originalName: string;
  description: string; // Ingredients, taste profile
  image?: string; // Optional, might use the main uploaded image if specific crop isn't available
  tags: string[]; // Flavor tags (e.g. "Sweet", "Salty")
  allergens: string[]; // List of allergens (e.g. "Peanuts", "Shellfish")
  spiceLevel: 'None' | 'Mild' | 'Medium' | 'Hot';
  category: string;
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  isMenu?: boolean; // New flag to indicate if this came from a menu scan
  created_at?: string;
}

export interface SavedItem extends Dish {
  savedAt: Date;
}
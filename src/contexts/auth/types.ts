
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
  hasOneTimeAccess: (resourceId: string) => boolean;
  markOneTimeAccess: (resourceId: string) => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  type: "customer" | "business";
  businessName?: string;
}

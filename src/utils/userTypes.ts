
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/supabase";
import { User as MockUser } from "@/data/mockUsers";

// Define a type for our extended user data that combines Supabase User and Profile
export type ExtendedUser = User & Partial<Profile> & {
  name?: string;
};

// Type guard to check if user is a Mock User
export function isMockUser(user: any): user is MockUser {
  return user && 'type' in user && !('aud' in user);
}

// Type guard to check if user is an Extended User
export function isExtendedUser(user: any): user is ExtendedUser {
  return user && 'aud' in user;
}

// Get formatted user name from any user type
export function getUserName(user: ExtendedUser | MockUser | null): string {
  if (!user) return "User";
  
  if ('name' in user && user.name) {
    return user.name;
  }
  
  if ('first_name' in user || 'last_name' in user) {
    const firstName = (user as any).first_name || '';
    const lastName = (user as any).last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  
  return user.email?.split('@')[0] || 'User';
}

// Create a display name from the user data
export function getDisplayName(user: ExtendedUser | MockUser | null): string {
  if (!user) return 'User';
  
  if ('first_name' in user && user.first_name && 'last_name' in user && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if ('name' in user && user.name) {
    return user.name;
  }
  
  return user.email?.split('@')[0] || 'User';
}

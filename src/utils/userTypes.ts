
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/supabase";

// Define a type for our extended user data that combines Supabase User and Profile
export type ExtendedUser = User & Partial<Profile> & {
  name?: string;
  avatar?: string;
  bio?: string;
  businessId?: string;
  zipCode?: string;
  email?: string;
  type?: string;
};

// Get formatted user name from any user type
export function getUserName(user: ExtendedUser | null): string {
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
  
  return user.email?.split('@')?.[0] || 'User';
}

// Create a display name from the user data
export function getDisplayName(user: ExtendedUser | null): string {
  if (!user) return 'User';
  
  if ('first_name' in user && user.first_name && 'last_name' in user && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if ('name' in user && user.name) {
    return user.name;
  }
  
  return user.email?.split('@')?.[0] || 'User';
}

// Helper function to normalize user property names
export function normalizeUserFields(user: any): ExtendedUser {
  if (!user) return {} as ExtendedUser;
  
  return {
    ...user,
    // Map database field names to our frontend property names for consistency
    name: user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : undefined),
    businessId: user.business_id || user.businessId,
    zipCode: user.zipcode || user.zipCode,
  };
}

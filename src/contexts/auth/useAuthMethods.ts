
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { SignupData } from "./types";

/**
 * Hook for authentication methods
 */
export const useAuthMethods = (
  setIsSubscribed: (value: boolean) => void,
  oneTimeAccessResources: string[],
  setOneTimeAccessResources: React.Dispatch<React.SetStateAction<string[]>>,
  currentUser: User | null
) => {
  // Login function using Supabase
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      // Session and user will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Signup function using Supabase
  const signup = async ({
    email,
    password,
    name,
    phone,
    zipCode,
    address,
    city,
    state,
    type,
    businessName,
  }: SignupData) => {
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { 
            name, 
            type,
            address,
            city,
            state,
            zipCode,
            phone
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Use functions.invoke to create profile through an edge function
        // This bypasses RLS policies by using service role
        const { error: profileError } = await supabase.functions.invoke('create-profile', {
          body: {
            userId: data.user.id,
            name: name,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            type: type,
            businessName: businessName
          }
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          return { success: false, error: profileError.message };
        }

        // User and session will be set by the auth state listener
        return { success: true };
      }

      return { success: false, error: "Failed to create user" };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setIsSubscribed(false);
  };

  // Update profile - now updates both auth metadata and profiles table
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update user metadata if needed
      if (updates.name || updates.email) {
        await supabase.auth.updateUser({
          email: updates.email,
          data: { name: updates.name }
        });
      }

      // Update the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          zipcode: updates.zipCode, // Note: Updated to match DB field name
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };
  
  // One-time access functions, using Supabase
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check if the resourceId exists in the local state
    return oneTimeAccessResources.includes(resourceId);
  };
  
  const markOneTimeAccess = async (resourceId: string) => {
    if (!currentUser) return;
    
    try {
      // Store in Supabase - using customer_access table instead of one_time_access
      const { error } = await supabase
        .from('customer_access')
        .insert({
          business_id: currentUser.id,
          customer_id: resourceId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
        });
        
      if (error) {
        console.error("Error marking one-time access:", error);
      } else {
        // Update local state
        setOneTimeAccessResources(prev => [...prev, resourceId]);
      }
    } catch (error) {
      console.error("Error in markOneTimeAccess:", error);
    }
  };

  return {
    login,
    signup,
    logout,
    updateProfile,
    hasOneTimeAccess,
    markOneTimeAccess
  };
};

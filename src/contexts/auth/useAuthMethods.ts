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
      // First attempt a regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If login failed due to unconfirmed email, handle it separately
      if (error && error.message === "Email not confirmed") {
        console.log("Email not confirmed, attempting to confirm and login");
        
        // Use the functions invoke method instead of admin.listUsers which requires admin privileges
        try {
          // Try to confirm the email directly
          await supabase.functions.invoke('confirm-email', {
            body: { email }
          });
          
          // Try login again
          const { data: confirmedData, error: confirmedError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (confirmedError) {
            console.error("Login error after email confirmation:", confirmedError);
            return { success: false, error: confirmedError.message };
          }
          
          // Session and user will be set by the auth state listener
          return { success: true };
        } catch (confirmError) {
          console.error("Error confirming email:", confirmError);
          return { success: false, error: "Unable to verify account. Please contact support." };
        }
      }
      
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
          },
          emailRedirectTo: window.location.origin + '/login',
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

  // Update profile - now updates both auth metadata and calls the edge function
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update user metadata if needed
      if (updates.email) {
        await supabase.auth.updateUser({
          email: updates.email,
        });
      }

      // Use the edge function to update the profile in the database
      const { error } = await supabase.functions.invoke('create-profile', {
        body: {
          userId: currentUser.id,
          name: updates.name || currentUser.name,
          phone: updates.phone || currentUser.phone,
          address: updates.address || currentUser.address,
          city: updates.city || currentUser.city,
          state: updates.state || currentUser.state,
          zipCode: updates.zipCode || currentUser.zipCode,
          type: currentUser.type,
          bio: updates.bio || currentUser.bio,
          businessId: updates.businessId || currentUser.businessId,
          avatar: updates.avatar || currentUser.avatar,
          businessName: currentUser.type === 'business' ? updates.name || currentUser.name : null
        }
      });

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

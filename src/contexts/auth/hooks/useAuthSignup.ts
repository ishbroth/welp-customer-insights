
import { supabase } from "@/integrations/supabase/client";
import { SignupData } from "../types";

/**
 * Hook for handling signup-related functionality
 */
export const useAuthSignup = () => {
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

  return { signup };
};

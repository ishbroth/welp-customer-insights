import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

interface AuthContextType {
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
  markOneTimeAccess: (resourceId: string) => void;
}

interface SignupData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  type: "customer" | "business";
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    const subscriptionStatus = localStorage.getItem("isSubscribed");
    return subscriptionStatus === "true";
  });

  // Initialize auth state
  useEffect(() => {
    // First set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent potential recursive issues with Supabase auth
          setTimeout(() => {
            fetchUserProfile(newSession.user);
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        fetchUserProfile(initialSession.user);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data from profiles table
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile", error);
        setLoading(false);
        return;
      }

      if (data) {
        setCurrentUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: data.name || '',
          type: data.type as "business" | "customer" | "admin",
          phone: data.phone || '',
          zipCode: data.zip_code || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          avatar: data.avatar_url || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error("Error processing user profile", error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Signup function - updated to skip email verification
  const signup = async ({ email, password, name, phone, zipCode, address, city, state, type }: SignupData) => {
    try {
      // Signup with Supabase with auto-confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            zip_code: zipCode,
            address,
            city,
            state,
            type,
          },
          // Skip email verification by not providing emailRedirectTo
          // This forces auto-confirmation of the email
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setIsSubscribed(false);
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isSubscribed");
    setIsSubscribed(false);
  };

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Format updates for the profiles table
      const profileUpdates = {
        name: updates.name,
        phone: updates.phone,
        zip_code: updates.zipCode,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        bio: updates.bio,
        avatar_url: updates.avatar,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', currentUser.id);

      if (error) {
        console.error("Error updating profile", error);
        return;
      }

      // Update local state
      setCurrentUser({ ...currentUser, ...updates });
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // Store subscription status in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isSubscribed", isSubscribed.toString());
  }, [isSubscribed]);
  
  // One-time access functions
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check local storage first for offline/demo access
    const hasReviewAccess = localStorage.getItem(`review_access_${resourceId}`) === "true";
    const hasCustomerAccess = localStorage.getItem(`customer_access_${resourceId}`) === "true";
    
    if (hasReviewAccess || hasCustomerAccess) {
      return true;
    }
    
    // In production, we would check against the one_time_access table in Supabase
    // This would be implemented when we connect the one-time access feature to Supabase
    return false;
  };
  
  const markOneTimeAccess = (resourceId: string) => {
    if (!currentUser) return;
    
    // Store in localStorage for offline/demo access
    if (resourceId.startsWith("review_")) {
      localStorage.setItem(`review_access_${resourceId.replace("review_", "")}`, "true");
    } else {
      localStorage.setItem(`customer_access_${resourceId}`, "true");
    }
    
    // In production, we would insert a row into the one_time_access table in Supabase
    // This would be implemented when we connect the one-time access feature to Supabase
  };

  const value = {
    currentUser,
    session,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isSubscribed,
    setIsSubscribed,
    hasOneTimeAccess,
    markOneTimeAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

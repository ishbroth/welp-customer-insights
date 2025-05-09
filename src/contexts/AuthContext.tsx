
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

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
  markOneTimeAccess: (resourceId: string) => Promise<void>;
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
  businessName?: string;
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
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  // For tracking one-time access resources
  const [oneTimeAccessResources, setOneTimeAccessResources] = useState<string[]>([]);

  // Fetch subscription status when user changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!currentUser) {
        setIsSubscribed(false);
        return;
      }
      
      try {
        // Using a more direct approach since rpc function might not exist yet
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) {
          console.error('Error checking subscription status:', error);
          return;
        }
        
        setIsSubscribed(!!data);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      }
    };

    checkSubscriptionStatus();
  }, [currentUser]);

  // Set up auth state listener on mount
  useEffect(() => {
    setLoading(true);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Map the database profile to our application User type
        const user: User = {
          id: data.id,
          email: session?.user?.email || '',
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipcode || '', // Note: Updated to match DB field name
          type: data.type as "customer" | "business" | "admin",
          avatar: data.avatar || undefined,
        };
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

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
  }: SignupData) => {
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name, type }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zipcode: zipCode, // Note: Updated to match DB field name
            type: type,
            created_at: new Date().toISOString(),
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

      // Update the currentUser state
      setCurrentUser({ ...currentUser, ...updates });
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

  // Load one-time access resources from Supabase when user changes
  useEffect(() => {
    const loadOneTimeAccessResources = async () => {
      if (!currentUser) {
        setOneTimeAccessResources([]);
        return;
      }
      
      try {
        // Using customer_access table instead
        const { data, error } = await supabase
          .from('customer_access')
          .select('customer_id')
          .eq('business_id', currentUser.id);
          
        if (error) {
          console.error("Error loading one-time access resources:", error);
          return;
        }
        
        if (data) {
          setOneTimeAccessResources(data.map(item => item.customer_id || '').filter(Boolean));
        }
      } catch (error) {
        console.error("Error loading one-time access:", error);
      }
    };
    
    loadOneTimeAccessResources();
  }, [currentUser]);

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


import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Add subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Check for existing session on mount
  useEffect(() => {
    async function getInitialSession() {
      setLoading(true);
      
      try {
        // Check if there is an active session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return;
        }
        
        if (sessionData?.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (userError) {
            console.error("Error fetching user:", userError);
            return;
          }
          
          if (userData) {
            setCurrentUser(userData as User);
            
            // Check if user has active subscription
            const { data: subscriptionData } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', userData.id)
              .eq('status', 'active')
              .single();
            
            setIsSubscribed(!!subscriptionData);
          }
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getInitialSession();
    
    // Set up auth listener for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!userError && userData) {
            setCurrentUser(userData as User);
          }
        } else {
          setCurrentUser(null);
          setIsSubscribed(false);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data.user) {
        // Fetch user details from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          return false;
        }
        
        setCurrentUser(userData as User);
        
        // Check subscription status
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .single();
        
        setIsSubscribed(!!subscriptionData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast({
          title: "Google login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast({
          title: "Apple login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Apple login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        return;
      }
      
      setCurrentUser(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Update failed",
          description: "Could not update your profile.",
          variant: "destructive"
        });
        return;
      }
      
      setCurrentUser({ ...currentUser, ...updates });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    updateProfile,
    isSubscribed,
    setIsSubscribed,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

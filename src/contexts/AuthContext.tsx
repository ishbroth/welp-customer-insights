
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, updateUserProfile } from "@/utils/supabase";
import { Profile } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { User as MockUser, mockUsers } from "@/data/mockUsers";

interface AuthContextType {
  currentUser: (User & Partial<Profile>) | MockUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: any) => Promise<{success: boolean, error?: string}>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  useMockData: boolean;
  setUseMockData: (use: boolean) => void;
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
  const [currentUser, setCurrentUser] = useState<(User & Partial<Profile>) | MockUser | null>(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(true);
  const { toast } = useToast();

  // Setup Supabase auth state listener
  useEffect(() => {
    // Only set up Supabase listeners if not using mock data
    if (!useMockData) {
      // First set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (session?.user) {
            // Use setTimeout to prevent possible deadlock with Supabase
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                // Merge the user and profile data
                const fullUser = {
                  ...session.user,
                  ...profile
                };
                
                setCurrentUser(fullUser);
                localStorage.setItem("currentUser", JSON.stringify(fullUser));
              } catch (error) {
                console.error("Error fetching user profile:", error);
                setCurrentUser(session.user);
              }
            }, 0);
          } else {
            setCurrentUser(null);
            localStorage.removeItem("currentUser");
          }
        }
      );
      
      // Then check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch the user profile data
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const fullUser = {
                  ...session.user,
                  ...profile
                };
                setCurrentUser(fullUser);
                localStorage.setItem("currentUser", JSON.stringify(fullUser));
              } else {
                setCurrentUser(session.user);
              }
            })
            .catch((error) => {
              console.error("Error fetching user profile:", error);
              setCurrentUser(session.user);
            });
        }
      });
      
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [useMockData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (useMockData) {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = mockUsers.find(user => user.email === email);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        return true;
      }
      return false;
    } else {
      // Real Supabase authentication
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error.message);
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{success: boolean, error?: string}> => {
    if (useMockData) {
      // Mock signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = {
        id: `mock-${Date.now()}`,
        email,
        ...userData
      };
      setCurrentUser(newUser as MockUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      return { success: true };
    } else {
      // Real Supabase signup
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData
          }
        });
        
        if (error) {
          console.error("Signup error:", error.message);
          return { success: false, error: error.message };
        }
        
        toast({
          title: "Account Created",
          description: "Your account has been successfully created.",
        });
        
        return { success: true };
      } catch (error: any) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    if (useMockData) {
      // Mock Google authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      const customerUser = mockUsers.find(user => user.email === "customer@example.com");
      
      if (customerUser) {
        setCurrentUser(customerUser);
        localStorage.setItem("currentUser", JSON.stringify(customerUser));
        return true;
      }
      return false;
    } else {
      // Real Supabase OAuth
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        
        if (error) {
          console.error("Google login error:", error.message);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Google login error:", error);
        return false;
      }
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    if (useMockData) {
      // Mock Apple authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      const businessUser = mockUsers.find(user => user.email === "business@example.com");
      
      if (businessUser) {
        setCurrentUser(businessUser);
        localStorage.setItem("currentUser", JSON.stringify(businessUser));
        return true;
      }
      return false;
    } else {
      // Real Supabase OAuth
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
        });
        
        if (error) {
          console.error("Apple login error:", error.message);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Apple login error:", error);
        return false;
      }
    }
  };

  const logout = async () => {
    if (useMockData) {
      // Mock logout
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
    } else {
      // Real Supabase logout
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (useMockData) {
      // Mock profile update
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    } else {
      // Real Supabase profile update
      if (currentUser && 'id' in currentUser) {
        try {
          await updateUserProfile(currentUser.id, updates);
          
          // Update local state with new profile data
          const updatedUser = { ...currentUser, ...updates };
          setCurrentUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Error updating profile:", error);
          toast({
            title: "Profile Update Failed",
            description: "Failed to update your profile. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const value = {
    currentUser,
    session,
    login,
    signUp,
    loginWithGoogle,
    loginWithApple,
    logout,
    updateProfile,
    useMockData,
    setUseMockData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

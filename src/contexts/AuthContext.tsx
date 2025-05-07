
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Profile } from '@/types/supabase';
import { getUserProfile, updateUserProfile } from '@/utils/supabase';

// Define the user type to include Profile properties and additional fields
export interface UserType extends Profile {
  id: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: UserType | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, type: string) => Promise<{ success: boolean; error?: any; }>;
  updateProfile: (profileData: Partial<UserType>) => Promise<{ success: boolean; error?: any; }>;
  useMockData: boolean;
  setUseMockData: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(
    localStorage.getItem('useMockData') === 'true'
  );
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effect to persist mock data setting
  useEffect(() => {
    localStorage.setItem('useMockData', String(useMockData));
  }, [useMockData]);

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            ...profile,
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
  }, []);

  // Function to handle user login
  const login = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to log in.",
      });
      navigate('/verify-email');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      toast({
        description: "Logged out successfully.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user sign-up
  const signUp = async (email: string, type: string) => {
    try {
      setLoading(true);
      // For passwordless auth, we need to generate a random password
      const tempPassword = Math.random().toString(36).slice(-10);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword, // Required by Supabase but not used in passwordless flow
        options: {
          data: {
            type: type,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
      
      if (error) throw error;

      // Create user profile immediately after signup
      if (data.user?.id) {
        const newProfile: UserType = {
          id: data.user.id,
          first_name: '',
          last_name: '',
          email: email,
          type: type,
          avatar: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipcode: '',
        };
        
        await updateUserProfile(data.user.id, newProfile);
      }

      toast({
        title: "Check your email",
        description: "We've sent you a magic link to verify your email and complete sign up.",
      });
      
      navigate('/verify-email');
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Sign-up Failed",
        description: error.message || "An error occurred during sign-up.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Function to update the user profile
  const updateProfile = async (profileData: Partial<UserType>) => {
    if (!currentUser) {
      toast({
        title: "Update Failed",
        description: "No user logged in",
        variant: "destructive",
      });
      return { success: false, error: "No user logged in" };
    }

    try {
      const { id: currentUserId, email } = currentUser;

      // Group updates by table
      const profileUpdates: Partial<Profile> = {};
      const userUpdates: { email?: string } = {};

      // Separate email (for auth.users) from other profile data
      if (profileData.email && profileData.email !== email) {
        userUpdates.email = profileData.email;
        
        // Update email in Supabase auth
        try {
          await supabase.auth.updateUser({ email: profileData.email });
        } catch (error) {
          console.error("Error updating email:", error);
          toast({
            title: "Email Update Failed",
            description: "Failed to update your email. Please try again.",
            variant: "destructive",
          });
          // Don't throw, continue with other updates
        }
      }

      // Copy all valid profile fields to profileUpdates
      Object.keys(profileData).forEach(key => {
        // Skip id and email as they are handled separately
        if (key !== 'id' && key !== 'email') {
          // @ts-ignore - We're filtering properties appropriately
          profileUpdates[key] = profileData[key];
        }
      });
      
      // Only update the profile if there are valid profile fields
      if (Object.keys(profileUpdates).length > 0) {
        try {
          await updateUserProfile(currentUser.id, profileUpdates);
        } catch (error) {
          console.error("Error updating profile:", error);
          toast({
            title: "Profile Update Failed",
            description: "Failed to update your profile. Please try again.",
            variant: "destructive",
          });
          return { success: false, error };
        }
      }
      
      // Update local state with new profile data
      setCurrentUser({
        ...currentUser,
        ...profileUpdates,
        ...(userUpdates.email ? { email: userUpdates.email } : {})
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return { success: true };
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    loading,
    login,
    logout,
    signUp,
    updateProfile,
    useMockData,
    setUseMockData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

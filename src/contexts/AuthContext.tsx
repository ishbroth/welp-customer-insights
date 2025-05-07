
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Profile } from '@/types/supabase';
import { ExtendedUser, normalizeUserFields } from '@/utils/userTypes';
import { getUserProfile, updateUserProfile } from '@/utils/supabase';

// Define the context type
interface AuthContextType {
  currentUser: ExtendedUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, type: string) => Promise<{ success: boolean; error?: any; }>;
  updateProfile: (profileData: Partial<ExtendedUser>) => Promise<{ success: boolean; error?: any; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effect to handle auth state changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          try {
            const profile = await getUserProfile(data.session.user.id);
            
            if (profile) {
              setCurrentUser(normalizeUserFields({
                ...data.session.user,
                ...profile,
                email: data.session.user.email
              }));
            } else {
              setCurrentUser(normalizeUserFields(data.session.user));
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setCurrentUser(normalizeUserFields(data.session.user));
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          
          if (profile) {
            setCurrentUser(normalizeUserFields({
              ...session.user,
              ...profile,
              email: session.user.email
            }));
          } else {
            setCurrentUser(normalizeUserFields(session.user));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(normalizeUserFields(session.user));
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to handle user login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      return false;
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
      // Generate a random password for the user
      const tempPassword = Math.random().toString(36).slice(-10);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            type: type,
          },
        },
      });
      
      if (error) throw error;

      // Create user profile immediately after signup
      if (data.user?.id) {
        const newProfile = {
          id: data.user.id,
          email: email,
          first_name: '',
          last_name: '',
          type: type,
          avatar: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipcode: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        try {
          await updateUserProfile(data.user.id, newProfile);
        } catch (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account.",
      });
      
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
  const updateProfile = async (profileData: Partial<ExtendedUser>) => {
    if (!currentUser) {
      toast({
        title: "Update Failed",
        description: "No user logged in",
        variant: "destructive",
      });
      return { success: false, error: "No user logged in" };
    }

    try {
      const { id: currentUserId } = currentUser;

      // Prepare profile updates
      const profileUpdates: Partial<Profile> = {};
      
      // Convert frontend property names to database field names
      if (profileData.name) {
        // Split name into first_name and last_name
        const nameParts = profileData.name.split(' ');
        profileUpdates.first_name = nameParts[0];
        profileUpdates.last_name = nameParts.slice(1).join(' ');
        profileUpdates.name = profileData.name;
      }
      
      if (profileData.avatar) profileUpdates.avatar = profileData.avatar;
      if (profileData.bio) profileUpdates.bio = profileData.bio;
      if (profileData.phone) profileUpdates.phone = profileData.phone;
      if (profileData.address) profileUpdates.address = profileData.address;
      if (profileData.city) profileUpdates.city = profileData.city;
      if (profileData.state) profileUpdates.state = profileData.state;
      if (profileData.zipCode) profileUpdates.zipcode = profileData.zipCode;
      if (profileData.businessId) profileUpdates.business_id = profileData.businessId;
      
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
        ...profileData
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
    updateProfile
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


import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  session: null; // Simplified from Supabase Session
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
  businessName?: string; // Added to match usage in VerifyPhone.tsx
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
  const [session, setSession] = useState<null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    const subscriptionStatus = localStorage.getItem("isSubscribed");
    return subscriptionStatus === "true";
  });

  // Login function - mock implementation
  const login = async (email: string, password: string) => {
    try {
      console.log(`Mock login with email: ${email}`);
      
      // Simple mock validation
      if (email && password) {
        // Create a mock user
        const mockUser: User = {
          id: `mock-${Date.now()}`,
          email: email,
          name: email.split('@')[0], // Use part of email as name
          type: email.includes('business') ? 'business' : 'customer',
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        
        // Update state
        setCurrentUser(mockUser);
        
        return { success: true };
      }
      return { success: false, error: "Invalid email or password" };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Signup function - mock implementation
  const signup = async ({ 
    email, 
    password, 
    name, 
    phone, 
    zipCode, 
    address, 
    city, 
    state, 
    type 
  }: SignupData) => {
    try {
      console.log(`Mock signup with email: ${email}, type: ${type}`);
      
      // Create a mock user
      const mockUser: User = {
        id: `mock-${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        phone,
        address,
        city,
        state,
        zipCode,
        type: type as "business" | "customer" | "admin",
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      
      // Update state
      setCurrentUser(mockUser);
      
      // Update subscription status
      setIsSubscribed(false);
      
      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Logout function - mock implementation
  const logout = async () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem("isSubscribed");
    setCurrentUser(null);
    setIsSubscribed(false);
  };

  // Update profile - mock implementation
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update the current user with the new values
      const updatedUser = { ...currentUser, ...updates };
      
      // Store in localStorage
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      // Update state
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Store subscription status in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isSubscribed", isSubscribed.toString());
  }, [isSubscribed]);
  
  // One-time access functions
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check local storage for access
    const hasReviewAccess = localStorage.getItem(`review_access_${resourceId}`) === "true";
    const hasCustomerAccess = localStorage.getItem(`customer_access_${resourceId}`) === "true";
    
    return hasReviewAccess || hasCustomerAccess;
  };
  
  const markOneTimeAccess = (resourceId: string) => {
    if (!currentUser) return;
    
    // Store in localStorage
    if (resourceId.startsWith("review_")) {
      localStorage.setItem(`review_access_${resourceId.replace("review_", "")}`, "true");
    } else {
      localStorage.setItem(`customer_access_${resourceId}`, "true");
    }
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

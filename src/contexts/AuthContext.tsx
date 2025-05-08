
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
  hasOneTimeAccess: (resourceId: string) => boolean;
  markOneTimeAccess: (resourceId: string) => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Add subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    const subscriptionStatus = localStorage.getItem("isSubscribed");
    return subscriptionStatus === "true";
  });

  // Store subscription status in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isSubscribed", isSubscribed.toString());
  }, [isSubscribed]);
  
  // Check if user has one-time access to a specific resource
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check both review-specific and customer-general access
    const hasReviewAccess = localStorage.getItem(`review_access_${resourceId}`) === "true";
    const hasCustomerAccess = localStorage.getItem(`customer_access_${resourceId}`) === "true";
    return hasReviewAccess || hasCustomerAccess;
  };
  
  // Mark a resource as having one-time access
  const markOneTimeAccess = (resourceId: string) => {
    // Determine if this is a review ID or customer ID based on prefix
    if (resourceId.startsWith("review_")) {
      localStorage.setItem(`review_access_${resourceId.replace("review_", "")}`, "true");
    } else {
      localStorage.setItem(`customer_access_${resourceId}`, "true");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This would be replaced with actual Supabase auth
    // For now, we'll simulate a login for demo purposes
    const demoUser: User = {
      id: "demo-user",
      email: email,
      name: "Demo User",
      type: email.includes("business") ? "business" : "customer"
    };
    
    setCurrentUser(demoUser);
    localStorage.setItem("currentUser", JSON.stringify(demoUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSubscribed(false);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isSubscribed");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    login,
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

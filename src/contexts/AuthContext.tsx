
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, mockUsers } from "@/data/mockUsers";

// Extended User type with userType and subscription status
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in a real app, we'd verify credentials with a backend
    const user = mockUsers.find(user => user.email === email);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Google authentication - in a real app, we'd use OAuth
    // For demo purposes, we'll sign in as a customer by default
    const customerUser = mockUsers.find(user => user.email === "customer@example.com");
    
    if (customerUser) {
      setCurrentUser(customerUser);
      localStorage.setItem("currentUser", JSON.stringify(customerUser));
      return true;
    }
    
    return false;
  };

  const loginWithApple = async (): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Apple authentication - sign in as business owner
    const businessUser = mockUsers.find(user => user.email === "business@example.com");
    
    if (businessUser) {
      setCurrentUser(businessUser);
      localStorage.setItem("currentUser", JSON.stringify(businessUser));
      return true;
    }
    
    return false;
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
    loginWithGoogle,
    loginWithApple,
    logout,
    updateProfile,
    isSubscribed,
    setIsSubscribed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

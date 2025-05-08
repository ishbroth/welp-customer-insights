
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BusinessPasswordSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get business data from location state or use empty defaults
  const businessData = location.state?.businessData || {
    name: "",
    email: "",
    phone: ""
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      toast({
        title: "Password Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the user account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: businessData.email,
        password: password,
        options: {
          data: {
            name: businessData.name,
            phone: businessData.phone,
            type: "business"
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account Created",
        description: "Your business account has been created successfully!",
      });
      
      // Navigate to profile or login page
      navigate("/login", { 
        state: { 
          message: "Your business account has been created! Please log in with your email and password." 
        } 
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "An error occurred while creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Set Up Your Password</h1>
              <p className="text-gray-600 mt-2">
                Your business has been verified! Create a password to complete your account setup.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {businessData.email && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={businessData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="welp-input"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="welp-input"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="welp-button w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating Account..."
                ) : (
                  <>
                    Complete Account Setup <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessPasswordSetup;

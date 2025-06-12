import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we have a valid reset session on component mount
  useEffect(() => {
    console.log("ResetPassword component mounted");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Current session:", session);
        console.log("Session error:", error);
        
        if (error) {
          console.error("Session error:", error);
          setIsValidSession(false);
          return;
        }
        
        // For password reset, we need an active session
        if (session && session.user) {
          console.log("Valid reset session found for user:", session.user.email);
          setIsValidSession(true);
        } else {
          console.log("No valid session for password reset");
          setIsValidSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValidSession(false);
      }
    };

    checkSession();

    // Also listen for auth state changes in case the session is established after component mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event detected");
        setIsValidSession(true);
      } else if (session && session.user) {
        console.log("Session established for user:", session.user.email);
        setIsValidSession(true);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setIsValidSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Password update error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });
        
        // Redirect to login page after successful password reset
        navigate("/login", {
          state: {
            message: "Password reset successful! Please log in with your new password."
          }
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto p-6">
              <div className="text-center">
                <p>Validating reset link...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Current URL: {window.location.href}
                </p>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if invalid session
  if (!isValidSession) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto p-6">
              <h1 className="text-3xl font-bold text-center mb-6">Invalid Reset Link</h1>
              
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  This password reset link is invalid or has expired. Please request a new password reset.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-2">
                <Link to="/forgot-password" className="text-welp-primary hover:underline block">
                  Request New Password Reset
                </Link>
                <p className="text-xs text-gray-500">
                  Debug: Current URL - {window.location.href}
                </p>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Set New Password</h1>
            
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Please enter your new password below.
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="welp-input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="welp-input"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="welp-button w-full"
                  disabled={isSubmitting || !password || !confirmPassword}
                >
                  {isSubmitting ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;

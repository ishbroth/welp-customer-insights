
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsResetEmailSent(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
            <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>
            
            {isResetEmailSent ? (
              <div className="text-center">
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    A password reset link has been sent to your email address.
                    Please check your inbox and follow the instructions to reset your password.
                  </AlertDescription>
                </Alert>
                
                <p className="text-sm text-gray-600 mt-4">
                  Return to <Link to="/login" className="text-welp-primary hover:underline">Login Page</Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter the email address associated with your account, and we'll send you a link to reset your password.
                  </p>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="welp-input"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="welp-button w-full"
                    disabled={isSubmitting || !email}
                  >
                    {isSubmitting ? "Sending Reset Link..." : "Reset Password"}
                  </Button>
                  
                  <div className="text-center mt-2">
                    <Link to="/login" className="text-sm text-welp-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import PasswordSetupForm, { PasswordFormValues } from '@/components/business/PasswordSetupForm';
import SecurityInfoBox from '@/components/business/SecurityInfoBox';

const BusinessVerificationSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get data from sessionStorage if available
  const [businessData, setBusinessData] = useState(() => {
    const storedData = sessionStorage.getItem("businessVerificationData");
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  });

  // If no business data is found, redirect to signup page
  useEffect(() => {
    if (!businessData) {
      toast({
        title: "Missing business data",
        description: "Please complete business verification first.",
        variant: "destructive"
      });
      navigate('/signup?type=business');
    }
  }, [businessData, navigate, toast]);

  const handleSubmit = async (values: PasswordFormValues) => {
    if (!businessData?.email) {
      toast({
        title: "Error",
        description: "Business email is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the user account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: businessData.email,
        password: values.password,
        options: {
          data: {
            name: businessData.name,
            type: "business",
            phone: businessData.phone,
            address: businessData.address,
            city: businessData.city,
            state: businessData.state
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account Created",
        description: "Your business account has been set up successfully!",
      });
      
      // Clear the session storage
      sessionStorage.removeItem("businessVerificationData");
      
      // Log the user in with their new credentials
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: businessData.email,
        password: values.password
      });
      
      if (loginError) {
        // If login fails, redirect to login page
        navigate("/login", { 
          state: { 
            message: "Your business account has been created! Please log in with your email and password." 
          } 
        });
        return;
      }
      
      // Redirect to profile if login succeeded
      navigate("/profile");
      
    } catch (error: any) {
      console.error("Account creation error:", error);
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
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Business Verified!</h1>
            
            <p className="text-center text-gray-600 mb-6">
              Complete your account setup by creating a secure password.
            </p>

            <PasswordSetupForm 
              businessEmail={businessData?.email}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
            
            <SecurityInfoBox />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessVerificationSuccess;

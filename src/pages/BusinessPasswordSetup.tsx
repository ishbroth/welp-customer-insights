import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, ArrowRight } from "lucide-react";
import { PasswordSetupForm } from "@/components/business";
import { PasswordFormValues } from "@/schemas/passwordSchema";
import { supabase } from "@/integrations/supabase/client";

const BusinessPasswordSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get business data from location state or use empty defaults
  const businessData = location.state?.businessData || {
    name: "",
    email: "",
    phone: ""
  };

  // Function to add business to the searchable database
  const addBusinessToSearchDatabase = async (business: any) => {
    try {
      // Insert data into searchable_customers table using type assertion
      // This is a workaround until the types are updated
      const { error } = await (supabase as any)
        .from('searchable_customers')
        .insert({
          first_name: business.name.split(' ')[0] || '',
          last_name: business.name.split(' ').slice(1).join(' ') || '',
          phone: business.phone,
          email: business.email,
          is_business: true,
          business_name: business.name,
          verification_status: business.verificationStatus || 'partial'
        });
      
      if (error) {
        console.error("Error adding business to search database:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in addBusinessToSearchDatabase:", error);
      // We don't want to stop the registration process if this fails
      // But we log the error for debugging purposes
    }
  };

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
      // Create the user account with Supabase with auto-confirmation
      const { data, error } = await supabase.auth.signUp({
        email: businessData.email,
        password: values.password,
        options: {
          data: {
            name: businessData.name,
            phone: businessData.phone,
            type: "business"
          }
          // No emailRedirectTo option to make the account auto-confirmed
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Add business to searchable database
      await addBusinessToSearchDatabase(businessData);
      
      toast({
        title: "Account Created",
        description: "Your business account has been created successfully!",
      });
      
      // Try to log the user in right away
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
      } else {
        // If login succeeds, navigate to the profile page
        navigate("/profile");
      }
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
            
            <PasswordSetupForm 
              businessEmail={businessData.email}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessPasswordSetup;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from 'lucide-react';
import PasswordSetupForm, { PasswordFormValues } from '@/components/business/PasswordSetupForm';
import SecurityInfoBox from '@/components/business/SecurityInfoBox';
import { useAuth } from "@/contexts/auth";

const BusinessVerificationSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
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
      // Create the user account with mock implementation
      const { success, error } = await signup({
        email: businessData.email,
        password: values.password,
        name: businessData.name,
        type: "business",
        phone: businessData.phone,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        zipCode: businessData.zipCode
      });
      
      if (!success) {
        throw new Error(error);
      }
      
      toast({
        title: "Account Created",
        description: businessData.isFullyVerified === false
          ? "Your business account has been created with limited access. Complete verification for full access."
          : "Your business account has been set up successfully!"
      });
      
      // Clear the session storage
      sessionStorage.removeItem("businessVerificationData");
      
      // Redirect to profile
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
            
            <h1 className="text-2xl font-bold text-center mb-2">
              {businessData?.isFullyVerified === false ? "Business Partially Verified" : "Business Verified!"}
            </h1>
            
            <p className="text-center text-gray-600 mb-6">
              Complete your account setup by creating a secure password.
            </p>

            {businessData?.isFullyVerified === false && (
              <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-amber-800">Limited Access Account</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Your account will have limited functionality until your business is fully verified with a license number or EIN.
                    </p>
                    <div className="mt-2 text-sm text-amber-700">
                      <strong>You can:</strong>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Search the customer database</li>
                        <li>Purchase one-time access to view specific reviews</li>
                        <li>Subscribe to view all customer reviews</li>
                      </ul>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      You can complete full verification through your profile page after login.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

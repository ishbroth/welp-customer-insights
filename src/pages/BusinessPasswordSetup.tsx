import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordSetupForm, { PasswordFormValues } from "@/components/business/PasswordSetupForm";
import SecurityInfoBox from "@/components/business/SecurityInfoBox";
import { useToast } from "@/hooks/use-toast";
import { createSearchableCustomer } from "@/services/customerService";

const BusinessPasswordSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract data from location state
  const { businessEmail, phone, businessName, address, city, state, zipCode } = location.state as {
    businessEmail?: string;
    phone?: string;
    businessName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate account creation process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Store the password securely (in a real app, use proper encryption)
      localStorage.setItem('businessPassword', values.password);
      
      // Show success message
      toast({
        title: "Account Created",
        description: "Your business account has been successfully created!",
      });
      
      // Create a searchable customer profile (mock for now since we've disconnected from Supabase)
      const { id: searchCustomerId } = await createSearchableCustomer({
        firstName: businessName || "",
        lastName: businessName || "",
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
      });
      
      // Redirect to business verification success page
      navigate('/business-verification-success');
    } catch (error) {
      console.error("Account creation failed:", error);
      toast({
        title: "Error Creating Account",
        description: "Failed to create your business account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-white py-6 px-4 shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Set Up Your Business Account
        </h1>
      </div>
      
      <div className="container mx-auto mt-8 flex-grow flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <SecurityInfoBox />
          <PasswordSetupForm
            businessEmail={businessEmail}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateAccount}
          />
        </div>
      </div>
      
      <div className="bg-gray-200 text-center py-4 text-gray-600">
        <p className="text-sm">
          © {new Date().getFullYear()} Welp, Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default BusinessPasswordSetup;

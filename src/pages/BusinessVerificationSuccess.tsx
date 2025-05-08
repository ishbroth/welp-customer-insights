
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lock, Shield } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form schema for validation
const passwordFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

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

  // Initialize form with validation
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {businessData?.email && (
                  <div className="mb-4">
                    <FormLabel>Business Email</FormLabel>
                    <Input
                      type="email"
                      value={businessData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Create Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="welp-button w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : (
                    <>
                      <Lock className="mr-2 h-4 w-4" /> Create Account & Continue
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <div className="flex items-center text-blue-700 font-medium mb-2">
                  <Shield className="h-4 w-4 mr-2" /> Secure Account
                </div>
                <p className="text-gray-600">
                  Your password protects your business account and allows you to log in anytime
                  to manage your profile and customer reviews.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessVerificationSuccess;

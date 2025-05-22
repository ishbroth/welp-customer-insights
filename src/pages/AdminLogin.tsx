
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const ADMIN_ACCOUNTS = [
    {
      type: "Business Owner",
      email: "business@example.com",
      password: "password123"
    },
    {
      type: "Customer",
      email: "customer@example.com",
      password: "password123"
    }
  ];

  const handleLogin = async (email: string, password: string, type: string) => {
    setIsLoading(true);
    
    try {
      const { success, error } = await login(email, password);
      
      if (success) {
        toast({
          title: "Admin Login Successful",
          description: `You are now logged in as a ${type}.`,
        });
        navigate("/profile");
      } else {
        toast({
          title: "Login Failed",
          description: error || `Failed to log in as ${type}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Admin Access</h1>
            <p className="text-center mb-8 text-gray-600">
              Use these accounts to bypass registration and verification.
            </p>
            
            <div className="space-y-4">
              {ADMIN_ACCOUNTS.map((account) => (
                <div key={account.email} className="border p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{account.type} Account</h3>
                  <p className="text-sm text-gray-600 mb-1">Email: {account.email}</p>
                  <p className="text-sm text-gray-600 mb-4">Password: {account.password}</p>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleLogin(account.email, account.password, account.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : `Login as ${account.type}`}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>This page is for development purposes only.</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

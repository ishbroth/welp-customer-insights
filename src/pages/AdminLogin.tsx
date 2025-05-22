
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const VALID_ACCOUNTS = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is one of our valid test accounts
    const validAccount = VALID_ACCOUNTS.find(
      account => account.email === email && account.password === password
    );

    if (!validAccount) {
      toast({
        title: "Invalid Credentials",
        description: "Please use one of the test accounts shown below.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Instead of just calling login, we need to handle the response properly
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Admin Login Successful",
          description: `You are now logged in as a ${validAccount.type}.`,
        });
        
        // Add a delay to allow auth state to update before redirecting
        setTimeout(() => {
          navigate("/profile");
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: result.error || `Failed to log in as ${validAccount.type}.`,
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
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="welp-input"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="welp-button w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 font-semibold mb-2">Valid Test Accounts:</p>
              <div className="space-y-2">
                {VALID_ACCOUNTS.map((account) => (
                  <div key={account.email} className="text-left p-2 bg-gray-50 border rounded-md">
                    <p className="font-semibold">{account.type}</p>
                    <p className="text-gray-600">Email: {account.email}</p>
                    <p className="text-gray-600">Password: {account.password}</p>
                  </div>
                ))}
              </div>
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

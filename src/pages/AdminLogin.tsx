
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
import { User } from "@/types";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  
  // Define the permanent admin accounts created in the database
  const ADMIN_ACCOUNTS = [
    {
      type: "Business Admin",
      email: "business@example.com",
      password: "password123",
      userData: {
        id: "10000000-0000-0000-0000-000000000001",
        name: "Business Admin",
        email: "business@example.com",
        type: "business" as const,
        address: "123 Business Street",
        city: "Business City",
        state: "CA",
        zipCode: "90210",
        phone: "555-123-4567",
        isSubscribed: true
      } as User
    },
    {
      type: "Customer Admin",
      email: "customer@example.com",
      password: "password123",
      userData: {
        id: "10000000-0000-0000-0000-000000000002",
        name: "Customer Admin",
        email: "customer@example.com",
        type: "customer" as const,
        address: "456 Customer Avenue",
        city: "Customer City",
        state: "CA",
        zipCode: "90211",
        phone: "555-987-6543",
        isSubscribed: true
      } as User
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find matching admin account
    const adminAccount = ADMIN_ACCOUNTS.find(
      account => account.email === email && account.password === password
    );

    if (!adminAccount) {
      toast({
        title: "Invalid Credentials",
        description: "Please use one of the admin accounts shown below.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Set the current user directly in the auth context
      setCurrentUser(adminAccount.userData);
      
      toast({
        title: "Admin Login Successful",
        description: `You are now logged in as ${adminAccount.type}.`,
      });
      
      // Redirect to profile page
      navigate("/profile");
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
              <p className="text-gray-600 font-semibold mb-2">Permanent Admin Accounts:</p>
              <div className="space-y-2">
                {ADMIN_ACCOUNTS.map((account) => (
                  <div key={account.email} className="text-left p-2 bg-gray-50 border rounded-md">
                    <p className="font-semibold">{account.type}</p>
                    <p className="text-gray-600">Email: {account.email}</p>
                    <p className="text-gray-600">Password: {account.password}</p>
                    <p className="text-xs text-green-600">✓ Permanent Database Account</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>These are permanent admin accounts stored in the database.</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

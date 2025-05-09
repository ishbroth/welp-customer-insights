import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const ReviewSuccess = () => {
  const { currentUser } = useAuth();
  
  // Determine the home link based on user type
  const homeLink = currentUser?.type === "business" || currentUser?.type === "admin" 
    ? "/profile" 
    : "/";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Review Submitted!</h1>
            
            <p className="text-gray-600 mb-8">
              Thank you for sharing your experience with this customer. Your review helps 
              other businesses make informed decisions and strengthens our community.
            </p>
            
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/review/new">Write Another Review</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to={homeLink}>Return to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewSuccess;

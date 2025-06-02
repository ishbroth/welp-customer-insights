
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";

const Verification = () => {
  const navigate = useNavigate();
  
  const handleNavigateToSignup = () => {
    navigate('/signup?type=business');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Business Verification</h1>
            
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-16 w-16 text-welp-primary" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4 text-center">
                Why Business Verification?
              </h2>
              
              <p className="mb-6">
                Welp is specifically designed for business owners to share experiences about their customers.
                Our verification process is essential to maintaining the integrity and reliability of our platform.
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-3">
                  Our Verification Process Ensures:
                </h3>
                
                <ul className="list-disc pl-5 space-y-3">
                  <li>
                    <span className="font-medium">Only legitimate businesses</span> can submit reviews, 
                    maintaining the integrity and value of our platform.
                  </li>
                  <li>
                    <span className="font-medium">Reviews come from actual business interactions</span>, 
                    providing other business owners with reliable insights.
                  </li>
                  <li>
                    <span className="font-medium">The platform remains protected</span> from fraudulent accounts 
                    or those seeking to manipulate ratings.
                  </li>
                </ul>
                
                <p className="mt-4">
                  This verification establishes a trusted community where business owners can share genuine 
                  experiences and make informed decisions about potential clients or customers.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                How It Works
              </h3>
              
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <span className="font-medium">Sign up as a business owner</span> - 
                  Provide basic business information including your name, address, and contact details.
                </li>
                <li>
                  <span className="font-medium">Submit verification information</span> - 
                  Depending on your business type, this could include your EIN, business license number, 
                  contractor license, or other professional credentials.
                </li>
                <li>
                  <span className="font-medium">Automatic verification</span> - 
                  Our system cross-references your information with public business registries.
                </li>
                <li>
                  <span className="font-medium">Start using the platform</span> - 
                  Once verified, you can immediately begin sharing your experiences with customers and clients.
                </li>
              </ol>
            </div>
            
            <div className="text-center mb-6">
              <a 
                href="/verification-resources" 
                className="text-welp-primary hover:underline text-sm font-medium"
              >
                List of verification resources
              </a>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                Important Note
              </h3>
              
              <p>
                Unlike consumer review platforms, Welp operates on a reverse model where <span className="font-medium">businesses review customers</span>. 
                This unique approach helps businesses make informed decisions about who they choose to work with, 
                creating a more transparent and accountable marketplace for professional services.
              </p>
            </div>
            
            <div className="text-center">
              <Button onClick={handleNavigateToSignup} className="welp-button px-8 py-6 text-lg">
                Start Business Verification
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Already verified? <a href="/login" className="text-welp-primary hover:underline">Log In</a>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verification;

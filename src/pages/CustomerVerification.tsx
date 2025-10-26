
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerVerification = () => {
  const navigate = useNavigate();
  
  const handleNavigateToSignup = () => {
    navigate('/signup?type=customer');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Customer Accounts</h1>

            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-16 w-16 text-welp-primary" />
              </div>

              <h2 className="text-xl font-semibold mb-4 text-center">
                Find and Manage Reviews About You
              </h2>

              <p className="mb-6">
                Businesses on Welp can review their customers. Customer accounts let you find these reviews,
                respond professionally, and build a positive reputation.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-3">
                  What You Can Do:
                </h3>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Search for reviews about you</span> using your contact information
                  </li>
                  <li>
                    <span className="font-medium">Subscribe or buy credits</span> to unlock and respond to reviews
                  </li>
                  <li>
                    <span className="font-medium">Build your reputation</span> with professional responses
                  </li>
                  <li>
                    <span className="font-medium">Get notified</span> when businesses review you
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                How It Works
              </h3>

              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <span className="font-medium">Create your account</span> -
                  Sign up with your name, email, phone, and address
                </li>
                <li>
                  <span className="font-medium">Find reviews about you</span> -
                  Search using your contact information to see what businesses have written
                </li>
                <li>
                  <span className="font-medium">Unlock and respond</span> -
                  Subscribe or use credits to view full reviews and post responses
                </li>
              </ol>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                How Welp Works
              </h3>

              <p>
                Unlike traditional review sites, <span className="font-medium">businesses review customers</span> on Welp.
                Customer accounts are free and give you the tools to manage your reputation and respond to reviews.
              </p>
            </div>
            
            <div className="text-center">
              <Button onClick={handleNavigateToSignup} className="welp-button px-8 py-6 text-lg">
                Create a Customer Account
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Already have an account? <a href="/login" className="text-welp-primary hover:underline">Log In</a>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerVerification;

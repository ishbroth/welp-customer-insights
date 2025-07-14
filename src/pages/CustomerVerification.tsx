
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
            <h1 className="text-3xl font-bold mb-6 text-center">Customer Account Verification</h1>
            
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-16 w-16 text-welp-primary" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4 text-center">
                Why Customer Verification?
              </h2>
              
              <p className="mb-6">
                Welp allows business owners to share their experiences about customers, and for customers to manage their reputation.
                Our verification process ensures that all users on the platform are genuine and helps build trust in the Welp ecosystem.
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-3">
                  Automatic Customer Verification:
                </h3>
                
                <ul className="list-disc pl-5 space-y-3">
                  <li>
                    <span className="font-medium">Manage your reputation</span> - subscribe or buy credits to respond to reviews about you.
                  </li>
                  <li>
                    <span className="font-medium">Dispute inaccurate information</span> to maintain your reputation integrity.
                  </li>
                  <li>
                    <span className="font-medium">Build a positive history</span> that can help in future interactions with businesses.
                  </li>
                  <li>
                    <span className="font-medium">Receive notifications</span> when businesses review your interactions.
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                How It Works
              </h3>
              
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <span className="font-medium">Sign up as a customer</span> - 
                  Provide your basic information including your name and contact details.
                </li>
                <li>
                  <span className="font-medium">Verify your identity</span> - 
                  We use a secure verification process to confirm you are a real person. You will automatically receive a verified badge for your customer account after successful phone verification.
                </li>
                <li>
                  <span className="font-medium">Create your profile</span> - 
                  Set up your profile to best represent yourself to businesses.
                </li>
                <li>
                  <span className="font-medium">Manage your reputation</span> - 
                  Respond to reviews and build a positive history with businesses.
                </li>
              </ol>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                Important Note
              </h3>
              
              <p>
                Welp operates on a reverse model where <span className="font-medium">businesses review customers</span>. 
                Having a verified customer account allows you to participate in this ecosystem, 
                subscribe or buy credits to respond to reviews about you, and build a positive reputation that can benefit you 
                in future business interactions.
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

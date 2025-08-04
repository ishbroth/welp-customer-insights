
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserRound, Building2 } from "lucide-react";
import BusinessSignupForm from "@/components/signup/BusinessSignupForm";
import CustomerSignupForm from "@/components/signup/CustomerSignupForm";
import UnlockExplanationBanner from "@/components/signup/UnlockExplanationBanner";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialAccountType = searchParams.get("type") === "customer" ? "customer" : "business";
  const isUnlockFlow = searchParams.get("unlock") === "review";
  const [accountType, setAccountType] = useState<"business" | "customer">(initialAccountType);
  const [step, setStep] = useState(1); // Always start at step 1 now
  
  useEffect(() => {
    // Always reset to step 1 when account type changes (simplified flow)
    setStep(1);
  }, [accountType]);

  useEffect(() => {
    // Scroll to top when page loads, especially important for unlock flow
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          <Card className="max-w-2xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">Create Your Welp. Account</h1>
            
            {/* Show unlock explanation banner if coming from review unlock */}
            {isUnlockFlow && <UnlockExplanationBanner />}
            
            <Tabs 
              defaultValue={initialAccountType} 
              onValueChange={(value) => setAccountType(value as "business" | "customer")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="business" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                  <Building2 className="mr-2 h-4 w-4" /> Business Owner
                </TabsTrigger>
                <TabsTrigger value="customer" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                  <UserRound className="mr-2 h-4 w-4" /> Customer
                </TabsTrigger>
              </TabsList>
              
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  Already have an account? <Link to="/login" className="text-welp-primary hover:underline">Log In</Link>
                </p>
              </div>
              
              <TabsContent value="business">
                <BusinessSignupForm step={step} setStep={setStep} />
              </TabsContent>
              
              <TabsContent value="customer">
                <CustomerSignupForm />
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-welp-primary hover:underline">Log In</Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;

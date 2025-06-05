
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SearchBox from "@/components/SearchBox";
import { UserRound, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

const TabsSection = () => {
  const [accountType, setAccountType] = useState<"customer" | "business">("business");
  const { currentUser } = useAuth();

  const handleLoggedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Already logged in",
      description: "You are already signed in to your account.",
    });
  };

  return (
    <section className="py-16 bg-welp-bg-light">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Tabs 
            defaultValue="business" 
            onValueChange={(value) => setAccountType(value as "customer" | "business")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="business" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                <Building2 className="mr-2 h-4 w-4" /> I'm a Business Owner
              </TabsTrigger>
              <TabsTrigger value="customer" className="data-[state=active]:bg-welp-primary data-[state=active]:text-white">
                <UserRound className="mr-2 h-4 w-4" /> I'm a Customer
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="business">
              <div className="welp-card">
                <h2 className="text-2xl font-bold mb-4 text-center">Business Owner Portal</h2>
                <p className="text-center mb-6">
                  Rate and review your customers, access our customer database, and make informed business decisions.
                </p>
                <p className="text-center mb-6">
                  Help build a supportive community of business owners by highlighting standout customers. Rate your customers 1 to 5 stars and detail your interaction with them. Search for customers before you do business with them and gain valuable insights from other businesses' experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {currentUser ? (
                    <>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full border-gray-300 text-gray-400 cursor-not-allowed"
                              onClick={handleLoggedInClick}
                              disabled
                            >
                              Login
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
                          <p>You are already signed in to your account</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              className="bg-gray-400 text-gray-600 cursor-not-allowed w-full"
                              onClick={handleLoggedInClick}
                              disabled
                            >
                              Sign Up as Business
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
                          <p>You are already signed in to your account</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup?type=business" className="flex-1">
                        <Button className="welp-button w-full">Sign Up as Business</Button>
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="mt-12 border-t pt-8">
                  <SearchBox simplified className="max-w-md mx-auto" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customer">
              <div className="welp-card">
                <h2 className="text-2xl font-bold mb-4 text-center">Customer Portal</h2>
                <p className="text-center mb-6">
                  View and respond to reviews about you from businesses you've interacted with.
                </p>
                <p className="text-center mb-6">
                  Keep on top of your reputation, and stand out as a preferred customer. Sign up or login to view reviews about you and respond to business owners.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {currentUser ? (
                    <>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full border-gray-300 text-gray-400 cursor-not-allowed"
                              onClick={handleLoggedInClick}
                              disabled
                            >
                              Login
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
                          <p>You are already signed in to your account</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              className="bg-gray-400 text-gray-600 cursor-not-allowed w-full"
                              onClick={handleLoggedInClick}
                              disabled
                            >
                              Sign Up as Customer
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
                          <p>You are already signed in to your account</p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup?type=customer" className="flex-1">
                        <Button className="welp-button w-full">Sign Up as Customer</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default TabsSection;

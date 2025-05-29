
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import { UserRound, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

const Index = () => {
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
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-[#ea384c] text-white py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Welp.</h1>
                <p className="text-xl md:text-2xl mb-8">Review your customers. Because businesses are people too.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {currentUser ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          className="bg-gray-400 text-gray-600 cursor-not-allowed font-bold py-3 px-6 rounded-full"
                          onClick={handleLoggedInClick}
                          disabled
                        >
                          Get Started
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You are already signed in to your account</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link to="/signup">
                      <Button className="bg-white text-[#ea384c] hover:bg-gray-100 font-bold py-3 px-6 rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  )}
                  <Link to="/about">
                    <Button variant="outline" className="border-white text-[#ea384c] hover:bg-white/10 hover:text-white font-bold py-3 px-6 rounded-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Search Section */}
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full border-gray-300 text-gray-400 cursor-not-allowed"
                                  onClick={handleLoggedInClick}
                                  disabled
                                >
                                  Login
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You are already signed in to your account</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  className="bg-gray-400 text-gray-600 cursor-not-allowed w-full"
                                  onClick={handleLoggedInClick}
                                  disabled
                                >
                                  Sign Up as Business
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
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
                      
                      <div className="mt-8 border-t pt-6">
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full border-gray-300 text-gray-400 cursor-not-allowed"
                                  onClick={handleLoggedInClick}
                                  disabled
                                >
                                  Login
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>You are already signed in to your account</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  className="bg-gray-400 text-gray-600 cursor-not-allowed w-full"
                                  onClick={handleLoggedInClick}
                                  disabled
                                >
                                  Sign Up as Customer
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
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

          {/* Features Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">How Welp. Works</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="welp-card text-center">
                  <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold mb-3">Create an Account</h3>
                  <p className="text-gray-600">
                    Sign up as a business owner or customer and verify your identity.
                  </p>
                </div>
                
                <div className="welp-card text-center">
                  <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold mb-3">Rate & Review</h3>
                  <p className="text-gray-600">
                    Business owners can rate customers and write detailed reviews about their experiences.
                  </p>
                </div>
                
                <div className="welp-card text-center">
                  <div className="w-16 h-16 mb-6 mx-auto rounded-full welp-gradient flex items-center justify-center text-white text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold mb-3">Access Insights</h3>
                  <p className="text-gray-600">
                    Subscribe to access the full database of customer reviews from other businesses.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-welp-bg-light">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">What Business Owners Say</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="welp-card">
                  <div className="mb-4 text-welp-primary">"</div>
                  <p className="mb-4 text-gray-700">
                    Welp. has transformed how I choose clients. Now I can see which customers are worth taking on and which ones to avoid. It's saved me thousands in potential losses.
                  </p>
                  <div className="font-bold">John D.</div>
                  <div className="text-sm text-gray-500">Plumber, Portland OR</div>
                </div>
                
                <div className="welp-card">
                  <div className="mb-4 text-welp-primary">"</div>
                  <p className="mb-4 text-gray-700">
                    Before Welp., I had no way to warn other businesses about problem customers. Now we have a community that shares valuable insights to protect each other.
                  </p>
                  <div className="font-bold">Sarah M.</div>
                  <div className="text-sm text-gray-500">Restaurant Owner, Chicago IL</div>
                </div>
                
                <div className="welp-card">
                  <div className="mb-4 text-welp-primary">"</div>
                  <p className="mb-4 text-gray-700">
                    I used to waste time with clients who never intended to pay. Thanks to Welp., I can now screen potential clients and focus on those who value my services.
                  </p>
                  <div className="font-bold">Michael T.</div>
                  <div className="text-sm text-gray-500">Lawyer, Austin TX</div>
                </div>
              </div>
              
              <div className="text-center mt-10">
                <Link to="/testimonials">
                  <Button variant="outline" className="border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
                    Read More Success Stories
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 welp-gradient text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to take control?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of business owners who use Welp. to make informed decisions about their customers.
              </p>
              {currentUser ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="bg-gray-400 text-gray-600 cursor-not-allowed font-bold py-3 px-8 rounded-full text-lg"
                      onClick={handleLoggedInClick}
                      disabled
                    >
                      Get Started Today
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You are already signed in to your account</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link to="/signup">
                  <Button className="bg-white text-welp-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg">
                    Get Started Today
                  </Button>
                </Link>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Index;

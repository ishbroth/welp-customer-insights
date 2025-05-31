
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  UserRound, 
  Building2, 
  Search, 
  Star, 
  MessageSquare, 
  DollarSign, 
  CreditCard 
} from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#ea384c] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">How Welp. Works</h1>
              <p className="text-xl mb-8">
                Your comprehensive guide to using the Welp. platform for business owners and customers.
              </p>
            </div>
          </div>
        </section>

        {/* Account Types Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Account Types</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Business Owner Account */}
                <div className="welp-card p-8 border-t-4 border-[#ea384c]">
                  <div className="flex items-center mb-4">
                    <Building2 className="h-8 w-8 text-[#ea384c] mr-3" />
                    <h3 className="text-2xl font-bold">Business Owner Account</h3>
                  </div>
                  <ul className="space-y-4 mb-6">
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Write reviews about customers</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Search the customer database</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Rate customers with star ratings</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Pay a one-time access fee to view reviews</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Subscribe for unlimited access to reviews</span>
                    </li>
                  </ul>
                  <Link to="/signup?type=business">
                    <Button className="welp-button w-full">
                      Sign Up as Business
                    </Button>
                  </Link>
                </div>
                
                {/* Customer Account */}
                <div className="welp-card p-8 border-t-4 border-blue-500">
                  <div className="flex items-center mb-4">
                    <UserRound className="h-8 w-8 text-blue-500 mr-3" />
                    <h3 className="text-2xl font-bold">Customer Account</h3>
                  </div>
                  <ul className="space-y-4 mb-6">
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Find reviews about you</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Purchase access to full reviews</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Respond to business reviews</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Monitor your customer reputation</span>
                    </li>
                    <li className="flex">
                      <span className="font-semibold mr-2">•</span>
                      <span>Improve your standing with businesses</span>
                    </li>
                  </ul>
                  <Link to="/signup?type=customer">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Sign Up as Customer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sign Up & Login Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">How to Sign Up</h2>
              
              <div className="space-y-12">
                <div className="welp-card">
                  <h3 className="text-xl font-bold mb-4">Creating Your Account</h3>
                  <p className="mb-4">
                    Getting started with Welp. is simple. Choose whether you're a business owner or customer, 
                    then fill out our quick registration form with your email and create a password.
                  </p>
                  <ol className="list-decimal ml-5 space-y-3 mb-4">
                    <li>Click "Sign Up" from the homepage or navigation menu</li>
                    <li>Select your account type: Business Owner or Customer</li>
                    <li>Choose your email and password</li>
                    <li>Fill out your profile with as much of your information as possible</li>
                    <li>Verify your account through text, and start using Welp. immediately</li>
                  </ol>
                  <p className="mt-4">
                    For business accounts, please enter any license information for your business to expedite business verification.
                  </p>
                </div>

                <div className="welp-card">
                  <h3 className="text-xl font-bold mb-4">Account Verification</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2">For Business Owners</h4>
                      <p>
                        To maintain the integrity of our platform, business accounts require verification. 
                        You'll need to provide your business name, location, and contact information. 
                        Please provide any license number you may have for your business, this helps expedite the verification process.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">For Customers</h4>
                      <p>
                        Customer accounts are verified through text confirmation. 
                        We recommend adding your phone number and address to help 
                        businesses locate reviews about you when you search.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Search & Find Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-12">
                <Search className="h-8 w-8 text-[#ea384c] mr-3" />
                <h2 className="text-3xl font-bold">Searching For Customers</h2>
              </div>
              
              <div className="welp-card mb-8">
                <h3 className="text-xl font-bold mb-4">How Customer Search Works</h3>
                <p className="mb-4">
                  Our powerful search system helps business owners find information about potential or past customers.
                  Customers can also use search to find reviews written about them.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-bold mb-2">Search Parameters</h4>
                  <p className="mb-3">You can search using any combination of:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-semibold">Name:</span> First and/or last name</li>
                    <li><span className="font-semibold">Phone Number:</span> Any phone number associated with the customer</li>
                    <li><span className="font-semibold">Address:</span> Street address, city, or ZIP code</li>
                  </ul>
                </div>
                
                <p>
                  The more information you provide, the more accurate your search results will be. 
                  Our system matches across multiple data points to return the most relevant results.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="welp-card">
                  <h4 className="font-bold mb-3">For Business Owners</h4>
                  <p className="mb-3">
                    When searching as a business owner, you'll see basic information about customers 
                    that match your search criteria. For full review content, you can either:
                  </p>
                  <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>Pay per review to access specific reviews</li>
                    <li>Subscribe for unlimited access to all reviews</li>
                  </ul>
                  <p>
                    This information helps you make informed decisions about who to do business with.
                  </p>
                </div>
                
                <div className="welp-card">
                  <h4 className="font-bold mb-3">For Customers</h4>
                  <p className="mb-4">
                    As a customer, you can search for yourself to see what businesses are saying about you.
                  </p>
                  <p>
                    You'll be able to view basic information about the businesses that reviewed you, and you will be able to purchase access to individual reviews or subscribe for unlimited access to all reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reviews Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-12">
                <Star className="h-8 w-8 text-[#ea384c] mr-3" />
                <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* For Business Owners */}
                <div className="welp-card">
                  <h3 className="text-xl font-bold mb-4">For Business Owners</h3>
                  <h4 className="font-bold text-lg mb-2">Writing Reviews</h4>
                  <ol className="list-decimal ml-5 space-y-3 mb-6">
                    <li>Log in to your business account</li>
                    <li>Click "Write a Review" from your dashboard</li>
                    <li>Enter customer information (name, contact details)</li>
                    <li>Select a star rating (1-5 stars)</li>
                    <li>Write a detailed review of your experience</li>
                    <li>Submit your review</li>
                  </ol>
                  <p className="mb-4">
                    Your review will be published and available in the customer database.
                    Other business owners can see the first sentence for free, with full access
                    available through our payment options.
                  </p>
                  <Link to="/login">
                    <Button className="welp-button">
                      Write a Review
                    </Button>
                  </Link>
                </div>
                
                {/* For Customers */}
                <div className="welp-card">
                  <h3 className="text-xl font-bold mb-4">For Customers</h3>
                  <h4 className="font-bold text-lg mb-2">Responding to Reviews</h4>
                  <ol className="list-decimal ml-5 space-y-3 mb-6">
                    <li>Log in to your customer account</li>
                    <li>Navigate to "My Reviews" in your profile</li>
                    <li>Purchase access to the full review for $3</li>
                    <li>Read the complete review content</li>
                    <li>Click "Respond" to share your perspective</li>
                    <li>Write your response to the business owner</li>
                    <li>Submit your response</li>
                  </ol>
                  <p className="mb-4">
                    Your response will be attached to the original review, providing context
                    and your side of the story to other businesses who view your customer profile.
                  </p>
                  <Link to="/profile/reviews">
                    <Button className="welp-button">
                      View My Reviews
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="welp-card">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 text-[#ea384c] mr-2" />
                  <h3 className="text-xl font-bold">Review Guidelines</h3>
                </div>
                <p className="mb-4">
                  To maintain the quality and fairness of our platform, we ask all users to follow these guidelines:
                </p>
                <ul className="list-disc ml-5 space-y-3">
                  <li>
                    <span className="font-semibold">Be honest and accurate:</span> Reviews should reflect genuine experiences.
                  </li>
                  <li>
                    <span className="font-semibold">Be specific:</span> Include details about your interaction with the customer.
                  </li>
                  <li>
                    <span className="font-semibold">Be respectful:</span> No hate speech, personal attacks, or discriminatory language.
                  </li>
                  <li>
                    <span className="font-semibold">No private information:</span> Don't share private details beyond what's necessary.
                  </li>
                  <li>
                    <span className="font-semibold">No promotional content:</span> Reviews shouldn't promote or advertise services.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-12">
                <DollarSign className="h-8 w-8 text-[#ea384c] mr-3" />
                <h2 className="text-3xl font-bold">Pricing Options</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Pay Per Review Option */}
                <div className="welp-card p-6 border-t-4 border-gray-400">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">Pay Per Review</h3>
                    <div className="text-3xl font-bold mt-4">$3<span className="text-base font-normal">/review</span></div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <p className="font-semibold text-center">Available for:</p>
                    <p className="text-center flex items-center justify-center">
                      <UserRound className="h-4 w-4 mr-1" /> Customers
                    </p>
                    <p className="text-center flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-1" /> Business Owners
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div>
                      <p className="font-semibold mb-1">For Customers:</p>
                      <p className="text-sm">
                        Access the full content of reviews written about you and post responses.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">For Business Owners:</p>
                      <p className="text-sm">
                        Access the full content of specific reviews about potential customers.
                      </p>
                    </div>
                  </div>
                  
                  <Button className="welp-button w-full flex items-center justify-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy Credits
                  </Button>
                </div>
                
                {/* Subscription Option - Combined for both types of users */}
                <div className="welp-card p-6 border-t-4 border-[#ea384c] shadow-lg scale-105 z-10 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#ea384c] text-white px-4 py-1 rounded-full text-sm font-bold">
                    BEST VALUE
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">Subscription</h3>
                    <div className="text-3xl font-bold mt-4">$11.99<span className="text-base font-normal">/month</span></div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <p className="font-semibold text-center">Available for:</p>
                    <p className="text-center flex items-center justify-center">
                      <UserRound className="h-4 w-4 mr-1" /> Customers
                    </p>
                    <p className="text-center flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-1" /> Business Owners
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <p className="font-semibold">Unlimited access to:</p>
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      <li>Full review content for all customers/businesses</li>
                      <li>Unlimited responses to reviews</li>
                      <li>Verified badge on your profile</li>
                      <li>Advanced search filters and tools</li>
                      <li>Enhanced profile customization</li>
                      <li>Priority customer support</li>
                    </ul>
                  </div>
                  
                  <Link to="/subscription">
                    <Button className="welp-button w-full">
                      Subscribe Now
                    </Button>
                  </Link>
                </div>
                
                {/* Free Option */}
                <div className="welp-card p-6 border-t-4 border-gray-300">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">Free Features</h3>
                    <div className="text-3xl font-bold mt-4">$0</div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <p className="font-semibold text-center">Available for:</p>
                    <p className="text-center flex items-center justify-center">
                      <UserRound className="h-4 w-4 mr-1" /> Customers
                    </p>
                    <p className="text-center flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-1" /> Business Owners
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <p className="font-semibold">What's included:</p>
                    <ul className="list-disc ml-5 space-y-2 text-sm">
                      <li>Write customer reviews (business owners)</li>
                      <li>View star ratings for customers</li>
                      <li>See the first sentence of each review</li>
                      <li>Basic search functionality</li>
                      <li>Create and manage your profile</li>
                    </ul>
                  </div>
                  
                  <Link to="/signup">
                    <Button variant="outline" className="w-full border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c] hover:text-white">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="welp-card text-center">
                <div className="flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-[#ea384c] mr-2" />
                  <h3 className="text-xl font-bold">Secure Payment Processing</h3>
                </div>
                <p className="mb-4">
                  All payments are securely processed through our payment provider. 
                  We accept all major credit cards, debit cards, Apple Pay, and Google Pay.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-gray-100 px-4 py-2 rounded">Visa</div>
                  <div className="bg-gray-100 px-4 py-2 rounded">Mastercard</div>
                  <div className="bg-gray-100 px-4 py-2 rounded">American Express</div>
                  <div className="bg-gray-100 px-4 py-2 rounded">Discover</div>
                  <div className="bg-gray-100 px-4 py-2 rounded">Apple Pay</div>
                  <div className="bg-gray-100 px-4 py-2 rounded">Google Pay</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 welp-gradient text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of businesses and customers who use Welp. to make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button className="bg-white text-[#ea384c] hover:bg-gray-100 font-bold py-3 px-8 rounded-full">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-white text-[#ea384c] hover:bg-white/20 hover:text-white font-bold py-3 px-8 rounded-full">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;

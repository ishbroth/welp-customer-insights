
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, UserRound, Building2 } from "lucide-react";

const PricingSection = () => {
  return (
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
  );
};

export default PricingSection;

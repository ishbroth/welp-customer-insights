
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface SubscriptionPlanProps {
  type: "customer" | "business";
  isProcessing: boolean;
  handleSubscribe: () => void;
}

const CustomerSubscriptionPlans = ({ isProcessing, handleSubscribe }: Omit<SubscriptionPlanProps, "type">) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <Card className="p-6 border-2">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Basic</h2>
          <div className="text-3xl font-bold mt-4">Free</div>
          <div className="text-sm text-gray-500">Limited Features</div>
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>View basic information about your reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Pay one-time fees to access specific reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>One response per paid review</span>
          </li>
          <li className="flex items-start">
            <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <span className="text-gray-500">Unlimited access to reviews</span>
          </li>
          <li className="flex items-start">
            <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <span className="text-gray-500">Unlimited responses to businesses</span>
          </li>
        </ul>
        
        <div className="text-center">
          <Link to="/profile/reviews">
            <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
              Current Plan
            </Button>
          </Link>
        </div>
      </Card>
      
      {/* Premium Plan */}
      <Card className="p-6 border-2 border-welp-primary relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-sm font-bold">
          RECOMMENDED
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Premium</h2>
          <div className="text-3xl font-bold mt-4">$11.99<span className="text-base font-normal">/month</span></div>
          <div className="text-sm text-gray-500">Full Access</div>
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Full access to all reviews about you</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Unlimited responses to business reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Ongoing conversation with businesses</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>No additional fees per review</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Priority customer support</span>
          </li>
        </ul>
        
        <Button 
          onClick={handleSubscribe}
          className="welp-button w-full"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </Card>
    </div>
  );
};

const BusinessSubscriptionPlans = ({ isProcessing, handleSubscribe }: Omit<SubscriptionPlanProps, "type">) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <Card className="p-6 border-2">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Basic</h2>
          <div className="text-3xl font-bold mt-4">Free</div>
          <div className="text-sm text-gray-500">Limited Features</div>
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Write and publish customer reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Basic search functionality</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>View customer star ratings</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Pay fees to access full reviews</span>
          </li>
          <li className="flex items-start">
            <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <span className="text-gray-500">Unlimited access to full review content</span>
          </li>
        </ul>
        
        <div className="text-center">
          <Link to="/signup?type=business">
            <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
              Current Plan
            </Button>
          </Link>
        </div>
      </Card>
      
      {/* Premium Plan */}
      <Card className="p-6 border-2 border-welp-primary relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-welp-primary text-white px-4 py-1 rounded-full text-sm font-bold">
          RECOMMENDED
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Premium</h2>
          <div className="text-3xl font-bold mt-4">$11.99<span className="text-base font-normal">/month</span></div>
          <div className="text-sm text-gray-500">Full Access</div>
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Full access to all customer reviews</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Advanced search functionality with filters</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Customer history and insights</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Priority customer support</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Respond to your customer's responses</span>
          </li>
        </ul>
        
        <Button 
          onClick={handleSubscribe}
          className="welp-button w-full"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </Card>
    </div>
  );
};

export const SubscriptionPlans = ({ type, isProcessing, handleSubscribe }: SubscriptionPlanProps) => {
  return type === "customer" 
    ? <CustomerSubscriptionPlans isProcessing={isProcessing} handleSubscribe={handleSubscribe} />
    : <BusinessSubscriptionPlans isProcessing={isProcessing} handleSubscribe={handleSubscribe} />;
};

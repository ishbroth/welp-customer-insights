import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { logger } from "@/utils/logger";

interface SubscriptionPlanProps {
  type: "customer" | "business";
  isProcessing: boolean;
  handleSubscribe: () => void;
  handleLegacySubscribe: () => void;
  creditBalance?: number;
}

const CustomerSubscriptionPlans = ({ isProcessing, handleSubscribe, handleLegacySubscribe, creditBalance = 0 }: Omit<SubscriptionPlanProps, "type">) => {
  const componentLogger = logger.withContext('CustomerSubscriptionPlans');

  const handlePremiumClick = () => {
    componentLogger.debug("Premium button clicked! isProcessing:", isProcessing);
    handleSubscribe();
  };

  const handleLegacyClick = () => {
    componentLogger.debug("Legacy button clicked! isProcessing:", isProcessing);
    handleLegacySubscribe();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
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
        </ul>
        
        <div className="text-center mb-4">
          <Link to="/profile/reviews">
            <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
              Current Plan
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <Link to="/buy-credits">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              Buy Credits ($3 each)
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
          {creditBalance > 0 ? (
            <div>
              <div className="text-lg line-through text-gray-400">$11.99</div>
              <div className="text-3xl font-bold text-green-600">
                {creditBalance * 3 >= 11.99 ? "FREE" : `$${(11.99 - creditBalance * 3).toFixed(2)}`}
                <span className="text-base font-normal">/month</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Credits applied: ${creditBalance * 3} discount
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mt-4">$11.99<span className="text-base font-normal">/month</span></div>
              <div className="text-sm text-gray-500">Full Access</div>
            </div>
          )}
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
          onClick={handlePremiumClick}
          className="welp-button w-full"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </Card>

      {/* Legacy Plan */}
      <Card className="p-6 border-2 border-yellow-500 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star className="h-3 w-3" />
          LIFETIME
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Legacy</h2>
          {creditBalance > 0 ? (
            <div>
              <div className="text-lg line-through text-gray-400">$250</div>
              <div className="text-3xl font-bold text-green-600">
                ${Math.max(0, 250 - creditBalance * 3)}<span className="text-base font-normal"> once</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Credits applied: ${Math.min(creditBalance * 3, 250)} discount
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mt-4">$250<span className="text-base font-normal"> once</span></div>
              <div className="text-sm text-gray-500">Lifetime Access</div>
            </div>
          )}
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Everything in Premium</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Lifetime access - no recurring fees</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Grandfathered into all future features</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>VIP customer support</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Save $144+ per year vs Premium</span>
          </li>
        </ul>
        
        <Button 
          onClick={handleLegacyClick}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Get Lifetime Access"}
        </Button>
      </Card>
    </div>
  );
};

const BusinessSubscriptionPlans = ({ isProcessing, handleSubscribe, handleLegacySubscribe, creditBalance = 0 }: Omit<SubscriptionPlanProps, "type">) => {
  const componentLogger = logger.withContext('BusinessSubscriptionPlans');

  const handlePremiumClick = () => {
    componentLogger.debug("Premium button clicked! isProcessing:", isProcessing);
    handleSubscribe();
  };

  const handleLegacyClick = () => {
    componentLogger.debug("Legacy button clicked! isProcessing:", isProcessing);
    handleLegacySubscribe();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
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
        
        <div className="text-center mb-4">
          <Link to="/signup?type=business">
            <Button variant="outline" className="w-full border-welp-primary text-welp-primary hover:bg-welp-primary hover:text-white">
              Current Plan
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <Link to="/buy-credits">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              Buy Credits ($3 each)
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
          {creditBalance > 0 ? (
            <div>
              <div className="text-lg line-through text-gray-400">$11.99</div>
              <div className="text-3xl font-bold text-green-600">
                {creditBalance * 3 >= 11.99 ? "FREE" : `$${(11.99 - creditBalance * 3).toFixed(2)}`}
                <span className="text-base font-normal">/month</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Credits applied: ${creditBalance * 3} discount
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mt-4">$11.99<span className="text-base font-normal">/month</span></div>
              <div className="text-sm text-gray-500">Full Access</div>
            </div>
          )}
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
          onClick={handlePremiumClick}
          className="welp-button w-full"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </Card>

      {/* Legacy Plan */}
      <Card className="p-6 border-2 border-yellow-500 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star className="h-3 w-3" />
          LIFETIME
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Legacy</h2>
          {creditBalance > 0 ? (
            <div>
              <div className="text-lg line-through text-gray-400">$250</div>
              <div className="text-3xl font-bold text-green-600">
                ${Math.max(0, 250 - creditBalance * 3)}<span className="text-base font-normal"> once</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Credits applied: ${Math.min(creditBalance * 3, 250)} discount
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold mt-4">$250<span className="text-base font-normal"> once</span></div>
              <div className="text-sm text-gray-500">Lifetime Access</div>
            </div>
          )}
        </div>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Everything in Premium</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Lifetime access - no recurring fees</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Grandfathered into all future features</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>VIP customer support</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Save $144+ per year vs Premium</span>
          </li>
        </ul>
        
        <Button 
          onClick={handleLegacyClick}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Get Lifetime Access"}
        </Button>
      </Card>
    </div>
  );
};

export const SubscriptionPlans = ({ type, isProcessing, handleSubscribe, handleLegacySubscribe, creditBalance }: SubscriptionPlanProps) => {
  return type === "customer" 
    ? <CustomerSubscriptionPlans isProcessing={isProcessing} handleSubscribe={handleSubscribe} handleLegacySubscribe={handleLegacySubscribe} creditBalance={creditBalance} />
    : <BusinessSubscriptionPlans isProcessing={isProcessing} handleSubscribe={handleSubscribe} handleLegacySubscribe={handleLegacySubscribe} creditBalance={creditBalance} />;
};

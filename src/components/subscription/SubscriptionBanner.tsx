
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SubscriptionBannerProps {
  type: "customer" | "business";
}

const SubscriptionBanner = ({ type }: SubscriptionBannerProps) => {
  const isCustomer = type === "customer";

  return (
    <Card 
      className={`mb-6 bg-gradient-to-r ${
        isCustomer 
          ? "from-blue-50 to-indigo-50 border border-blue-200" 
          : "from-amber-50 to-yellow-50 border border-amber-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${isCustomer ? "text-blue-800" : "text-amber-800"}`}>
              {isCustomer ? "Unlock Premium Features" : "Upgrade to Premium"}
            </h3>
            <p className={`text-sm ${isCustomer ? "text-blue-700" : "text-amber-700"}`}>
              {isCustomer 
                ? "Subscribe to respond to business reviews and access all content instantly."
                : "Subscribe to respond to customer feedback and access all reviews."
              }
            </p>
          </div>
          <Button className="mt-3 md:mt-0" asChild>
            <Link to="/subscription">View Plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserRound, Building2 } from "lucide-react";

const AccountTypesSection = () => {
  return (
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
  );
};

export default AccountTypesSection;

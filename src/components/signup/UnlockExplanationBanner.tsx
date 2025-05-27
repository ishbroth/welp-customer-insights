
import { Card } from "@/components/ui/card";
import { Lock, Star, CreditCard } from "lucide-react";

const UnlockExplanationBanner = () => {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-welp-primary/5 to-blue-50 border-welp-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-welp-primary/10 rounded-lg">
          <Lock className="h-5 w-5 text-welp-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Unlock Full Review Access</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sign-up, then pick a payment option to unlock reviews.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <CreditCard className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">One-time access</div>
                <div className="text-gray-500">Pay $3 to unlock this review</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Star className="h-4 w-4 text-welp-primary" />
              <div>
                <div className="font-medium text-gray-900">Full subscription</div>
                <div className="text-gray-500">Access all reviews & features</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UnlockExplanationBanner;

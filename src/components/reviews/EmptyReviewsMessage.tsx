
import { Card } from "@/components/ui/card";

interface EmptyReviewsMessageProps {
  type: "customer" | "business";
}

const EmptyReviewsMessage = ({ type }: EmptyReviewsMessageProps) => {
  const isCustomer = type === "customer";

  return (
    <Card className="p-6 text-center">
      <p className="text-gray-500 mb-4">
        {isCustomer 
          ? "No businesses have reviewed you yet." 
          : "You haven't written any customer reviews yet."
        }
      </p>
      <p className="text-sm text-gray-600 mb-4">
        {isCustomer
          ? "Reviews from businesses you've worked with will appear here once they're submitted."
          : "Start reviewing your customers to build trust in the community."
        }
      </p>
      {isCustomer && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">Reviews may be linked to you by:</p>
          <ul className="text-left">
            <li>• Your name as entered by the business</li>
            <li>• Your phone number or address</li>
            <li>• Your account information</li>
          </ul>
        </div>
      )}
    </Card>
  );
};

export default EmptyReviewsMessage;

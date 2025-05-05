
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
      <p className="text-sm text-gray-600">
        {isCustomer
          ? "As you interact with more businesses on our platform, reviews will appear here."
          : "Start reviewing your customers to build trust in the community."
        }
      </p>
    </Card>
  );
};

export default EmptyReviewsMessage;

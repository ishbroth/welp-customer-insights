
import React from "react";
import { AlertTriangle } from "lucide-react";

const SelfReviewWarning: React.FC = () => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="font-medium text-red-800">Self-Review Not Allowed</h3>
          <p className="text-sm text-red-700 mt-1">
            The phone number you entered matches your business account. You cannot write reviews for yourself.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelfReviewWarning;

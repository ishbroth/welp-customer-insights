
import { Shield } from 'lucide-react';

const SecurityInfoBox = () => {
  return (
    <div className="mt-6">
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <div className="flex items-center text-blue-700 font-medium mb-2">
          <Shield className="h-4 w-4 mr-2" /> Secure Account
        </div>
        <p className="text-gray-600">
          Your password protects your business account and allows you to log in anytime
          to manage your profile and customer reviews.
        </p>
      </div>
    </div>
  );
};

export default SecurityInfoBox;

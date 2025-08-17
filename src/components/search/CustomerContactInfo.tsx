
import { MapPin } from "lucide-react";

interface CustomerContactInfoProps {
  customerInfo: Array<{ label: string; value: string; }>;
  currentUser: any;
}

const CustomerContactInfo = ({ customerInfo, currentUser }: CustomerContactInfoProps) => {
  return (
    <div className="space-y-1 text-sm text-gray-600 mb-3">
      {customerInfo.filter(info => info.label !== 'Name').map((info, index) => (
        <div key={index} className="flex items-start gap-1">
          {info.label === 'Location' && <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />}
          <span className="font-medium">{info.label}:</span>
          <span>{info.value}</span>
        </div>
      ))}
      {!currentUser && (
        <div className="text-xs text-gray-500 mt-2">
          Sign in to view reviews and ratings
        </div>
      )}
    </div>
  );
};

export default CustomerContactInfo;

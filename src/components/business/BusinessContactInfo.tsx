
import React from "react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface BusinessContactInfoProps {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

const BusinessContactInfo: React.FC<BusinessContactInfoProps> = ({ 
  phone, address, city, state, zipcode 
}) => {
  const hasAddress = address || city || state || zipcode;
  
  if (!phone && !hasAddress) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {phone && (
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-gray-500">{formatPhoneNumber(phone)}</p>
          </div>
        </div>
      )}
      
      {hasAddress && (
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <p className="font-medium">Address</p>
            <p className="text-gray-500">
              {address && <>{address}<br /></>}
              {city}{city && state ? ", " : ""}{state} {zipcode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessContactInfo;

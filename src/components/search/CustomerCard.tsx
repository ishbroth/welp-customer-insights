import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { Lock } from "lucide-react";
import { Customer } from "@/types/search";
import ReviewsList from "./ReviewsList";
import { useAuth } from "@/contexts/auth";

interface CustomerCardProps {
  customer: Customer;
  customerReviews: {[key: string]: any[]};
  expandedCustomerId: string | null;
  handleSelectCustomer: (customerId: string) => void;
  hasFullAccess: (customerId: string) => boolean;
}

const CustomerCard = ({ 
  customer,
  customerReviews,
  expandedCustomerId,
  handleSelectCustomer,
  hasFullAccess
}: CustomerCardProps) => {
  const { currentUser } = useAuth();
  
  // Format address for display based on subscription status
  const formatAddress = (customer: Customer) => {
    if (currentUser?.type === "admin" || hasFullAccess(customer.id)) {
      return customer.address;
    }
    
    if (customer.address) {
      // Remove the house/building number from the address
      const addressParts = customer.address.split(' ');
      if (addressParts.length > 1 && !isNaN(Number(addressParts[0]))) {
        return addressParts.slice(1).join(' ');
      }
      return customer.address;
    }
    return '';
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">
            {customer.lastName}, {customer.firstName}
          </h4>
          <p className="text-sm text-gray-500">
            {formatAddress(customer)}
            {customer.city && `, ${customer.city}`}
            {customer.state && `, ${customer.state}`}
            {customer.zipCode && ` ${customer.zipCode}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            ({customer.totalReviews} {customer.totalReviews === 1 ? 'review' : 'reviews'})
          </div>
          <StarRating rating={customer.averageRating} size="sm" />
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSelectCustomer(customer.id)}
        >
          {expandedCustomerId === customer.id ? 'Hide Reviews' : 'Show Reviews'}
        </Button>
        
        {customer.isSubscriptionNeeded && !hasFullAccess(customer.id) && (
          <div className="flex items-center text-sm text-amber-600">
            <Lock className="h-3 w-3 mr-1" />
            <span>Premium</span>
          </div>
        )}
      </div>
      
      {expandedCustomerId === customer.id && (
        <ReviewsList 
          customerId={customer.id}
          reviews={customerReviews[customer.id] || []}
          hasFullAccess={hasFullAccess}
        />
      )}
    </Card>
  );
};

export default CustomerCard;

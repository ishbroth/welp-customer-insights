import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types/search";
import CustomerCard from "./CustomerCard";
import EmptySearchResults from "./EmptySearchResults";

interface SearchResultsListProps {
  customers: Customer[];
  isLoading: boolean;
}

const SearchResultsList = ({ customers, isLoading }: SearchResultsListProps) => {
  const { currentUser, isSubscribed, hasOneTimeAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});

  const handleSelectCustomer = (customerId: string) => {
    // If this customer is already expanded, collapse it
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }

    // Otherwise, expand this customer
    setExpandedCustomerId(customerId);
    
    // Check if we already fetched reviews for this customer
    if (customerReviews[customerId]) {
      return;
    }
    
    // Always return empty reviews now that mock data is removed
    setCustomerReviews(prev => ({
      ...prev,
      [customerId]: []
    }));
  };

  // Check if user has access to the customer's full reviews
  const hasFullAccess = (customerId: string) => {
    // If the user is logged in and has a subscription, they have access
    if (currentUser && isSubscribed) return true;
    
    // Check if the user has paid for one-time access to this specific customer
    return hasOneTimeAccess(customerId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (customers.length === 0) {
    return <EmptySearchResults isBusinessUser={currentUser?.type === "business"} />;
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Search Results ({customers.length})</h3>
      <div className="space-y-3">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            customerReviews={customerReviews}
            expandedCustomerId={expandedCustomerId}
            handleSelectCustomer={handleSelectCustomer}
            hasFullAccess={hasFullAccess}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types/search";
import CustomerCard from "./CustomerCard";
import EmptySearchResults from "./EmptySearchResults";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSelectCustomer = async (customerId: string) => {
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
    
    try {
      // Fetch reviews for this customer from Supabase
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          business_id,
          profiles!business_id(name)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Format reviews data
      const formattedReviews = reviewsData ? reviewsData.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        date: review.created_at,
        reviewerId: review.business_id,
        reviewerName: review.profiles?.name || "Anonymous"
      })) : [];
      
      // Update state with fetched reviews
      setCustomerReviews(prev => ({
        ...prev,
        [customerId]: formattedReviews
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer reviews.",
        variant: "destructive"
      });
      
      // Set empty array for this customer to prevent repeated fetch attempts
      setCustomerReviews(prev => ({
        ...prev,
        [customerId]: []
      }));
    }
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

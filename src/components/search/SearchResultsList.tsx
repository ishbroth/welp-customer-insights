import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResultsListProps {
  customers: any[];
  isLoading: boolean;
}

const SearchResultsList = ({ customers, isLoading }: SearchResultsListProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});
  const [isSubscribed, setIsSubscribed] = useState(false);

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
  
  // Function to get just the first 3 words of a review
  const getFirstThreeWords = (text: string) => {
    if (!text) return "";
    
    // Split the text into words and take the first 3
    const words = text.split(/\s+/);
    const firstThreeWords = words.slice(0, 3).join(" ");
    
    return `${firstThreeWords}...`;
  };
  
  const handleBuyFullReview = (customerId: string) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to access the full review.",
      });
      navigate(`/login?redirect=/search`);
      return;
    }
    
    toast({
      title: "Redirecting to payment",
      description: "You'll be redirected to the payment page to access all reviews for this customer.",
    });
    
    // Redirect directly to one-time payment page with customerId instead of reviewId
    navigate(`/one-time-review?customerId=${customerId}`);
  };

  // Format address for display based on subscription status
  const formatAddress = (customer: any) => {
    // If the user is subscribed or admin, show full address
    if (currentUser?.type === "admin" || isSubscribed) {
      return customer.address;
    }
    
    // Check if the user has one-time access to this customer
    const hasOneTimeAccess = localStorage.getItem(`customer_access_${customer.id}`) === "true";
    if (hasOneTimeAccess) {
      return customer.address;
    }
    
    // For unsubscribed users, only show the street name without numbers
    if (customer.address) {
      // Remove the house/building number from the address
      const addressParts = customer.address.split(' ');
      // If the first part is a number, remove it
      if (addressParts.length > 1 && !isNaN(Number(addressParts[0]))) {
        return addressParts.slice(1).join(' ');
      }
      return customer.address;
    }
    return '';
  };

  // Non-logged in users and customers who haven't subscribed only see truncated reviews
  const shouldShowLimitedReview = !currentUser || (currentUser?.type === "customer") || (!isSubscribed && currentUser?.type !== "admin");

  // Check if user has access to the customer's full reviews
  const hasFullAccess = (customerId: string) => {
    // If the user is logged in and has a subscription, they have access
    if (currentUser && isSubscribed) return true;
    
    // Check if the user has paid for one-time access to this specific customer
    const hasOneTimeAccess = localStorage.getItem(`customer_access_${customerId}`) === "true";
    return hasOneTimeAccess;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No customers found matching your search.</p>
        <p className="text-sm mb-4">Try adjusting your search criteria or add a new customer.</p>
        <Link to="/review/new" className="inline-block">
          <Button className="welp-button flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Customer
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Search Results ({customers.length})</h3>
      <div className="space-y-3">
        {customers.map(customer => (
          <Card key={customer.id} className="p-4">
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
              <div className="mt-4 space-y-4">
                {customerReviews[customer.id]?.length > 0 ? (
                  customerReviews[customer.id].map((review: any) => (
                    <div key={review.id} className="border-t pt-3">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          by {review.reviewerName}
                        </div>
                      </div>
                      <div className="mt-2">
                        {shouldShowLimitedReview && !hasFullAccess(customer.id) ? (
                          <div>
                            <p className="text-sm line-clamp-1">
                              {getFirstThreeWords(review.content)}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleBuyFullReview(customer.id)}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Buy Full Review ($1.99)
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line">{review.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No reviews available</div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsList;

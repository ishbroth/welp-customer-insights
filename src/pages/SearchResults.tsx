import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, UserPlus } from "lucide-react";
import StarRating from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockUsers";

// Function to calculate similarity between two strings (for fuzzy matching)
const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // If the strings are identical, return 1
  if (s1 === s2) return 1;
  
  // Calculate the Levenshtein distance (edit distance)
  const matrix = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(null));
  
  // Initialize the first row and column
  for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity as 1 - normalized distance
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength > 0 ? 1 - matrix[s1.length][s2.length] / maxLength : 1;
}

// Transform mock users into the format expected by the search results page
const transformMockUsers = () => {
  return mockUsers
    .filter(user => user.type === "customer")
    .map(user => {
      // Split name into first and last name (assuming format is "First Last")
      const nameParts = user.name.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : user.name;
      
      // Calculate average rating if the user has reviews
      const totalReviews = user.reviews?.length || 0;
      const totalRating = user.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      return {
        id: user.id,
        firstName,
        lastName,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        averageRating,
        totalReviews,
        isSubscriptionNeeded: Math.random() > 0.5 // Randomly determine if subscription is needed for demo
      };
    });
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<{[key: string]: any[]}>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Extract search parameters
  const lastName = searchParams.get("lastName") || "";
  const firstName = searchParams.get("firstName") || "";
  const phone = searchParams.get("phone") || "";
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const zipCode = searchParams.get("zipCode") || "";
  
  // Get fuzzy match parameters
  const fuzzyMatch = searchParams.get("fuzzyMatch") === "true";
  const similarityThreshold = parseFloat(searchParams.get("similarityThreshold") || "0.7");

  useEffect(() => {
    // Simulate API call but return empty array (no mock data)
    setIsLoading(true);
    
    setTimeout(() => {
      // Return empty results - we've removed the mock data
      setCustomers([]);
      setIsLoading(false);
    }, 500);
  }, [lastName, firstName, phone, address, city, state, zipCode]);

  // Function to format address for display based on subscription status
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Modified layout - making search column full width */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 mb-8">
              <SearchBox />
              
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : customers.length === 0 ? (
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
              ) : (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Search Results ({customers.length})</h3>
                  <div className="space-y-3">
                    {/* Customer results would be mapped here */}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;

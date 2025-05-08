
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import { Card } from "@/components/ui/card";
import { mockUsers } from "@/data/mockUsers";
import SearchResultsList from "@/components/search/SearchResultsList";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Modified layout - making search column full width */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 mb-8">
              <SearchBox />
              <SearchResultsList 
                customers={customers} 
                isLoading={isLoading} 
              />
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;

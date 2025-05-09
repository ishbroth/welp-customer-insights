
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import { Card } from "@/components/ui/card";
import SearchResultsList from "@/components/search/SearchResultsList";
import { Customer } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
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
    // Perform actual search with Supabase
    const fetchSearchResults = async () => {
      setIsLoading(true);
      
      try {
        // Format phone for search by removing non-digit characters
        const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
        
        // Build the query
        let query = supabase
          .from('profiles')
          .select('id, first_name, last_name, phone, address, city, state, zipcode')
          .eq('type', 'customer');
        
        // Add filters for each provided parameter
        if (firstName) {
          query = query.ilike('first_name', `%${firstName}%`);
        }
        
        if (lastName) {
          query = query.ilike('last_name', `%${lastName}%`);
        }
        
        if (formattedPhone) {
          query = query.ilike('phone', `%${formattedPhone}%`);
        }
        
        if (address) {
          // Extract first word of address for search
          const firstWordOfAddress = address.trim().split(/\s+/)[0];
          query = query.ilike('address', `%${firstWordOfAddress}%`);
        }
        
        if (city) {
          query = query.ilike('city', `%${city}%`);
        }
        
        if (state) {
          query = query.ilike('state', `%${state}%`);
        }
        
        if (zipCode) {
          query = query.ilike('zipcode', `%${zipCode}%`);
        }
        
        const { data: profilesData, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (!profilesData || profilesData.length === 0) {
          setCustomers([]);
          setIsLoading(false);
          return;
        }
        
        // Second query to get review counts and averages for each customer
        const customerIds = profilesData.map(profile => profile.id);
        
        // Get reviews count and average rating for each customer
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('customer_id, rating')
          .in('customer_id', customerIds);
          
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        }
        
        // Transform profiles data to Customer type
        const formattedCustomers: Customer[] = profilesData.map(profile => {
          // Get all reviews for this customer
          const customerReviews = reviewsData?.filter(review => 
            review.customer_id === profile.id
          ) || [];
          
          // Calculate average rating
          const totalRating = customerReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = customerReviews.length > 0 
            ? totalRating / customerReviews.length 
            : 0;
          
          return {
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zipcode || '',
            averageRating,
            totalReviews: customerReviews.length,
            isSubscriptionNeeded: customerReviews.length > 0 // If has reviews, mark as needing subscription
          };
        });
        
        setCustomers(formattedCustomers);
        
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "An error occurred while searching the customer database.",
          variant: "destructive"
        });
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [lastName, firstName, phone, address, city, state, zipCode, toast]);

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

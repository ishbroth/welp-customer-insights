
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomerSearch = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    // Check if we have any search parameters
    const hasSearchParams = [lastName, firstName, phone, address, city, state, zipCode].some(param => param.trim() !== "");
    
    console.log("Search parameters:", { lastName, firstName, phone, address, city, state, zipCode });
    console.log("Has search params:", hasSearchParams);
    
    if (!hasSearchParams) {
      console.log("No search parameters, skipping search");
      setIsLoading(false);
      setCustomers([]);
      return;
    }

    // Perform search with Supabase
    const fetchSearchResults = async () => {
      console.log("Starting search...");
      setIsLoading(true);
      
      try {
        // Format phone for search by removing non-digit characters
        const formattedPhone = phone ? phone.replace(/\D/g, '') : '';

        console.log("Searching profiles table...");
        // First check for profile matches (existing customers in the database)
        let profileQuery = supabase
          .from('profiles')
          .select('id, first_name, last_name, phone, address, city, state, zipcode')
          .eq('type', 'customer')
          .limit(50); // Add limit to prevent large queries
        
        // Add filters for each provided parameter for profiles
        if (firstName) {
          profileQuery = profileQuery.ilike('first_name', `%${firstName}%`);
        }
        
        if (lastName) {
          profileQuery = profileQuery.ilike('last_name', `%${lastName}%`);
        }
        
        if (formattedPhone) {
          profileQuery = profileQuery.ilike('phone', `%${formattedPhone}%`);
        }
        
        if (address) {
          // Extract first word of address for search
          const firstWordOfAddress = address.trim().split(/\s+/)[0];
          profileQuery = profileQuery.ilike('address', `%${firstWordOfAddress}%`);
        }
        
        if (city) {
          profileQuery = profileQuery.ilike('city', `%${city}%`);
        }
        
        if (state) {
          profileQuery = profileQuery.ilike('state', `%${state}%`);
        }
        
        if (zipCode) {
          profileQuery = profileQuery.ilike('zipcode', `%${zipCode}%`);
        }
        
        const { data: profilesData, error: profileError } = await profileQuery;

        if (profileError) {
          console.error("Profile search error:", profileError);
          throw profileError;
        }
        
        console.log("Profile search results:", profilesData);

        console.log("Searching reviews table...");
        // Now also search in reviews for customer information
        let reviewQuery = supabase
          .from('reviews')
          .select('id, customer_name, customer_address, customer_city, customer_zipcode, customer_phone, rating')
          .limit(50); // Add limit to prevent large queries
        
        // Add filters for each provided parameter for reviews
        if (firstName || lastName) {
          const nameSearch = [firstName, lastName].filter(Boolean).join(' ');
          if (nameSearch) {
            reviewQuery = reviewQuery.ilike('customer_name', `%${nameSearch}%`);
          }
        }
        
        if (formattedPhone) {
          reviewQuery = reviewQuery.ilike('customer_phone', `%${formattedPhone}%`);
        }
        
        if (address) {
          // Extract first word of address for search
          const firstWordOfAddress = address.trim().split(/\s+/)[0];
          reviewQuery = reviewQuery.ilike('customer_address', `%${firstWordOfAddress}%`);
        }
        
        if (city) {
          reviewQuery = reviewQuery.ilike('customer_city', `%${city}%`);
        }
        
        if (zipCode) {
          reviewQuery = reviewQuery.ilike('customer_zipcode', `%${zipCode}%`);
        }
        
        const { data: reviewsData, error: reviewError } = await reviewQuery;

        if (reviewError) {
          console.error("Review search error:", reviewError);
          throw reviewError;
        }
        
        console.log("Review search results:", reviewsData);
        
        // Combine both data sources into customers
        let combinedCustomers: Customer[] = [];
        
        // Add customers from profiles
        if (profilesData && profilesData.length > 0) {
          console.log("Processing profile customers...");
          
          // Get reviews for these profiles in a single query
          const profileIds = profilesData.map(profile => profile.id);
          const { data: profileReviews } = await supabase
            .from('reviews')
            .select('customer_id, rating')
            .in('customer_id', profileIds);
          
          const profileCustomers = profilesData.map(profile => {
            // Get all reviews for this profile
            const customerReviews = profileReviews?.filter(review => 
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
              isSubscriptionNeeded: customerReviews.length > 0
            };
          });
          
          combinedCustomers = [...profileCustomers];
          console.log("Profile customers processed:", profileCustomers);
        }
        
        // Add customers from reviews (that are not already in profiles)
        if (reviewsData && reviewsData.length > 0) {
          console.log("Processing review customers...");
          // Group reviews by customer info to avoid duplicates
          const reviewsByCustomerInfo = new Map();
          
          reviewsData.forEach(review => {
            if (!review.customer_name) return;
            
            const customerKey = `${review.customer_name}|${review.customer_phone || ''}`;
            
            if (!reviewsByCustomerInfo.has(customerKey)) {
              reviewsByCustomerInfo.set(customerKey, {
                reviews: [review],
                ratings: [review.rating]
              });
            } else {
              const existing = reviewsByCustomerInfo.get(customerKey);
              existing.reviews.push(review);
              existing.ratings.push(review.rating);
              reviewsByCustomerInfo.set(customerKey, existing);
            }
          });
          
          // Convert map to array of customers
          reviewsByCustomerInfo.forEach((value, key) => {
            const [name, phone] = key.split('|');
            const nameParts = name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            // Calculate average rating
            const totalRating = value.ratings.reduce((sum: number, rating: number) => sum + rating, 0);
            const averageRating = value.ratings.length > 0 
              ? totalRating / value.ratings.length 
              : 0;
              
            const sampleReview = value.reviews[0];
            
            // Create a unique ID for this customer from reviews
            const customerId = `review-customer-${sampleReview.id}`;
            
            // Check if this customer is already in our list from profiles
            const isDuplicate = combinedCustomers.some(c => 
              (c.firstName === firstName && c.lastName === lastName) || 
              (phone && c.phone === phone)
            );
            
            if (!isDuplicate) {
              combinedCustomers.push({
                id: customerId,
                firstName,
                lastName,
                phone: sampleReview.customer_phone || '',
                address: sampleReview.customer_address || '',
                city: sampleReview.customer_city || '',
                state: '', // Reviews don't store state
                zipCode: sampleReview.customer_zipcode || '',
                averageRating,
                totalReviews: value.reviews.length,
                isSubscriptionNeeded: value.reviews.length > 0
              });
            }
          });
          
          console.log("Review customers processed, total customers:", combinedCustomers.length);
        }
        
        console.log("Final combined customers:", combinedCustomers);
        setCustomers(combinedCustomers);
        
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "An error occurred while searching the customer database.",
          variant: "destructive"
        });
        setCustomers([]);
      } finally {
        console.log("Search completed, setting loading to false");
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [lastName, firstName, phone, address, city, state, zipCode, toast]);

  return { customers, isLoading };
};

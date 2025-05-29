
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import { searchProfiles } from "./useCustomerSearch/profileSearch";
import { searchReviews } from "./useCustomerSearch/reviewSearch";
import { processProfileCustomers, processReviewCustomers } from "./useCustomerSearch/customerProcessor";
import { SearchParams, ReviewData } from "./useCustomerSearch/types";

export const useCustomerSearch = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Extract search parameters
  const searchParameters: SearchParams = {
    lastName: searchParams.get("lastName") || "",
    firstName: searchParams.get("firstName") || "",
    phone: searchParams.get("phone") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zipCode: searchParams.get("zipCode") || "",
    fuzzyMatch: searchParams.get("fuzzyMatch") === "true",
    similarityThreshold: parseFloat(searchParams.get("similarityThreshold") || "0.7")
  };

  useEffect(() => {
    // Check if we have any search parameters
    const hasSearchParams = Object.values(searchParameters)
      .slice(0, 7) // Only check the string parameters, not fuzzy/threshold
      .some(param => typeof param === 'string' && param.trim() !== "");
    
    console.log("Search parameters:", searchParameters);
    console.log("Has search params:", hasSearchParams);
    
    if (!hasSearchParams) {
      console.log("No search parameters, skipping search");
      setIsLoading(false);
      // Don't clear customers here - keep previous results visible
      return;
    }

    // Perform search with Supabase
    const fetchSearchResults = async () => {
      console.log("Starting search...");
      setIsLoading(true);
      
      try {
        // Search both profiles and reviews
        const [profilesData, reviewsData] = await Promise.all([
          searchProfiles(searchParameters),
          searchReviews(searchParameters)
        ]);
        
        // Process customers from profiles
        const profileCustomers = await processProfileCustomers(profilesData);
        
        // Process customers from reviews - convert scored reviews to ReviewData
        const cleanReviewsData: ReviewData[] = reviewsData.map(review => ({
          id: review.id,
          customer_name: review.customer_name,
          customer_address: review.customer_address,
          customer_city: review.customer_city,
          customer_zipcode: review.customer_zipcode,
          customer_phone: review.customer_phone,
          rating: review.rating,
          business_id: review.business_id,
          business_profile: review.business_profile
        }));
        const reviewCustomers = processReviewCustomers(cleanReviewsData);
        
        // Combine results
        const combinedCustomers = [...profileCustomers, ...reviewCustomers];
        
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
  }, [
    searchParameters.lastName, 
    searchParameters.firstName, 
    searchParameters.phone, 
    searchParameters.address, 
    searchParameters.city, 
    searchParameters.state, 
    searchParameters.zipCode, 
    toast
  ]);

  return { customers, isLoading };
};

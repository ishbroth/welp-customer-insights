
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { useAuth } from "@/contexts/auth";
import { searchProfiles } from "./useCustomerSearch/profileSearch";
import { searchReviews } from "./useCustomerSearch/reviewSearch";
import { processProfileCustomers, processReviewCustomers } from "./useCustomerSearch/customerProcessor";
import { SearchParams, ReviewData } from "./useCustomerSearch/types";

// Simple cache for search results to improve performance
const searchCache = new Map<string, { data: Customer[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useCustomerSearch = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { unlockedReviews } = useReviewAccess();
  const { currentUser } = useAuth();
  const debounceTimer = useRef<NodeJS.Timeout>();
  
  // Extract search parameters - memoized for performance
  const searchParameters: SearchParams = useMemo(() => ({
    lastName: searchParams.get("lastName") || "",
    firstName: searchParams.get("firstName") || "",
    phone: searchParams.get("phone") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zipCode: searchParams.get("zipCode") || "",
    fuzzyMatch: searchParams.get("fuzzyMatch") === "true",
    similarityThreshold: parseFloat(searchParams.get("similarityThreshold") || "0.7")
  }), [searchParams]);

  const fetchSearchResults = useCallback(async () => {
    // Generate cache key for this search
    const cacheKey = JSON.stringify(searchParameters);
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Using cached search results');
      setCustomers(cached.data);
      return;
    }

    // Check if we have any search parameters
    const hasSearchParams = Object.values(searchParameters)
      .slice(0, 7) // Only check the string parameters, not fuzzy/threshold
      .some(param => typeof param === 'string' && param.trim() !== "");
    
    console.log("Search parameters:", searchParameters);
    console.log("Has search params:", hasSearchParams);
    
    if (!hasSearchParams) {
      console.log("No search parameters, clearing customers and skipping search");
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    console.log("Starting search...");
    setIsLoading(true);
    
    try {
      // Search both profiles and reviews
      const [profilesData, reviewsData] = await Promise.all([
        searchProfiles(searchParameters),
        searchReviews(searchParameters, unlockedReviews)
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
        content: review.content,
        created_at: review.created_at,
        business_id: review.business_id,
        business_profile: review.business_profile,
        reviewerName: review.reviewerName,
        reviewerAvatar: review.reviewerAvatar,
        reviewerVerified: review.reviewerVerified
      }));
      
      // Process review customers (now with grouping logic)
      const reviewCustomers = processReviewCustomers(cleanReviewsData);
      
      // Combine results - but first check for potential duplicates between profile and review customers
      const combinedCustomers = [...profileCustomers];
      
      // Add review customers that don't match existing profile customers, or merge reviews
      for (const reviewCustomer of reviewCustomers) {
        const matchingProfileIndex = profileCustomers.findIndex(profileCustomer => {
          // Check if names and phones match
          const nameMatch = profileCustomer.firstName === reviewCustomer.firstName && 
                           profileCustomer.lastName === reviewCustomer.lastName;
          const phoneMatch = profileCustomer.phone && reviewCustomer.phone && 
                           profileCustomer.phone.replace(/\D/g, '') === reviewCustomer.phone.replace(/\D/g, '');
          
          return nameMatch || phoneMatch;
        });
        
        if (matchingProfileIndex === -1) {
          // No match found, add as new customer
          combinedCustomers.push(reviewCustomer);
        } else {
          // Match found, merge reviews into the existing profile customer
          console.log(`Merging reviews for duplicate customer: ${reviewCustomer.firstName} ${reviewCustomer.lastName}`);
          combinedCustomers[matchingProfileIndex].reviews = [
            ...combinedCustomers[matchingProfileIndex].reviews,
            ...reviewCustomer.reviews
          ];
        }
      }
      
      // Sort customers to prioritize those with reviews by the current user
      const sortedCustomers = combinedCustomers.sort((a, b) => {
        const aHasUserReview = a.reviews?.some(review => review.reviewerId === currentUser?.id) || false;
        const bHasUserReview = b.reviews?.some(review => review.reviewerId === currentUser?.id) || false;
        
        if (aHasUserReview && !bHasUserReview) return -1;
        if (!aHasUserReview && bHasUserReview) return 1;
        return 0;
      });
      
      console.log("Final combined customers:", sortedCustomers);
      setCustomers(sortedCustomers);
      
      // Cache the results
      searchCache.set(cacheKey, { data: sortedCustomers, timestamp: Date.now() });
      
      // Clean up old cache entries
      for (const [key, value] of searchCache.entries()) {
        if (Date.now() - value.timestamp > CACHE_TTL) {
          searchCache.delete(key);
        }
      }
      
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
  }, [
    searchParameters.lastName, 
    searchParameters.firstName, 
    searchParameters.phone, 
    searchParameters.address, 
    searchParameters.city, 
    searchParameters.state, 
    searchParameters.zipCode, 
    toast,
    unlockedReviews.join(',')
  ]);

  // Debounced search trigger to prevent excessive API calls
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchSearchResults();
    }, 300); // 300ms debounce
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchSearchResults]);

  return { 
    customers, 
    isLoading, 
    refetch: fetchSearchResults 
  };
};

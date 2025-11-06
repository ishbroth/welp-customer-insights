
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Customer } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import { useReviewAccess } from "@/hooks/useReviewAccess";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { searchProfiles } from "./useCustomerSearch/profileSearch";
import { searchReviews } from "./useCustomerSearch/reviewSearch";
import { processProfileCustomers, processReviewCustomers } from "./useCustomerSearch/customerProcessor";
import { SearchParams, ReviewData } from "./useCustomerSearch/types";
import { logger } from '@/utils/logger';

// Simple cache for search results to improve performance
const searchCache = new Map<string, { data: Customer[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Export function to manually clear the search cache
export const clearSearchCache = () => {
  const size = searchCache.size;
  searchCache.clear();
  console.log(`🧹 Search cache cleared (removed ${size} entries)`);
};

// Expose cache clearing to browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).clearSearchCache = clearSearchCache;
}

const hookLogger = logger.withContext('useCustomerSearch');

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
    businessName: searchParams.get("businessName") || "",
    phone: searchParams.get("phone") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zipCode: searchParams.get("zipCode") || "",
    fuzzyMatch: searchParams.get("fuzzyMatch") === "true",
    similarityThreshold: parseFloat(searchParams.get("similarityThreshold") || "0.7")
  }), [searchParams]);

  const fetchSearchResults = useCallback(async () => {
    // Clear previous results immediately to prevent showing stale data
    setCustomers([]);
    setIsLoading(true);

    // TEMPORARY: Disable cache entirely for debugging
    console.log('🔄 FORCING FRESH SEARCH - Cache temporarily disabled for debugging');
    searchCache.clear();

    // Generate cache key for this search
    const cacheKey = JSON.stringify(searchParameters);

    // Check cache first
    const cached = searchCache.get(cacheKey);
    const cacheAge = cached ? Date.now() - cached.timestamp : null;
    const isExpired = cached ? cacheAge! >= CACHE_TTL : null;

    console.log('🔑 CACHE CHECK:', {
      cacheKeyPreview: cacheKey.substring(0, 100) + '...',
      hasCached: !!cached,
      cacheAge: cacheAge ? `${Math.round(cacheAge! / 1000)}s ago` : 'N/A',
      isExpired,
      cachedResultCount: cached?.data.length,
      cachedCustomers: cached?.data.map(c => `${c.firstName} ${c.lastName}`).slice(0, 5)
    });

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ USING CACHED RESULTS:', cached.data.map(c => `${c.firstName} ${c.lastName}`));
      hookLogger.debug('Using cached search results');
      setCustomers(cached.data);
      setIsLoading(false);
      return;
    }

    console.log('🔄 CACHE MISS - Fetching fresh results from database');

    // Check if we have any search parameters
    const hasSearchParams = Object.values(searchParameters)
      .slice(0, 7) // Only check the string parameters, not fuzzy/threshold
      .some(param => typeof param === 'string' && param.trim() !== "");

    hookLogger.debug("Search parameters:", searchParameters);
    hookLogger.debug("Has search params:", hasSearchParams);

    if (!hasSearchParams) {
      hookLogger.debug("No search parameters, clearing customers and skipping search");
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    hookLogger.debug("Starting search...");

    try {
      // For customer users, also fetch their claimed reviews to include in results
      let claimedReviewIds: string[] = [];
      if (currentUser?.type === 'customer') {
        const { data: claims } = await supabase
          .from('review_claims')
          .select('review_id')
          .eq('claimed_by', currentUser.id);

        claimedReviewIds = claims?.map(c => c.review_id) || [];
        hookLogger.info(`Current user has ${claimedReviewIds.length} claimed reviews`);
      }

      // Search both profiles and reviews
      const [profilesData, reviewsData] = await Promise.all([
        searchProfiles(searchParameters),
        searchReviews(searchParameters, unlockedReviews, claimedReviewIds)
      ]);
      
      // Process customers from profiles
      const profileCustomers = await processProfileCustomers(profilesData);
      
      // Process customers from reviews - convert scored reviews to ReviewData
      const cleanReviewsData: ReviewData[] = reviewsData.map(review => ({
        id: review.id,
        customer_name: review.customer_name,
        customer_nickname: review.customer_nickname,
        customer_business_name: review.customer_business_name,
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
        reviewerVerified: review.reviewerVerified,
        reviewerCity: review.reviewerCity,
        reviewerState: review.reviewerState,
        associates: review.associates,
        is_anonymous: review.is_anonymous,
        // Preserve associate match metadata
        isAssociateMatch: review.isAssociateMatch,
        associateData: review.associateData,
        original_customer_name: review.original_customer_name,
        original_customer_address: review.original_customer_address,
        original_customer_city: review.original_customer_city,
        original_customer_zipcode: review.original_customer_zipcode,
        original_customer_phone: review.original_customer_phone
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
          hookLogger.debug(`Merging reviews for duplicate customer: ${reviewCustomer.firstName} ${reviewCustomer.lastName}`);
          combinedCustomers[matchingProfileIndex].reviews = [
            ...combinedCustomers[matchingProfileIndex].reviews,
            ...reviewCustomer.reviews
          ];
        }
      }

      // Calculate relevancy scores for each customer based on search criteria
      combinedCustomers.forEach(customer => {
        let relevancyScore = 0;

        // City match scoring (most important for location-based searches)
        if (searchParameters.city && customer.city) {
          const customerCity = customer.city.toLowerCase().trim();
          const searchCity = searchParameters.city.toLowerCase().trim();
          if (customerCity === searchCity) {
            relevancyScore += 100; // Exact city match
          } else if (customerCity.includes(searchCity) || searchCity.includes(customerCity)) {
            relevancyScore += 50; // Partial city match
          } else {
            // TODO: Could add proximity check here (within 50 miles)
            relevancyScore += 25; // Assume proximity match if both cities exist
          }
        }

        // Name match scoring
        if (searchParameters.firstName || searchParameters.lastName) {
          const searchName = `${searchParameters.firstName || ''} ${searchParameters.lastName || ''}`.toLowerCase().trim();
          const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase().trim();
          if (customerName === searchName) {
            relevancyScore += 50; // Exact name match
          } else if (customerName.includes(searchName) || searchName.includes(customerName)) {
            relevancyScore += 25; // Partial name match
          }
        }

        // Phone match scoring
        if (searchParameters.phone && customer.phone) {
          const cleanSearchPhone = searchParameters.phone.replace(/\D/g, '');
          const cleanCustomerPhone = customer.phone.replace(/\D/g, '');
          if (cleanSearchPhone === cleanCustomerPhone) {
            relevancyScore += 30; // Exact phone match
          } else if (cleanSearchPhone.length >= 7 && cleanCustomerPhone.length >= 7 &&
                     cleanSearchPhone.slice(-7) === cleanCustomerPhone.slice(-7)) {
            relevancyScore += 20; // Last 7 digits match
          }
        }

        // Address match scoring
        if (searchParameters.address && customer.address) {
          const searchAddr = searchParameters.address.toLowerCase().trim();
          const customerAddr = customer.address.toLowerCase().trim();
          if (customerAddr === searchAddr) {
            relevancyScore += 40; // Exact address match
          } else if (customerAddr.includes(searchAddr) || searchAddr.includes(customerAddr)) {
            relevancyScore += 20; // Partial address match
          }
        }

        // Zipcode match scoring
        if (searchParameters.zipCode && customer.zipCode) {
          const cleanSearchZip = searchParameters.zipCode.replace(/\D/g, '');
          const cleanCustomerZip = customer.zipCode.replace(/\D/g, '');
          if (cleanSearchZip === cleanCustomerZip) {
            relevancyScore += 30; // Exact zip match
          }
        }

        customer.relevancyScore = relevancyScore;
        hookLogger.debug(`Customer ${customer.firstName} ${customer.lastName} (${customer.city}) relevancy score: ${relevancyScore}`);
      });

      // Sort customers: User reviews > Associate status > Relevancy > Date
      const sortedCustomers = combinedCustomers.sort((a, b) => {
        // 1. Prioritize customers with reviews by the current user
        const aHasUserReview = a.reviews?.some(review => review.reviewerId === currentUser?.id) || false;
        const bHasUserReview = b.reviews?.some(review => review.reviewerId === currentUser?.id) || false;

        if (aHasUserReview && !bHasUserReview) return -1;
        if (!aHasUserReview && bHasUserReview) return 1;

        // 2. Direct matches before associate matches
        const aIsAssociate = a.isAssociateMatch || false;
        const bIsAssociate = b.isAssociateMatch || false;

        if (aIsAssociate !== bIsAssociate) {
          return aIsAssociate ? 1 : -1; // Direct matches first
        }

        // 3. Sort by relevancy score (higher is better)
        const aRelevancy = a.relevancyScore || 0;
        const bRelevancy = b.relevancyScore || 0;

        if (aRelevancy !== bRelevancy) {
          return bRelevancy - aRelevancy; // Higher relevancy first
        }

        // 4. Tiebreaker: Sort by most recent review date
        const aDate = a.reviews?.[0]?.date || '';
        const bDate = b.reviews?.[0]?.date || '';

        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }

        return 0;
      });

      hookLogger.debug("Final combined customers:", sortedCustomers);

      console.log('📊 FINAL SEARCH RESULTS (sorted by relevancy):', {
        count: sortedCustomers.length,
        customers: sortedCustomers.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          city: c.city || 'N/A',
          relevancyScore: c.relevancyScore || 0,
          isAssociate: c.isAssociateMatch || false,
          reviewCount: c.reviews?.length || 0,
          mostRecentReview: c.reviews?.[0]?.date || 'N/A'
        }))
      });

      setCustomers(sortedCustomers);

      // Cache the results
      searchCache.set(cacheKey, { data: sortedCustomers, timestamp: Date.now() });
      console.log('💾 Results cached with key:', cacheKey.substring(0, 100) + '...');
      
      // Clean up old cache entries
      for (const [key, value] of searchCache.entries()) {
        if (Date.now() - value.timestamp > CACHE_TTL) {
          searchCache.delete(key);
        }
      }

    } catch (error) {
      hookLogger.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching the customer database.",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      hookLogger.debug("Search completed, setting loading to false");
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

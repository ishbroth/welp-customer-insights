
import { useQuery } from "@tanstack/react-query";
import { 
  mergeCustomerInfo, 
  fetchCustomerProfile, 
  findPotentialCustomerMatches,
  CustomerInfo, 
  ReviewCustomerData 
} from "@/utils/customerInfoMerger";

export const useCustomerInfo = (reviewData: ReviewCustomerData): CustomerInfo => {
  // Fetch claimed customer profile if review is claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', reviewData.customerId],
    queryFn: () => fetchCustomerProfile(reviewData.customerId),
    enabled: !!reviewData.customerId
  });

  // Fetch potential matches for unclaimed reviews
  const { data: potentialMatches } = useQuery({
    queryKey: ['potentialCustomerMatches', reviewData.customer_name, reviewData.customer_phone],
    queryFn: () => findPotentialCustomerMatches(reviewData),
    enabled: !reviewData.customerId && (!!reviewData.customer_name || !!reviewData.customer_phone),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return mergeCustomerInfo(reviewData, customerProfile, potentialMatches);
};

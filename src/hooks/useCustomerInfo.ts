
import { useQuery } from "@tanstack/react-query";
import { mergeCustomerInfo, fetchCustomerProfile, CustomerInfo, ReviewCustomerData } from "@/utils/customerInfoMerger";

export const useCustomerInfo = (reviewData: ReviewCustomerData): CustomerInfo => {
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', reviewData.customerId],
    queryFn: () => fetchCustomerProfile(reviewData.customerId),
    enabled: !!reviewData.customerId
  });

  return mergeCustomerInfo(reviewData, customerProfile);
};

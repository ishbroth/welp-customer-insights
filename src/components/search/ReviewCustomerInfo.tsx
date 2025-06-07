import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewCustomerInfoProps {
  hasFullAccess: boolean;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    avatar?: string;
  };
  review: {
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
  };
  finalCustomerAvatar: string;
}

const ReviewCustomerInfo = ({ 
  hasFullAccess, 
  customerData, 
  review, 
  finalCustomerAvatar 
}: ReviewCustomerInfoProps) => {
  // Fetch customer profile if we have customerId but no customer data
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log(`ReviewCustomerInfo: Fetching customer profile for ID: ${review.customerId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("ReviewCustomerInfo: Error fetching customer profile:", error);
        return null;
      }

      console.log(`ReviewCustomerInfo: Customer profile found:`, data);
      return data;
    },
    enabled: !!review.customerId
  });

  // Get the final customer avatar - prefer customerData, then fetched profile
  const customerAvatar = finalCustomerAvatar || customerProfile?.avatar || '';
  
  // Get customer name - prefer customerData, then profile, then review data
  const customerName = customerData 
    ? `${customerData.firstName} ${customerData.lastName}`
    : customerProfile?.name || 
      (customerProfile?.first_name && customerProfile?.last_name 
        ? `${customerProfile.first_name} ${customerProfile.last_name}`
        : review.customer_name);

  if (!hasFullAccess || (!customerData && !review.customer_name && !customerProfile)) {
    return null;
  }

  const getCustomerInitials = () => {
    if (customerData) {
      return `${customerData.firstName?.[0] || ''}${customerData.lastName?.[0] || ''}`;
    }
    if (customerProfile?.first_name || customerProfile?.last_name) {
      return `${customerProfile.first_name?.[0] || ''}${customerProfile.last_name?.[0] || ''}`;
    }
    if (review.customer_name) {
      const names = review.customer_name.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={customerAvatar} alt={customerName || 'Customer'} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {getCustomerInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium">Name:</span> {customerName}
          </div>
        </div>
        
        {/* Keep existing phone, address, location info */}
        {customerData ? (
          <>
            {customerData.phone && (
              <div>
                <span className="font-medium">Phone:</span> {customerData.phone}
              </div>
            )}
            {customerData.address && (
              <div>
                <span className="font-medium">Address:</span> {customerData.address}
              </div>
            )}
            {customerData.city && customerData.state && (
              <div>
                <span className="font-medium">Location:</span> {customerData.city}, {customerData.state} {customerData.zipCode}
              </div>
            )}
          </>
        ) : (
          <>
            {review.customer_phone && (
              <div>
                <span className="font-medium">Phone:</span> {review.customer_phone}
              </div>
            )}
            {review.customer_address && (
              <div>
                <span className="font-medium">Address:</span> {review.customer_address}
              </div>
            )}
            {(review.customer_city || review.customer_zipcode) && (
              <div>
                <span className="font-medium">Location:</span> {review.customer_city} {review.customer_zipcode}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewCustomerInfo;

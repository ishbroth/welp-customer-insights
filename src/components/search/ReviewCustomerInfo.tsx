
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

  // Fetch customer profile by name if we don't have customerId but have customer_name
  const { data: customerProfileByName } = useQuery({
    queryKey: ['customerProfileByName', review.customer_name],
    queryFn: async () => {
      if (!review.customer_name) return null;
      
      console.log(`ReviewCustomerInfo: Searching for customer profile by name: ${review.customer_name}`);
      
      // Try to match by exact name first
      let { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('name', review.customer_name)
        .maybeSingle();

      if (error || !data) {
        console.log('ReviewCustomerInfo: Exact name match failed, trying first/last name combination');
        
        // If no exact match, try to construct from first_name and last_name
        const nameParts = review.customer_name.split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          ({ data, error } = await supabase
            .from('profiles')
            .select('id, avatar, first_name, last_name, name')
            .eq('first_name', firstName)
            .eq('last_name', lastName)
            .maybeSingle());
        }
      }

      if (error) {
        console.error("ReviewCustomerInfo: Error fetching customer profile by name:", error);
        return null;
      }

      console.log(`ReviewCustomerInfo: Customer profile found by name:`, data);
      return data;
    },
    enabled: !!review.customer_name && !review.customerId && !customerData?.avatar
  });

  // Get the final customer avatar - prefer customerData, then fetched profile by ID, then by name
  const customerAvatar = finalCustomerAvatar || 
                        customerProfile?.avatar || 
                        customerProfileByName?.avatar || 
                        '';
  
  // Get customer name - prefer customerData, then profile, then review data
  const customerName = customerData 
    ? `${customerData.firstName} ${customerData.lastName}`
    : customerProfile?.name || 
      customerProfileByName?.name ||
      (customerProfile?.first_name && customerProfile?.last_name 
        ? `${customerProfile.first_name} ${customerProfile.last_name}`
        : customerProfileByName?.first_name && customerProfileByName?.last_name
          ? `${customerProfileByName.first_name} ${customerProfileByName.last_name}`
          : review.customer_name);

  if (!hasFullAccess || (!customerData && !review.customer_name && !customerProfile && !customerProfileByName)) {
    return null;
  }

  const getCustomerInitials = () => {
    if (customerData) {
      return `${customerData.firstName?.[0] || ''}${customerData.lastName?.[0] || ''}`;
    }
    if (customerProfile?.first_name || customerProfile?.last_name) {
      return `${customerProfile.first_name?.[0] || ''}${customerProfile.last_name?.[0] || ''}`;
    }
    if (customerProfileByName?.first_name || customerProfileByName?.last_name) {
      return `${customerProfileByName.first_name?.[0] || ''}${customerProfileByName.last_name?.[0] || ''}`;
    }
    if (review.customer_name) {
      const names = review.customer_name.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  console.log('ReviewCustomerInfo: Final avatar determination:', {
    customerAvatar,
    finalCustomerAvatar,
    customerProfileAvatar: customerProfile?.avatar,
    customerProfileByNameAvatar: customerProfileByName?.avatar,
    customerName,
    reviewCustomerName: review.customer_name
  });

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
        
        {/* Show location info (city, state, zip) but hide sensitive data (phone, address) */}
        {customerData ? (
          <>
            {(customerData.city || customerData.state || customerData.zipCode) && (
              <div>
                <span className="font-medium">Location:</span> {customerData.city}{customerData.city && customerData.state ? ', ' : ''}{customerData.state} {customerData.zipCode}
              </div>
            )}
            {/* Show match indicators instead of sensitive data */}
            <div className="text-xs text-green-600 space-y-1">
              {customerData.phone && <div>✓ Phone information available</div>}
              {customerData.address && <div>✓ Address information available</div>}
            </div>
          </>
        ) : (
          <>
            {(review.customer_city || review.customer_zipcode) && (
              <div>
                <span className="font-medium">Location:</span> {review.customer_city} {review.customer_zipcode}
              </div>
            )}
            {/* Show match indicators instead of sensitive data */}
            <div className="text-xs text-green-600 space-y-1">
              {review.customer_phone && <div>✓ Phone information available</div>}
              {review.customer_address && <div>✓ Address information available</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewCustomerInfo;

import { supabase } from "@/integrations/supabase/client";

export interface CustomerInfo {
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatar?: string;
  isVerified?: boolean;
  isClaimed: boolean;
}

export interface ReviewCustomerData {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
  customerId?: string;
}

export interface CustomerProfile {
  id: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  verified?: boolean;
}

export const mergeCustomerInfo = (
  reviewData: ReviewCustomerData,
  customerProfile?: CustomerProfile | null
): CustomerInfo => {
  const isClaimed = !!reviewData.customerId;
  
  // Start with business input data from review
  let name = reviewData.customer_name || 'Customer';
  let phone = reviewData.customer_phone || '';
  let address = reviewData.customer_address || '';
  let city = reviewData.customer_city || '';
  let state = '';
  let zipCode = reviewData.customer_zipcode || '';
  let avatar = '';
  let isVerified = false;

  // Override with customer profile data if available (claimed review)
  if (isClaimed && customerProfile) {
    // Name: prioritize first_name + last_name, then name, then fall back to review data
    if (customerProfile.first_name && customerProfile.last_name) {
      name = `${customerProfile.first_name} ${customerProfile.last_name}`;
    } else if (customerProfile.first_name) {
      name = customerProfile.first_name;
    } else if (customerProfile.last_name) {
      name = customerProfile.last_name;
    } else if (customerProfile.name && customerProfile.name.trim()) {
      name = customerProfile.name;
    }
    // If no profile name available, keep the review's customer_name

    // Override other fields with profile data if available, otherwise keep business input
    phone = customerProfile.phone || phone;
    address = customerProfile.address || address;
    city = customerProfile.city || city;
    state = customerProfile.state || state;
    zipCode = customerProfile.zipcode || zipCode;
    avatar = customerProfile.avatar || '';
    isVerified = customerProfile.verified || false;
  }

  return {
    name,
    phone: phone || undefined,
    address: address || undefined,
    city: city || undefined,
    state: state || undefined,
    zipCode: zipCode || undefined,
    avatar: avatar || undefined,
    isVerified,
    isClaimed
  };
};

export const fetchCustomerProfile = async (customerId?: string): Promise<CustomerProfile | null> => {
  if (!customerId) return null;
  
  console.log(`Fetching customer profile for ID: ${customerId}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode, verified')
    .eq('id', customerId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching customer profile:", error);
    return null;
  }
  
  console.log(`Customer profile found:`, data);
  return data;
};

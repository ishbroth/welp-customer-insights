
export interface SearchParams {
  lastName: string;
  firstName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fuzzyMatch: boolean;
  similarityThreshold: number;
}

export interface ProfileCustomer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface ReviewData {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_zipcode: string;
  customer_phone: string;
  rating: number;
  business_id: string;
  business_profile: {
    name: string;
    avatar?: string;
  } | null;
}

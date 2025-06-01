
export interface BusinessInfo {
  id: string;
  business_name: string;
  license_expiration: string;
  license_number: string;
  license_status: string;
  license_type: string;
  verified: boolean;
  website?: string;
  business_category?: string;
  business_subcategory?: string;
  license_state?: string;
  additional_licenses?: string;
  additional_info?: string;
}

export interface BusinessProfile {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  business_info?: BusinessInfo;
}


import { supabase } from "@/integrations/supabase/client";
import { SearchableCustomer } from "@/types/supabase";

// Create a new customer in the searchable_customers table
export const createSearchableCustomer = async (customerData: Partial<SearchableCustomer>) => {
  try {
    const { data, error } = await supabase
      .from('searchable_customers')
      .insert(customerData)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error creating searchable customer:', error.message);
    throw error;
  }
};

// Search for customers by various criteria
export const searchCustomers = async (searchParams: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fuzzyMatch?: boolean;
}) => {
  try {
    let query = supabase.from('searchable_customers').select('*');

    if (searchParams.lastName) {
      query = query.ilike('last_name', `%${searchParams.lastName}%`);
    }
    
    if (searchParams.firstName) {
      query = query.ilike('first_name', `%${searchParams.firstName}%`);
    }
    
    if (searchParams.phone) {
      query = query.ilike('phone', `%${searchParams.phone}%`);
    }
    
    if (searchParams.address) {
      query = query.ilike('address', `%${searchParams.address}%`);
    }
    
    if (searchParams.city) {
      query = query.ilike('city', `%${searchParams.city}%`);
    }
    
    if (searchParams.state) {
      query = query.ilike('state', `%${searchParams.state}%`);
    }
    
    if (searchParams.zipCode) {
      query = query.ilike('zip_code', `%${searchParams.zipCode}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error searching customers:', error.message);
    throw error;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/search";

// Function to search customers based on search criteria
export const searchCustomers = async (
  searchParams: {
    lastName?: string;
    firstName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fuzzyMatch?: boolean;
    similarityThreshold?: number;
  }
): Promise<Customer[]> => {
  try {
    // Build the query based on provided parameters
    let query = supabase
      .from('profiles')
      .select('id, name, phone, address, city, state, zip_code')
      .eq('type', 'customer');

    // Add filters for exact matches
    if (!searchParams.fuzzyMatch) {
      if (searchParams.lastName) {
        // Using ilike for case-insensitive match
        query = query.ilike('name', `%${searchParams.lastName}%`);
      }
      if (searchParams.phone) {
        query = query.eq('phone', searchParams.phone);
      }
      if (searchParams.address) {
        query = query.eq('address', searchParams.address);
      }
      if (searchParams.city) {
        query = query.eq('city', searchParams.city);
      }
      if (searchParams.state) {
        query = query.eq('state', searchParams.state);
      }
      if (searchParams.zipCode) {
        query = query.eq('zip_code', searchParams.zipCode);
      }
    } else {
      // For fuzzy matching, we would typically use a function like 
      // similarity or pg_trgm in a real Supabase implementation
      // For now, we're simplifying with ilike
      if (searchParams.lastName || searchParams.firstName) {
        const fullName = `${searchParams.firstName || ''} ${searchParams.lastName || ''}`.trim();
        query = query.ilike('name', `%${fullName}%`);
      }
      if (searchParams.address) {
        query = query.ilike('address', `%${searchParams.address}%`);
      }
    }

    const { data, error } = await query.execute();

    if (error) {
      throw error;
    }

    // Transform the data into the Customer type
    const customers: Customer[] = data.map(customer => ({
      id: customer.id,
      firstName: customer.name.split(' ')[0] || '',
      lastName: customer.name.split(' ').slice(1).join(' ') || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zip_code || ''
    }));

    return customers;
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
};

// Function to create a searchable customer
export const createSearchableCustomer = async (
  customerData: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode: string;
  }
) => {
  try {
    const { firstName, lastName, phone, address, city, state, zipCode } = customerData;
    
    // Get the current user's id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      throw new Error("No authenticated user found");
    }
    
    // Check if a profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();
      
    if (existingProfile) {
      // Update the existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: `${firstName} ${lastName}`.trim(),
          phone,
          address,
          city,
          state,
          zip_code: zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);
        
      if (error) throw error;
      
      return { id: session.user.id };
    } else {
      // Create a new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          name: `${firstName} ${lastName}`.trim(),
          phone,
          address,
          city,
          state,
          zip_code: zipCode,
          type: 'customer',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return { id: session.user.id };
    }
  } catch (error) {
    console.error("Error creating searchable customer:", error);
    throw error;
  }
};

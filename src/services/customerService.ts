
import { supabase } from "@/integrations/supabase/client";

interface CreateCustomerParams {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export const createSearchableCustomer = async ({
  firstName,
  lastName,
  phone,
  address,
  city,
  state,
  zipCode,
}: CreateCustomerParams) => {
  try {
    // Format phone number - remove any non-digit characters
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Check if customer with this phone already exists
    const { data: existingCustomer, error: searchError } = await supabase
      .from('searchable_customers')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle();
    
    if (searchError) {
      console.error('Error checking for existing customer:', searchError);
      return { success: false, error: searchError.message };
    }
    
    // If customer exists, update their info
    if (existingCustomer) {
      const { error: updateError } = await supabase
        .from('searchable_customers')
        .update({
          first_name: firstName,
          last_name: lastName,
          address,
          city,
          state,
          zip_code: zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id);
        
      if (updateError) {
        console.error('Error updating existing customer:', updateError);
        return { success: false, error: updateError.message };
      }
      
      return { success: true, customerId: existingCustomer.id };
    }
    
    // If customer doesn't exist, create a new record
    const { data, error: insertError } = await supabase
      .from('searchable_customers')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        address,
        city,
        state,
        zip_code: zipCode,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (insertError) {
      console.error('Error creating searchable customer:', insertError);
      return { success: false, error: insertError.message };
    }
    
    return { success: true, customerId: data.id };
  } catch (error: any) {
    console.error('Unexpected error in createSearchableCustomer:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
};

// Function to check if a user has one-time access to view a customer
export const hasOneTimeAccessToCustomer = async (userId: string, customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('one_time_access')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', customerId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking one-time access:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error in hasOneTimeAccessToCustomer:', error);
    return false;
  }
};

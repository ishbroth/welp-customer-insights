import { logger } from '@/utils/logger';

import { supabase } from "@/integrations/supabase/client";

const serviceLogger = logger.withContext('Customer');

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
      .from('profiles')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (searchError) {
      serviceLogger.error('Error checking for existing customer:', searchError);
      return { success: false, error: searchError.message };
    }

    // If customer exists, update their info
    if (existingCustomer) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: `${firstName} ${lastName}`,
          phone: formattedPhone,
          address,
          city,
          state,
          zipcode: zipCode, // Note: Updated to match DB field name
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id);

      if (updateError) {
        serviceLogger.error('Error updating existing customer:', updateError);
        return { success: false, error: updateError.message };
      }
      
      return { success: true, customerId: existingCustomer.id };
    }
    
    // If customer doesn't exist, prepare a new profile data
    // Note: We need to generate a UUID for the customer since id is required
    const uuid = crypto.randomUUID();
    
    // If customer doesn't exist, create a new record
    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: uuid, // Required field for profiles table
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        address,
        city,
        state,
        zipcode: zipCode, // Note: Updated to match DB field name
        type: 'customer',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      serviceLogger.error('Error creating searchable customer:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, customerId: data.id };
  } catch (error: any) {
    serviceLogger.error('Unexpected error in createSearchableCustomer:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
};

// Function to check if a user has one-time access to view a customer
export const hasOneTimeAccessToCustomer = async (userId: string, customerId: string) => {
  try {
    // Using customer_access table instead of one_time_access
    const { data, error } = await supabase
      .from('customer_access')
      .select('id')
      .eq('business_id', userId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (error) {
      serviceLogger.error('Error checking one-time access:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    serviceLogger.error('Unexpected error in hasOneTimeAccessToCustomer:', error);
    return false;
  }
};

// Function to purchase one-time access to a customer
export const purchaseOneTimeAccess = async (businessId: string, customerId: string) => {
  try {
    // Create one-time access record
    const { data, error } = await supabase
      .from('customer_access')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days access
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, access: data };
  } catch (error: any) {
    serviceLogger.error('Error purchasing one-time access:', error);
    return { success: false, error: error.message || 'Failed to purchase access' };
  }
};

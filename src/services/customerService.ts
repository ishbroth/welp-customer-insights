
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
    console.log("=== CREATING SEARCHABLE CUSTOMER ===");
    
    // Format phone number - remove any non-digit characters
    const formattedPhone = phone.replace(/\D/g, '');
    const fullName = `${firstName} ${lastName}`.trim();
    
    console.log("Searching for existing customer with:", { phone: formattedPhone, name: fullName });
    
    // First, check if a profile already exists with this phone or name
    const { data: existingProfile, error: searchError } = await supabase
      .from('profiles')
      .select('id, name, phone')
      .or(`phone.eq.${formattedPhone},name.ilike.%${fullName}%`)
      .maybeSingle();
    
    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking for existing customer:', searchError);
      return { success: false, error: searchError.message };
    }
    
    // If profile exists, update it with new information
    if (existingProfile) {
      console.log("Found existing profile, updating:", existingProfile.id);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: formattedPhone,
          address,
          city,
          state,
          zipcode: zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id);
        
      if (updateError) {
        console.error('Error updating existing customer:', updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log("Customer profile updated successfully");
      return { success: true, customerId: existingProfile.id };
    }
    
    // If no existing profile, create a new one
    // Generate a UUID for the new customer profile
    const uuid = crypto.randomUUID();
    
    console.log("Creating new customer profile with ID:", uuid);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: uuid,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        address,
        city,
        state,
        zipcode: zipCode,
        type: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (insertError) {
      console.error('Error creating new customer profile:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log("New customer profile created successfully:", newProfile.id);
    return { success: true, customerId: newProfile.id };
    
  } catch (error: any) {
    console.error('Unexpected error in createSearchableCustomer:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
};

// Function to check if a user has one-time access to view a customer
export const hasOneTimeAccessToCustomer = async (userId: string, customerId: string) => {
  try {
    console.log("Checking one-time access for:", { userId, customerId });
    
    const { data, error } = await supabase
      .from('customer_access')
      .select('id, expires_at')
      .eq('business_id', userId)
      .eq('customer_id', customerId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking one-time access:', error);
      return false;
    }
    
    const hasAccess = !!data;
    console.log("One-time access result:", hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('Unexpected error in hasOneTimeAccessToCustomer:', error);
    return false;
  }
};

// Function to purchase one-time access to a customer
export const purchaseOneTimeAccess = async (businessId: string, customerId: string) => {
  try {
    console.log("Purchasing one-time access:", { businessId, customerId });
    
    // Check if access already exists and is still valid
    const existingAccess = await hasOneTimeAccessToCustomer(businessId, customerId);
    if (existingAccess) {
      return { success: true, message: "Access already exists" };
    }
    
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
      console.error('Error creating one-time access:', error);
      throw error;
    }
    
    console.log("One-time access created successfully:", data.id);
    return { success: true, access: data };
  } catch (error: any) {
    console.error('Error purchasing one-time access:', error);
    return { success: false, error: error.message || 'Failed to purchase access' };
  }
};


import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAddress } from "@/utils/addressNormalization";

export const useProfileUpdate = (currentUser: User | null, setCurrentUser: (user: User | null) => void) => {
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      console.log("=== PROFILE UPDATE START ===");
      console.log("Current user:", currentUser.id);
      console.log("Updates to apply:", updates);

      // Update user metadata if email has changed
      if (updates.email && updates.email !== currentUser.email) {
        console.log("Updating email in auth metadata");
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        });

        if (authError) {
          console.error("Auth email update error:", authError);
          throw new Error(`Failed to update email: ${authError.message}`);
        }
      }

      // Split name into first_name and last_name for database storage
      const nameParts = (updates.name || currentUser.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Normalize the address if it's being updated
      const normalizedAddress = updates.address ? normalizeAddress(updates.address) : currentUser.address;

      // Prepare the complete profile data with all current values
      const profileData = {
        userId: currentUser.id,
        name: updates.name ?? currentUser.name ?? '',
        phone: updates.phone ?? currentUser.phone ?? '',
        address: normalizedAddress ?? '',
        city: updates.city ?? currentUser.city ?? '',
        state: updates.state ?? currentUser.state ?? '',
        zipCode: updates.zipCode ?? currentUser.zipCode ?? '',
        type: currentUser.type,
        bio: updates.bio ?? currentUser.bio ?? '',
        businessId: updates.businessId ?? currentUser.businessId ?? '',
        licenseType: updates.licenseType ?? currentUser.licenseType ?? '',
        avatar: updates.avatar ?? currentUser.avatar ?? '',
        email: updates.email ?? currentUser.email ?? '',
        businessName: currentUser.type === 'business' ? (updates.name ?? currentUser.name) : null,
        firstName: firstName,
        lastName: lastName
      };

      console.log("Complete profile data being sent:", profileData);
      console.log("License type being sent:", profileData.licenseType);

      // Use the edge function to update the profile in the database
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: profileData
      });

      console.log("Edge function response:", { data, error });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      // Check if the response indicates success
      if (!data || !data.success) {
        console.error("Profile update failed:", data);
        throw new Error(data?.message || "Profile update failed");
      }

      console.log("Profile update successful:", data);

      // Fetch the updated profile data from the database to get the latest state
      console.log("Fetching updated profile data...");
      const { data: updatedProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        throw new Error(`Failed to fetch updated profile: ${fetchError.message}`);
      }

      console.log("Fetched updated profile data:", updatedProfileData);

      // Also fetch the business info to get the license type
      let businessLicenseType = '';
      if (currentUser.type === 'business') {
        const { data: businessData, error: businessError } = await supabase
          .from('business_info')
          .select('license_type')
          .eq('id', currentUser.id)
          .single();

        if (!businessError && businessData) {
          businessLicenseType = businessData.license_type || '';
          console.log("Fetched business license type:", businessLicenseType);
        }
      }

      // Update the current user state with the complete updated data
      const updatedUser: User = {
        ...currentUser,
        ...updates,
        address: normalizedAddress,
        // Use the license type from business_info table for business accounts
        licenseType: businessLicenseType || currentUser.licenseType
      };

      console.log("Setting updated user in state:", updatedUser);
      console.log("Updated user licenseType:", updatedUser.licenseType);
      setCurrentUser(updatedUser);

      console.log("=== PROFILE UPDATE COMPLETE ===");
      
      return data;

    } catch (error) {
      console.error("=== PROFILE UPDATE ERROR ===");
      console.error("Error in updateProfile:", error);
      
      // Filter out billing-related errors to avoid confusing the user
      if (error instanceof Error && (error.message.includes('billing') || error.message.includes('Stripe'))) {
        console.log("Suppressing billing error during profile update");
        return { success: true }; // Don't throw billing errors during profile updates
      }
      
      throw error;
    }
  };

  return { updateProfile };
};

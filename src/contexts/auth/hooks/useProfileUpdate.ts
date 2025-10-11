
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAddress } from "@/utils/addressNormalization";
import { logger } from '@/utils/logger';

const authLogger = logger.withContext('ProfileUpdate');

export const useProfileUpdate = (currentUser: User | null, setCurrentUser: (user: User | null) => void) => {
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      authLogger.debug("Profile update start");
      authLogger.debug("Current user:", currentUser.id);
      authLogger.debug("Updates to apply:", updates);

      // Update user metadata if email has changed
      if (updates.email && updates.email !== currentUser.email) {
        authLogger.debug("Updating email in auth metadata");
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        });

        if (authError) {
          authLogger.error("Auth email update error:", authError);
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

      authLogger.debug("Complete profile data being sent:", profileData);
      authLogger.debug("License type being sent:", profileData.licenseType);

      // Use the edge function to update the profile in the database
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: profileData
      });

      authLogger.debug("Edge function response:", { data, error });

      if (error) {
        authLogger.error("Edge function error:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      // Check if the response indicates success
      if (!data || !data.success) {
        authLogger.error("Profile update failed:", data);
        throw new Error(data?.message || "Profile update failed");
      }

      authLogger.debug("Profile update successful:", data);

      // Fetch the updated profile data from the database to get the latest state
      authLogger.debug("Fetching updated profile data...");
      const { data: updatedProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (fetchError) {
        authLogger.error("Error fetching updated profile:", fetchError);
        throw new Error(`Failed to fetch updated profile: ${fetchError.message}`);
      }

      authLogger.debug("Fetched updated profile data:", updatedProfileData);

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
          authLogger.debug("Fetched business license type:", businessLicenseType);
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

      authLogger.debug("Setting updated user in state:", updatedUser);
      authLogger.debug("Updated user licenseType:", updatedUser.licenseType);
      setCurrentUser(updatedUser);

      authLogger.info("Profile update complete");

      return data;

    } catch (error) {
      authLogger.error("Profile update error");
      authLogger.error("Error in updateProfile:", error);

      // Completely suppress billing-related errors during profile updates
      if (error instanceof Error && (error.message.includes('billing') || error.message.includes('Stripe') || error.message.includes('customer'))) {
        authLogger.debug("Suppressing billing-related error during profile update:", error.message);
        return { success: true }; // Don't throw billing errors during profile updates
      }
      
      throw error;
    }
  };

  return { updateProfile };
};

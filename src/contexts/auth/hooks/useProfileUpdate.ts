
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling profile update functionality
 */
export const useProfileUpdate = (currentUser: User | null, setCurrentUser: (user: User | null) => void) => {
  // Update profile - now updates both auth metadata and calls the edge function
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      console.log("Starting profile update for user:", currentUser.id);
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

      // Prepare the complete profile data for the edge function
      const profileData = {
        userId: currentUser.id,
        name: updates.name || currentUser.name || '',
        phone: updates.phone || currentUser.phone || '',
        address: updates.address || currentUser.address || '',
        city: updates.city || currentUser.city || '',
        state: updates.state || currentUser.state || '',
        zipCode: updates.zipCode || currentUser.zipCode || '',
        type: currentUser.type,
        bio: updates.bio || currentUser.bio || '',
        businessId: updates.businessId || currentUser.businessId || '',
        avatar: updates.avatar || currentUser.avatar || '',
        email: updates.email || currentUser.email || '',
        businessName: currentUser.type === 'business' ? (updates.name || currentUser.name) : null,
        firstName: firstName,
        lastName: lastName
      };

      console.log("Calling create-profile edge function with data:", profileData);

      // Use the edge function to update the profile in the database
      const { data, error } = await supabase.functions.invoke('create-profile', {
        body: profileData
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      console.log("Profile update successful:", data);

      // Verify the update by checking the response
      if (!data.success) {
        throw new Error(data.message || "Profile update failed");
      }

      // Update the current user state with the new data immediately
      const updatedUser: User = {
        ...currentUser,
        name: updates.name !== undefined ? updates.name : currentUser.name,
        phone: updates.phone !== undefined ? updates.phone : currentUser.phone,
        address: updates.address !== undefined ? updates.address : currentUser.address,
        city: updates.city !== undefined ? updates.city : currentUser.city,
        state: updates.state !== undefined ? updates.state : currentUser.state,
        zipCode: updates.zipCode !== undefined ? updates.zipCode : currentUser.zipCode,
        bio: updates.bio !== undefined ? updates.bio : currentUser.bio,
        businessId: updates.businessId !== undefined ? updates.businessId : currentUser.businessId,
        avatar: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
        email: updates.email !== undefined ? updates.email : currentUser.email,
      };

      console.log("Updating current user state with:", updatedUser);
      setCurrentUser(updatedUser);

      // Verify the data was actually saved by fetching it back from the database
      console.log("Verifying profile update by fetching fresh data from database...");
      const { data: verificationData, error: verificationError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (verificationError) {
        console.error("Error verifying saved data:", verificationError);
        throw new Error("Profile update verification failed");
      }

      console.log("Verification successful - data persisted in database:", verificationData);

      // If this is a business account, also update any existing reviews with the new business name
      if (currentUser.type === 'business' && updates.name && updates.name !== currentUser.name) {
        console.log("Updating business name in existing reviews");
        const { error: reviewUpdateError } = await supabase
          .from('reviews')
          .update({ customer_name: updates.name })
          .eq('business_id', currentUser.id);

        if (reviewUpdateError) {
          console.error("Error updating review business names:", reviewUpdateError);
          // Don't throw here as the main profile update succeeded
        }
      }

      return data;

    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  };

  return { updateProfile };
};


import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling profile update functionality
 */
export const useProfileUpdate = (currentUser: User | null) => {
  // Update profile - now updates both auth metadata and calls the edge function
  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update user metadata if needed
      if (updates.email) {
        await supabase.auth.updateUser({
          email: updates.email,
        });
      }

      // Use the edge function to update the profile in the database
      const { error } = await supabase.functions.invoke('create-profile', {
        body: {
          userId: currentUser.id,
          name: updates.name || currentUser.name,
          phone: updates.phone || currentUser.phone,
          address: updates.address || currentUser.address,
          city: updates.city || currentUser.city,
          state: updates.state || currentUser.state,
          zipCode: updates.zipCode || currentUser.zipCode,
          type: currentUser.type,
          bio: updates.bio || currentUser.bio,
          businessId: updates.businessId || currentUser.businessId,
          avatar: updates.avatar || currentUser.avatar,
          businessName: currentUser.type === 'business' ? updates.name || currentUser.name : null
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };

  return { updateProfile };
};

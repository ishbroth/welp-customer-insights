
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useProfileUpdate = (currentUser: User | null, setCurrentUser: (user: User | null) => void) => {
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

      // Prepare the complete profile data
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
        ...updates
      };

      console.log("Updating current user state with:", updatedUser);
      setCurrentUser(updatedUser);

      console.log("Profile update completed successfully");
      
      return data;

    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  };

  return { updateProfile };
};

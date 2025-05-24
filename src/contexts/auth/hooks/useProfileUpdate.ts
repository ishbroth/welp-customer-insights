
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

      // Verify the data was actually saved by making a direct database query
      console.log("Verifying profile data was saved to database...");
      const { data: verificationData, error: verificationError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (verificationError) {
        console.error("Verification query failed:", verificationError);
        throw new Error("Could not verify profile was saved");
      }

      console.log("Database verification successful:", verificationData);

      // Double-check that the changes we made are actually in the database
      const expectedChanges = Object.keys(updates);
      const savedCorrectly = expectedChanges.every(key => {
        const expectedValue = updates[key as keyof User];
        let actualValue;
        
        // Map User type fields to database fields
        if (key === 'zipCode') {
          actualValue = verificationData.zipcode;
        } else if (key === 'businessId') {
          actualValue = verificationData.business_id;
        } else {
          actualValue = verificationData[key];
        }
        
        const matches = actualValue === expectedValue;
        if (!matches) {
          console.warn(`Field ${key} mismatch: expected ${expectedValue}, got ${actualValue}`);
        }
        return matches;
      });

      if (!savedCorrectly) {
        throw new Error("Profile update verification failed - data not saved correctly");
      }

      console.log("Profile update completed and verified successfully");
      
      return data;

    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  };

  return { updateProfile };
};

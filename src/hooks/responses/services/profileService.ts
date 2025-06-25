
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  type: string;
  avatar?: string;
}

export const fetchProfiles = async (authorIds: string[]): Promise<ProfileData[]> => {
  if (authorIds.length === 0) {
    console.log('❌ No valid author IDs found');
    return [];
  }

  console.log('👥 Fetching profiles for author IDs:', authorIds);

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, first_name, last_name, type, avatar')
    .in('id', authorIds);

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
    return [];
  }

  console.log('👤 Profile data retrieved:', profiles);
  return profiles || [];
};

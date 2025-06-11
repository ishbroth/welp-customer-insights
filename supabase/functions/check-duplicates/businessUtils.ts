
import { DuplicateCheckResponse } from './types.ts'

export const checkBusinessCombinationDuplicates = async (
  supabaseAdmin: any,
  businessName: string,
  address: string
): Promise<DuplicateCheckResponse | null> => {
  console.log("Checking business combination for:", { businessName, address });
  
  // Get all business profiles and check for matches
  const { data: businessProfiles, error: businessError } = await supabaseAdmin
    .from('profiles')
    .select('id, name, address, email, phone, type')
    .eq('type', 'business');

  console.log("All business profiles:", businessProfiles?.length, businessError);

  if (businessProfiles) {
    for (const profile of businessProfiles) {
      let matchCount = 0;
      const matches = [];

      // Check business name similarity (case insensitive)
      if (profile.name && businessName) {
        const profileNameLower = profile.name.toLowerCase().trim();
        const businessNameLower = businessName.toLowerCase().trim();
        if (profileNameLower.includes(businessNameLower) || businessNameLower.includes(profileNameLower)) {
          matchCount++;
          matches.push('business_name');
        }
      }

      // Check address match
      if (profile.address && address) {
        if (profile.address.toLowerCase().trim() === address.toLowerCase().trim()) {
          matchCount++;
          matches.push('address');
        }
      }

      // If we have 2 or more matches, this is likely the same business
      if (matchCount >= 2) {
        console.log("Found business combination match:", { profile, matches, matchCount });
        return {
          isDuplicate: true,
          duplicateType: 'business_combination',
          existingEmail: profile.email,
          existingPhone: profile.phone,
          existingAddress: profile.address,
          matchedFields: matches,
          allowContinue: false
        };
      }
    }
  }

  return null;
};

export const checkIndividualBusinessFields = async (
  supabaseAdmin: any,
  businessName?: string,
  address?: string
): Promise<DuplicateCheckResponse | null> => {
  // Check address duplicates within business accounts
  if (address) {
    const { data: addressProfile, error: addressError } = await supabaseAdmin
      .from('profiles')
      .select('id, address, email, name, type')
      .eq('address', address)
      .eq('type', 'business')
      .maybeSingle();

    console.log("Address check result (business accounts only):", { addressProfile, addressError });

    if (addressProfile) {
      return {
        isDuplicate: true,
        duplicateType: 'address',
        existingAddress: address,
        existingEmail: addressProfile.email,
        allowContinue: true
      };
    }
  }

  // Check business name duplicates within business accounts
  if (businessName) {
    const { data: businessProfile, error: businessError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, type')
      .ilike('name', `%${businessName}%`)
      .eq('type', 'business')
      .maybeSingle();

    console.log("Business name check result (business accounts only):", { businessProfile, businessError });

    if (businessProfile) {
      return {
        isDuplicate: true,
        duplicateType: 'business_name',
        existingEmail: businessProfile.email,
        allowContinue: true
      };
    }
  }

  return null;
};

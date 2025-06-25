
import { supabase } from "@/integrations/supabase/client";

export const fetchBusinessInfo = async (businessAuthorIds: string[]): Promise<Map<string, string>> => {
  const businessInfoMap = new Map<string, string>();
  
  if (businessAuthorIds.length === 0) {
    return businessInfoMap;
  }

  console.log('🏢 Fetching business info for IDs:', businessAuthorIds);
  
  const { data: businessData, error: businessError } = await supabase
    .from('business_info')
    .select('id, business_name')
    .in('id', businessAuthorIds);

  if (!businessError && businessData) {
    console.log('🏢 Business info retrieved:', businessData);
    businessData.forEach(business => {
      businessInfoMap.set(business.id, business.business_name);
    });
  } else {
    console.error('❌ Error fetching business info:', businessError);
  }

  return businessInfoMap;
};

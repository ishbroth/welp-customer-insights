
import { supabase } from "@/integrations/supabase/client";

export const openCustomerPortal = async () => {
  try {
    console.log("Opening customer portal...");
    
    const { data, error } = await supabase.functions.invoke("customer-portal");
    
    if (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
    
    if (data?.url) {
      console.log("Redirecting to customer portal:", data.url);
      window.open(data.url, '_blank');
    } else {
      throw new Error("No portal URL received");
    }
  } catch (error) {
    console.error("Failed to open customer portal:", error);
    throw error;
  }
};

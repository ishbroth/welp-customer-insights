
import React, { useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling one-time access functionality
 */
export const useAccessControl = (
  currentUser: User | null,
  oneTimeAccessResources: string[],
  setOneTimeAccessResources: React.Dispatch<React.SetStateAction<string[]>>
) => {
  // One-time access functions, using Supabase
  const hasOneTimeAccess = (resourceId: string): boolean => {
    // Check if the resourceId exists in the local state
    return oneTimeAccessResources.includes(resourceId);
  };
  
  const markOneTimeAccess = async (resourceId: string) => {
    if (!currentUser) return;
    
    try {
      // Store in Supabase - using customer_access table instead of one_time_access
      const { error } = await supabase
        .from('customer_access')
        .insert({
          business_id: currentUser.id,
          customer_id: resourceId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
        });
        
      if (error) {
        console.error("Error marking one-time access:", error);
      } else {
        // Update local state
        setOneTimeAccessResources(prev => [...prev, resourceId]);
      }
    } catch (error) {
      console.error("Error in markOneTimeAccess:", error);
    }
  };

  return {
    hasOneTimeAccess,
    markOneTimeAccess
  };
};

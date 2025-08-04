import React from 'react';
import { useMobilePushNotifications } from "@/hooks/useMobilePushNotifications";

/**
 * Wrapper component to initialize mobile features that depend on auth context
 */
const MobileInitializer: React.FC = () => {
  // This hook needs to be called inside AuthProvider context
  useMobilePushNotifications();
  
  // This component doesn't render anything visible
  return null;
};

export default MobileInitializer;
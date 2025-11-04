import React from 'react';

/**
 * Wrapper component for mobile initialization
 * Previously used for RevenueCat IAP - now disabled in favor of web-based Stripe payments
 */
const MobileInitializer: React.FC = () => {
  // No mobile-specific initialization needed - all payments go through web Stripe
  return null;
};

export default MobileInitializer;
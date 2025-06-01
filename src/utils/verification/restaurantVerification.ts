
import { VerificationResult } from './types';

/**
 * Verify a restaurant license
 */
export const verifyRestaurantLicense = (license: string, state: string): VerificationResult => {
  // State-specific restaurant license format validation
  if (state === "California" || state === "CA") {
    // California restaurant licenses have specific formats
    if (!/^\d{8}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid California restaurant license format. CA food establishment permits typically have 8 digits."
      };
    }
  } else if (state === "New York" || state === "NY") {
    // New York restaurant licenses have specific formats
    if (!/^\d{7}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid New York restaurant license format. NY permits typically have 7 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[A-Z0-9]{5,12}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid restaurant license format."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: `Food Service Establishment License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2025-09-30"
    }
  };
};

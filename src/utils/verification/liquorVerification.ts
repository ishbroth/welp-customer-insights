
import { VerificationResult } from './types';

/**
 * Verify a liquor license
 */
export const verifyLiquorLicense = (license: string, state: string): VerificationResult => {
  // State-specific liquor license format validation
  if (state === "California" || state === "CA") {
    // California liquor licenses typically have a specific format
    if (!/^[0-9]{6}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid California liquor license format. CA licenses typically have 6 digits."
      };
    }
  } else if (state === "New York" || state === "NY") {
    // New York liquor licenses often have specific formats
    if (!/^\d{8}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid New York liquor license format. NY licenses typically have 8 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[A-Z]{1,3}[0-9]{5,8}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid liquor license format. Please check your license number."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: `Liquor License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2025-06-30"
    }
  };
};

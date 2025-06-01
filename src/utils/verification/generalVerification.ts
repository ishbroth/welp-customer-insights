
import { VerificationResult } from './types';

/**
 * Verify a general business license
 */
export const verifyGeneralLicense = (license: string, state: string): VerificationResult => {
  // State-specific general license format validation (if any)
  if (license.length < 5) {
    return {
      verified: false,
      message: "License number seems too short. Please check your entry."
    };
  }
  
  // For demo purposes, verify any license that's not too short
  return {
    verified: true,
    details: {
      type: `Business License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2025-12-31"
    }
  };
};

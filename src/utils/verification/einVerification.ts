
import { VerificationResult } from './types';

/**
 * Verify an Employer Identification Number (EIN)
 */
export const verifyEIN = (ein: string): VerificationResult => {
  // Basic EIN format check (9 digits)
  if (!/^\d{9}$/.test(ein)) {
    return {
      verified: false,
      message: "Invalid EIN format. EINs must be 9 digits."
    };
  }
  
  // For demo purposes, verify any well-formatted EIN
  return {
    verified: true,
    details: {
      type: "Employer Identification Number",
      status: "Active",
      expirationDate: "N/A"
    }
  };
};

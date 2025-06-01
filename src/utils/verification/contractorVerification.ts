
import { VerificationResult } from './types';

/**
 * Verify a contractor license
 */
export const verifyContractorLicense = (license: string, state: string): VerificationResult => {
  // State-specific contractor license format validation
  if (state === "California" || state === "CA") {
    // California contractor licenses are typically 6-8 digits
    if (!/^\d{6,8}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid California contractor license format. CA licenses typically have 6-8 digits."
      };
    }
  } else if (state === "Texas" || state === "TX") {
    // Texas contractor licenses often start with TX followed by digits
    if (!/^(TX)?\d{6,10}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid Texas contractor license format."
      };
    }
  } else if (state === "Florida" || state === "FL") {
    // Florida contractor licenses typically have specific formats
    if (!/^(CBC|CCC|CFC|CGC|CRC)\d{6}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid Florida contractor license format. FL licenses typically start with CBC, CCC, CFC, CGC, or CRC followed by 6 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[A-Z0-9]{5,15}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid contractor license format."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: `Contractor License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2025-12-31"
    }
  };
};

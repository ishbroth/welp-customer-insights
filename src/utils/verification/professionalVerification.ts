
import { VerificationResult } from './types';

/**
 * Verify a bar association number
 */
export const verifyBarAssociation = (barNumber: string, state: string): VerificationResult => {
  // State-specific bar association number format validation
  if (state === "California" || state === "CA") {
    // California bar numbers are typically 6 digits
    if (!/^\d{6}$/.test(barNumber)) {
      return {
        verified: false,
        message: "Invalid California bar number format. CA bar numbers typically have 6 digits."
      };
    }
  } else if (state === "New York" || state === "NY") {
    // New York bar numbers have different formats
    if (!/^\d{7}$/.test(barNumber)) {
      return {
        verified: false,
        message: "Invalid New York bar number format. NY bar numbers typically have 7 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[0-9]{5,8}$/.test(barNumber)) {
      return {
        verified: false,
        message: "Invalid bar association number format."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted bar number
  return {
    verified: true,
    details: {
      type: `Attorney License (${state || 'Unknown State'})`,
      status: "Active Member",
      expirationDate: "2025-12-31"
    }
  };
};

/**
 * Verify a real estate license
 */
export const verifyRealEstateLicense = (license: string, state: string): VerificationResult => {
  // State-specific real estate license format validation
  if (state === "California" || state === "CA") {
    // California real estate licenses typically have specific formats
    if (!/^\d{6,8}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid California real estate license format. CA licenses typically have 6-8 digits."
      };
    }
  } else if (state === "Texas" || state === "TX") {
    // Texas real estate licenses have specific formats
    if (!/^\d{9}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid Texas real estate license format. TX licenses typically have 9 digits."
      };
    }
  } else if (state === "Florida" || state === "FL") {
    // Florida real estate licenses have specific formats
    if (!/^(BK|SL)\d{7}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid Florida real estate license format. FL licenses typically start with BK or SL followed by 7 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[0-9]{6,8}$|^[A-Z]{1,2}[0-9]{5,7}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid real estate license format."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: `Real Estate License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2026-03-31"
    }
  };
};

/**
 * Verify a medical license
 */
export const verifyMedicalLicense = (license: string, state: string): VerificationResult => {
  // State-specific medical license format validation
  if (state === "California" || state === "CA") {
    // California medical licenses typically have a specific format
    if (!/^[A-Z]\d{5,7}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid California medical license format. CA licenses typically have a letter followed by 5-7 digits."
      };
    }
  } else if (state === "New York" || state === "NY") {
    // New York medical licenses have specific formats
    if (!/^\d{6}$/.test(license)) {
      return {
        verified: false,
        message: "Invalid New York medical license format. NY licenses typically have 6 digits."
      };
    }
  } else {
    // General format for other states
    if (!/^[A-Z]{1,2}[0-9]{4,8}$/i.test(license)) {
      return {
        verified: false,
        message: "Invalid medical license format."
      };
    }
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: `Medical License (${state || 'Unknown State'})`,
      status: "Active",
      expirationDate: "2027-01-31"
    }
  };
};

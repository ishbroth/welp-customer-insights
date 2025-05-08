
// Mock business verification utility
// In a real application, this would connect to actual verification services

type VerificationResult = {
  verified: boolean;
  message?: string;
  details?: {
    type?: string;
    status?: string;
    expirationDate?: string;
  };
};

/**
 * Verify a business ID (license number or EIN)
 */
export const verifyBusinessId = async (
  businessId: string, 
  businessType: string = 'ein',
  state: string = ''
): Promise<VerificationResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Remove spaces, dashes, and other common separators
  const cleanId = businessId.replace(/[-\s]/g, '');

  // Check if the ID is empty
  if (!cleanId) {
    return {
      verified: false,
      message: "Please provide a valid identifier."
    };
  }

  // Route verification to the appropriate function based on business type
  switch(businessType) {
    case 'ein':
      return verifyEIN(cleanId);
    case 'contractor':
      return verifyContractorLicense(cleanId, state);
    case 'bar':
      return verifyLiquorLicense(cleanId, state);
    case 'attorney':
      return verifyBarAssociation(cleanId, state);
    case 'realtor':
      return verifyRealEstateLicense(cleanId, state);
    case 'medical':
      return verifyMedicalLicense(cleanId, state);
    case 'restaurant':
      return verifyRestaurantLicense(cleanId, state);
    default:
      return verifyGeneralLicense(cleanId, state);
  }
};

/**
 * Verify an Employer Identification Number (EIN)
 */
const verifyEIN = (ein: string): VerificationResult => {
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

/**
 * Verify a contractor license
 */
const verifyContractorLicense = (license: string, state: string): VerificationResult => {
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

/**
 * Verify a liquor license
 */
const verifyLiquorLicense = (license: string, state: string): VerificationResult => {
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

/**
 * Verify a bar association number
 */
const verifyBarAssociation = (barNumber: string, state: string): VerificationResult => {
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
const verifyRealEstateLicense = (license: string, state: string): VerificationResult => {
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
const verifyMedicalLicense = (license: string, state: string): VerificationResult => {
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

/**
 * Verify a restaurant license
 */
const verifyRestaurantLicense = (license: string, state: string): VerificationResult => {
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

/**
 * Verify a general business license
 */
const verifyGeneralLicense = (license: string, state: string): VerificationResult => {
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

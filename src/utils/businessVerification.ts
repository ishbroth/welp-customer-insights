
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
  businessType: string = 'ein'
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
      return verifyContractorLicense(cleanId);
    case 'bar':
      return verifyLiquorLicense(cleanId);
    case 'attorney':
      return verifyBarAssociation(cleanId);
    case 'realtor':
      return verifyRealEstateLicense(cleanId);
    case 'medical':
      return verifyMedicalLicense(cleanId);
    case 'restaurant':
      return verifyRestaurantLicense(cleanId);
    default:
      return verifyGeneralLicense(cleanId);
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
const verifyContractorLicense = (license: string): VerificationResult => {
  // Most contractor licenses have alphanumeric formats
  if (!/^[A-Z0-9]{5,15}$/i.test(license)) {
    return {
      verified: false,
      message: "Invalid contractor license format."
    };
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: "Contractor License",
      status: "Active",
      expirationDate: "2025-12-31"
    }
  };
};

/**
 * Verify a liquor license
 */
const verifyLiquorLicense = (license: string): VerificationResult => {
  // Most liquor licenses have a specific format with letters and numbers
  if (!/^[A-Z]{1,3}[0-9]{5,8}$/i.test(license)) {
    return {
      verified: false,
      message: "Invalid liquor license format. Please check your license number."
    };
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: "Liquor License",
      status: "Active",
      expirationDate: "2025-06-30"
    }
  };
};

/**
 * Verify a bar association number
 */
const verifyBarAssociation = (barNumber: string): VerificationResult => {
  // Bar numbers are usually numeric but can vary by state
  if (!/^[0-9]{5,8}$/.test(barNumber)) {
    return {
      verified: false,
      message: "Invalid bar association number format."
    };
  }
  
  // For demo purposes, verify any well-formatted bar number
  return {
    verified: true,
    details: {
      type: "Attorney License",
      status: "Active Member",
      expirationDate: "2025-12-31"
    }
  };
};

/**
 * Verify a real estate license
 */
const verifyRealEstateLicense = (license: string): VerificationResult => {
  // Real estate licenses usually have a specific format
  if (!/^[0-9]{6,8}$|^[A-Z]{1,2}[0-9]{5,7}$/i.test(license)) {
    return {
      verified: false,
      message: "Invalid real estate license format."
    };
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: "Real Estate License",
      status: "Active",
      expirationDate: "2026-03-31"
    }
  };
};

/**
 * Verify a medical license
 */
const verifyMedicalLicense = (license: string): VerificationResult => {
  // Medical licenses usually have a specific format
  if (!/^[A-Z]{1,2}[0-9]{4,8}$/i.test(license)) {
    return {
      verified: false,
      message: "Invalid medical license format."
    };
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: "Medical License",
      status: "Active",
      expirationDate: "2027-01-31"
    }
  };
};

/**
 * Verify a restaurant license
 */
const verifyRestaurantLicense = (license: string): VerificationResult => {
  // Restaurant licenses can vary but often have numbers with some letters
  if (!/^[A-Z0-9]{5,12}$/i.test(license)) {
    return {
      verified: false,
      message: "Invalid restaurant license format."
    };
  }
  
  // For demo purposes, verify any well-formatted license
  return {
    verified: true,
    details: {
      type: "Food Service Establishment License",
      status: "Active",
      expirationDate: "2025-09-30"
    }
  };
};

/**
 * Verify a general business license
 */
const verifyGeneralLicense = (license: string): VerificationResult => {
  // General business licenses can have various formats
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
      type: "Business License",
      status: "Active",
      expirationDate: "2025-12-31"
    }
  };
};

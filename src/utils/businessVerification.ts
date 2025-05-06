
// Function to verify business license information
// This is a mock function and should be replaced with a real API call to a license verification service
export const verifyBusinessLicense = async (
  license: {
    licenseType: string;
    license_number: string;  // Make sure we use snake_case to match the type
    businessName: string;
    expirationDate: string;
  }
) => {
  // Simulate a delay for API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification logic
  const isValid = license.license_number && 
                 license.license_number.length > 5 &&
                 new Date(license.expirationDate) > new Date();
  
  if (isValid) {
    return {
      verified: true,
      license_number: license.license_number,
      license_type: license.licenseType,
      license_status: "Active",
      license_expiration: license.expirationDate,
      business_name: license.businessName
    };
  } else {
    throw new Error("License verification failed");
  }
};

// Function to verify business ID (used in Signup.tsx and ProfileEdit.tsx)
export const verifyBusinessId = async (businessId: string) => {
  // Simulate a delay for API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification logic - in a real application this would call an external API
  const isValid = businessId && businessId.length > 5;
  
  // Demo validation - if businessId contains "Acme" or starts with "123", consider it valid
  const demoValidBusinessId = businessId.includes("Acme") || businessId.startsWith("123");
  
  if (isValid && demoValidBusinessId) {
    return {
      verified: true,
      message: "Business ID verified successfully",
      details: {
        type: "General Business License",
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      }
    };
  } else {
    return {
      verified: false,
      message: "Business ID verification failed. Please check your information and try again."
    };
  }
};

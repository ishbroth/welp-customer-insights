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

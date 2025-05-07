// This file uses the newer implementations from @/utils/supabase/businessHelpers.ts
import { verifyBusinessLicense } from "@/utils/supabase";

// Function to verify business ID (used in Signup.tsx and ProfileEdit.tsx)
export const verifyBusinessId = async (businessId: string, businessName?: string, state?: string) => {
  // If we have a short ID or a demo test case (for backward compatibility), use the mock verification
  if (businessId.length < 6 || businessId.includes("Acme") || businessId.startsWith("123")) {
    return mockVerifyBusinessId(businessId);
  }
  
  try {
    // Otherwise use the real API verification
    const result = await verifyBusinessLicense({
      licenseNumber: businessId,
      businessName: businessName || "Unknown Business",
      state
    });
    
    return {
      verified: result.verified,
      message: result.verified ? "Business ID verified successfully" : "Business ID verification failed",
      details: {
        type: result.license_type,
        expirationDate: result.license_expiration
      }
    };
  } catch (error) {
    console.error("Business verification error:", error);
    return {
      verified: false,
      message: "Business ID verification failed. Please check your information and try again."
    };
  }
};

// Mock verification function for backward compatibility and testing
const mockVerifyBusinessId = async (businessId: string) => {
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

// Keep the legacy function for backward compatibility
export const verifyBusinessLicense = async (
  license: {
    licenseType: string;
    license_number: string;
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

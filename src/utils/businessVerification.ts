
import { verifyBusiness } from "@/utils/supabaseHelpers";

interface VerificationResult {
  verified: boolean;
  message?: string;
  details?: Record<string, any>;
}

// This is a mock implementation of business ID verification
// In a real application, this would connect to actual verification APIs
export const verifyBusinessId = async (businessId: string, userId?: string): Promise<VerificationResult> => {
  console.log(`Verifying business ID: ${businessId}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock verification logic
  // In a real implementation, you would make API calls to business verification services
  
  // Check if the ID looks like an EIN (XX-XXXXXXX format)
  const einRegex = /^\d{2}-\d{7}$/;
  // Check if the ID looks like a business license (alphanumeric with possible dashes)
  const licenseRegex = /^[A-Z0-9]{5,15}(-[A-Z0-9]{1,5})?$/i;
  
  let result: VerificationResult;
  
  if (einRegex.test(businessId)) {
    // For demo purposes, verify only specific EINs
    if (['12-3456789', '98-7654321'].includes(businessId)) {
      result = {
        verified: true,
        message: "EIN verified successfully",
        details: {
          type: "EIN",
          registrationDate: "2020-01-15",
        }
      };
    } else {
      result = {
        verified: false,
        message: "EIN could not be verified in our database"
      };
    }
  } else if (licenseRegex.test(businessId)) {
    // For demo purposes, verify only specific license numbers
    if (['LIC123456', 'BUS789012', 'CONTR456'].includes(businessId.toUpperCase())) {
      result = {
        verified: true,
        message: "Business license verified successfully",
        details: {
          type: "Business License",
          expirationDate: "2025-12-31",
          status: "Active"
        }
      };
    } else {
      result = {
        verified: false,
        message: "Business license could not be verified"
      };
    }
  } else {
    result = {
      verified: false,
      message: "Invalid format. Please provide a valid EIN (XX-XXXXXXX) or business license number"
    };
  }
  
  // If verification is successful and we have a userId, update the business verification in Supabase
  if (result.verified && userId) {
    try {
      await verifyBusiness(userId, {
        licenseNumber: businessId,
        businessName: "Business Name", // This would come from form data in a real app
        licenseType: result.details?.type || "Business License",
        licenseStatus: "Active",
        licenseExpiration: result.details?.expirationDate || "2025-12-31"
      });
    } catch (error) {
      console.error("Error updating business verification status:", error);
      // We'll still return verification as successful since the check passed
    }
  }
  
  return result;
};

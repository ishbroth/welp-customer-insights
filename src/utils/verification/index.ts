
import { VerificationResult } from './types';
import { verifyLicenseWithStateDatabase } from '../realLicenseVerification';

/**
 * Verify a business ID (license number or EIN) with real verification only
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

  // Only attempt real verification - no mock fallback
  if (state && businessType !== 'ein') {
    try {
      console.log(`Attempting real verification for ${businessType} in ${state}`);
      const realResult = await verifyLicenseWithStateDatabase(cleanId, businessType, state);
      
      // Return the real verification result (success or failure)
      return realResult;
    } catch (error) {
      console.log('Real verification failed:', error);
      return {
        verified: false,
        message: "Unable to verify license automatically. Manual verification will be required.",
        isRealVerification: true
      };
    }
  }

  // For EINs, we don't have real verification available
  if (businessType === 'ein') {
    return {
      verified: false,
      message: "EIN verification requires manual review. Your account will be created and you can submit for manual verification.",
      isRealVerification: true
    };
  }

  // If no state provided or unsupported type
  return {
    verified: false,
    message: "Please provide your business state for license verification, or manual verification will be required.",
    isRealVerification: true
  };
};

// Re-export types for convenience
export type { VerificationResult } from './types';

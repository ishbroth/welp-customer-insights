
import { VerificationResult } from './types';
import { verifyLicenseWithStateDatabase } from '../realLicenseVerification';
import { verifyEIN } from './einVerification';
import { verifyContractorLicense } from './contractorVerification';
import { verifyLiquorLicense } from './liquorVerification';
import { verifyBarAssociation, verifyRealEstateLicense, verifyMedicalLicense } from './professionalVerification';
import { verifyRestaurantLicense } from './restaurantVerification';
import { verifyGeneralLicense } from './generalVerification';

/**
 * Verify a business ID (license number or EIN) with enhanced real verification
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

  // First try real verification for supported states and license types
  if (state && businessType !== 'ein') {
    try {
      console.log(`Attempting real verification for ${businessType} in ${state}`);
      const realResult = await verifyLicenseWithStateDatabase(cleanId, businessType, state);
      
      // If real verification succeeded or failed definitively, return that result
      if (realResult.isRealVerification) {
        return realResult;
      }
    } catch (error) {
      console.log('Real verification failed, falling back to mock verification:', error);
      // Continue to mock verification if real verification fails
    }
  }

  // Fall back to mock verification for EINs and unsupported states
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

// Re-export types for convenience
export type { VerificationResult } from './types';

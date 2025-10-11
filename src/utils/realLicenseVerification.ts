import { VerificationResult } from './verification/types';
import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('realLicenseVerification');

// California verification functions
const verifyCalifornia = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying California ${licenseType} license: ${licenseNumber}`);
    
    // California Department of Consumer Affairs - Professional License Lookup
    const response = await fetch(`https://search.dca.ca.gov/details/${licenseNumber}/${licenseType}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LicenseVerification/1.0)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.status && data.status.toLowerCase() === 'active') {
        return {
          verified: true,
          message: "California license verified successfully",
          isRealVerification: true,
          details: {
            state: 'California',
            licenseNumber,
            status: data.status,
            expirationDate: data.expirationDate,
            issuingAuthority: 'California Department of Consumer Affairs'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify California license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('California license verification error:', error);
    throw error;
  }
};

// Texas verification functions
const verifyTexasRealEstate = async (licenseNumber: string): Promise<VerificationResult> => {
  try {
    const response = await fetch(`https://www.trec.texas.gov/apps/license-holder-search/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `license_number=${encodeURIComponent(licenseNumber)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE')) {
        return {
          verified: true,
          message: "Texas real estate license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Texas',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Texas Real Estate Commission'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Texas real estate license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Texas real estate license verification error:', error);
    throw error;
  }
};

const verifyTexasLiquor = async (licenseNumber: string): Promise<VerificationResult> => {
  try {
    const response = await fetch(`https://www.tabc.texas.gov/licensing/license-lookup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `license_number=${encodeURIComponent(licenseNumber)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE')) {
        return {
          verified: true,
          message: "Texas liquor license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Texas',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Texas Alcoholic Beverage Commission'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Texas liquor license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Texas liquor license verification error:', error);
    throw error;
  }
};

const verifyTexasLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying Texas ${licenseType} license: ${licenseNumber}`);
    
    switch (licenseType.toLowerCase()) {
      case 'real_estate':
      case 'realtor':
        return await verifyTexasRealEstate(licenseNumber);
      
      case 'liquor':
      case 'bar':
      case 'restaurant':
        return await verifyTexasLiquor(licenseNumber);
      
      default:
        // Generic Texas professional license lookup
        const response = await fetch(`https://vo.ras.texas.gov/datamart/selSearchType.do`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `licenseNumber=${encodeURIComponent(licenseNumber)}`
        });

        if (response.ok) {
          const text = await response.text();
          if (text.includes('Active') || text.includes('ACTIVE')) {
            return {
              verified: true,
              message: "Texas license verified successfully",
              isRealVerification: true,
              details: {
                state: 'Texas',
                licenseNumber,
                status: 'Active',
                issuingAuthority: 'Texas Department of Licensing and Regulation'
              }
            };
          }
        }
        break;
    }

    return {
      verified: false,
      message: "Could not verify Texas license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Texas license verification error:', error);
    throw error;
  }
};

// Florida verification functions
const verifyFloridaLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying Florida ${licenseType} license: ${licenseNumber}`);
    
    // Florida Department of Business and Professional Regulation
    const response = await fetch(`https://www.myfloridalicense.com/CheckLicenseII/LicenseDetail.asp?SID=&id=${encodeURIComponent(licenseNumber)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; LicenseVerification/1.0)'
      }
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE') || text.includes('Current')) {
        return {
          verified: true,
          message: "Florida license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Florida',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Florida Department of Business and Professional Regulation'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Florida license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Florida license verification error:', error);
    throw error;
  }
};

// New York verification functions
const verifyNewYorkLiquorLicense = async (licenseNumber: string): Promise<VerificationResult> => {
  try {
    const response = await fetch(`https://www.sla.ny.gov/online-services-bureau-licensing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `license_number=${encodeURIComponent(licenseNumber)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE')) {
        return {
          verified: true,
          message: "New York liquor license verified successfully",
          isRealVerification: true,
          details: {
            state: 'New York',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'New York State Liquor Authority'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify New York liquor license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('New York liquor license verification error:', error);
    throw error;
  }
};

const verifyNewYorkLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying New York ${licenseType} license: ${licenseNumber}`);
    
    switch (licenseType.toLowerCase()) {
      case 'liquor':
      case 'bar':
      case 'restaurant':
        return await verifyNewYorkLiquorLicense(licenseNumber);
      
      case 'medical':
      case 'doctor':
      case 'physician':
        // New York Department of Health professional lookup
        const response = await fetch(`https://www.health.ny.gov/professionals/doctors/conduct/lookup.htm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `license_number=${encodeURIComponent(licenseNumber)}`
        });

        if (response.ok) {
          const text = await response.text();
          if (text.includes('Active') || text.includes('ACTIVE')) {
            return {
              verified: true,
              message: "New York medical license verified successfully",
              isRealVerification: true,
              details: {
                state: 'New York',
                licenseNumber,
                status: 'Active',
                issuingAuthority: 'New York Department of Health'
              }
            };
          }
        }
        break;
        
      default:
        // Generic New York professional license lookup
        return {
          verified: false,
          message: "New York license verification not available for this license type",
          isRealVerification: true
        };
    }

    return {
      verified: false,
      message: "Could not verify New York license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('New York license verification error:', error);
    throw error;
  }
};

// Illinois verification functions
const verifyIllinoisLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying Illinois ${licenseType} license: ${licenseNumber}`);
    
    // Illinois Department of Financial and Professional Regulation
    const response = await fetch(`https://www.idfpr.com/LicenseLookup/LicenseLookup.asp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `LicenseNumber=${encodeURIComponent(licenseNumber)}&LicenseType=${encodeURIComponent(licenseType)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE') || text.includes('Current')) {
        return {
          verified: true,
          message: "Illinois license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Illinois',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Illinois Department of Financial and Professional Regulation'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Illinois license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Illinois license verification error:', error);
    throw error;
  }
};

// Pennsylvania verification functions
const verifyPennsylvaniaLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying Pennsylvania ${licenseType} license: ${licenseNumber}`);
    
    // Pennsylvania Department of State - Professional Licensing
    const response = await fetch(`https://www.licensepa.state.pa.us/CheckLicense.aspx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `LicenseNumber=${encodeURIComponent(licenseNumber)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE') || text.includes('Current')) {
        return {
          verified: true,
          message: "Pennsylvania license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Pennsylvania',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Pennsylvania Department of State'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Pennsylvania license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Pennsylvania license verification error:', error);
    throw error;
  }
};

// Ohio verification functions
const verifyOhioLicense = async (licenseNumber: string, licenseType: string): Promise<VerificationResult> => {
  try {
    utilLogger.info(`Verifying Ohio ${licenseType} license: ${licenseNumber}`);
    
    // Ohio Department of Commerce - Professional Licensing
    const response = await fetch(`https://elicense.ohio.gov/Lookup/LicenseLookup.aspx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `LicenseNumber=${encodeURIComponent(licenseNumber)}`
    });

    if (response.ok) {
      const text = await response.text();
      if (text.includes('Active') || text.includes('ACTIVE') || text.includes('Current')) {
        return {
          verified: true,
          message: "Ohio license verified successfully",
          isRealVerification: true,
          details: {
            state: 'Ohio',
            licenseNumber,
            status: 'Active',
            issuingAuthority: 'Ohio Department of Commerce'
          }
        };
      }
    }

    return {
      verified: false,
      message: "Could not verify Ohio license",
      isRealVerification: true
    };
  } catch (error) {
    utilLogger.error('Ohio license verification error:', error);
    throw error;
  }
};

// Main verification function that routes to state-specific verifiers
export const verifyLicenseWithStateDatabase = async (
  licenseNumber: string,
  licenseType: string,
  state: string
): Promise<VerificationResult> => {
  const normalizedState = state.toLowerCase().trim();

  utilLogger.info(`Real license verification initiated for ${normalizedState}`);
  utilLogger.debug(`License: ${licenseNumber}, Type: ${licenseType}`);
  
  try {
    switch (normalizedState) {
      case 'california':
      case 'ca':
        return await verifyCalifornia(licenseNumber, licenseType);
      
      case 'texas':
      case 'tx':
        return await verifyTexasLicense(licenseNumber, licenseType);
      
      case 'florida':
      case 'fl':
        return await verifyFloridaLicense(licenseNumber, licenseType);
      
      case 'new york':
      case 'ny':
        return await verifyNewYorkLicense(licenseNumber, licenseType);
      
      case 'illinois':
      case 'il':
        return await verifyIllinoisLicense(licenseNumber, licenseType);
      
      case 'pennsylvania':
      case 'pa':
        return await verifyPennsylvaniaLicense(licenseNumber, licenseType);
      
      case 'ohio':
      case 'oh':
        return await verifyOhioLicense(licenseNumber, licenseType);
      
      default:
        utilLogger.warn(`Real verification not available for state: ${state}`);
        return {
          verified: false,
          message: `Real-time license verification is not yet available for ${state}. Manual verification will be required.`,
          isRealVerification: true
        };
    }
  } catch (error) {
    utilLogger.error(`Real verification failed for ${state}:`, error);
    throw new Error(`License verification failed for ${state}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

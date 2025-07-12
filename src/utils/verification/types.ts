
export type VerificationResult = {
  verified: boolean;
  message?: string;
  details?: {
    type?: string;
    status?: string;
    expirationDate?: string;
    businessName?: string;
    issuingAuthority?: string;
    state?: string;
    licenseNumber?: string;
  };
  isRealVerification?: boolean;
};

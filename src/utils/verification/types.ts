
export type VerificationResult = {
  verified: boolean;
  message?: string;
  details?: {
    type?: string;
    status?: string;
    expirationDate?: string;
    businessName?: string;
    issuingAuthority?: string;
  };
  isRealVerification?: boolean;
};

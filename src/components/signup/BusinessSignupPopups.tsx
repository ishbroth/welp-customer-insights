
import VerificationSuccessPopup from "./VerificationSuccessPopup";
import AccountCreatedPopup from "./AccountCreatedPopup";

interface BusinessSignupPopupsProps {
  realVerificationDetails: any;
  showAccountCreatedPopup: boolean;
  setShowAccountCreatedPopup: (show: boolean) => void;
  createdBusinessData: any;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
}

export const BusinessSignupPopups = ({
  realVerificationDetails,
  showAccountCreatedPopup,
  setShowAccountCreatedPopup,
  createdBusinessData,
  businessPhone,
  setBusinessPhone
}: BusinessSignupPopupsProps) => {
  return (
    <>
      {realVerificationDetails && (
        <VerificationSuccessPopup
          isOpen={!!realVerificationDetails}
          businessName={realVerificationDetails.businessName}
          verificationDetails={realVerificationDetails.verificationDetails}
        />
      )}

      {showAccountCreatedPopup && createdBusinessData && (
        <AccountCreatedPopup
          isOpen={showAccountCreatedPopup}
          onClose={() => setShowAccountCreatedPopup(false)}
          businessName={createdBusinessData.businessName || createdBusinessData.name}
          businessPhone={businessPhone}
          setBusinessPhone={setBusinessPhone}
          businessData={createdBusinessData}
        />
      )}
    </>
  );
};

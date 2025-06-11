
import { useState } from "react";

export const useBusinessFormState = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZipCode, setBusinessZipCode] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessType, setBusinessType] = useState("ein");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");
  const [businessConfirmPassword, setBusinessConfirmPassword] = useState("");
  const [hasDuplicates, setHasDuplicates] = useState(false);

  return {
    businessName,
    setBusinessName,
    businessStreet,
    setBusinessStreet,
    businessCity,
    setBusinessCity,
    businessState,
    setBusinessState,
    businessZipCode,
    setBusinessZipCode,
    businessPhone,
    setBusinessPhone,
    businessType,
    setBusinessType,
    licenseNumber,
    setLicenseNumber,
    businessEmail,
    setBusinessEmail,
    businessPassword,
    setBusinessPassword,
    businessConfirmPassword,
    setBusinessConfirmPassword,
    hasDuplicates,
    setHasDuplicates
  };
};

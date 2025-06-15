
import { useState } from "react";

export const useCustomerSignupState = () => {
  // Customer form state
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEmailError, setExistingEmailError] = useState(false);

  return {
    customerFirstName,
    setCustomerFirstName,
    customerLastName,
    setCustomerLastName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    customerStreet,
    setCustomerStreet,
    customerCity,
    setCustomerCity,
    customerState,
    setCustomerState,
    customerZipCode,
    setCustomerZipCode,
    customerPassword,
    setCustomerPassword,
    customerConfirmPassword,
    setCustomerConfirmPassword,
    isSubmitting,
    setIsSubmitting,
    existingEmailError,
    setExistingEmailError
  };
};

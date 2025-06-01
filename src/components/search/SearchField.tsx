
import React from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";
import { PhoneInput } from "@/components/ui/phone-input";

interface SearchFieldProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required: boolean;
}

const SearchField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  required
}: SearchFieldProps) => {
  // Use FirstNameInput for first name fields
  const isFirstNameField = placeholder.toLowerCase().includes("first name");
  
  // Use PhoneInput for phone fields
  const isPhoneField = placeholder.toLowerCase().includes("phone") || type === "tel";
  
  // Handle address field restrictions
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAddressField = placeholder.toLowerCase().includes("address") || 
                          placeholder.toLowerCase().includes("street");
    
    if (isAddressField) {
      let value = e.target.value;
      // Remove commas and stop input after first comma
      const commaIndex = value.indexOf(',');
      if (commaIndex !== -1) {
        value = value.substring(0, commaIndex);
        e.target.value = value;
      }
    }
    
    onChange(e);
  };
  
  if (isFirstNameField) {
    return (
      <FirstNameInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleAddressChange}
        className={`welp-input ${className || ""}`}
        required={required}
      />
    );
  }

  if (isPhoneField) {
    return (
      <PhoneInput
        placeholder={placeholder}
        value={value}
        onChange={handleAddressChange}
        className={`welp-input ${className || ""}`}
        required={required}
      />
    );
  }

  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleAddressChange}
      className={`welp-input ${className || ""}`}
      required={required}
    />
  );
};

export default SearchField;


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

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    // Create a synthetic event to maintain consistency
    const syntheticEvent = {
      target: { value }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };
  
  if (isFirstNameField) {
    return (
      <FirstNameInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
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
        onChange={handlePhoneChange}
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
      onChange={onChange}
      className={`welp-input ${className || ""}`}
      required={required}
    />
  );
};

export default SearchField;

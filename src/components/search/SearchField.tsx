
import React from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";

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

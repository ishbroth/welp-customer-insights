
import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FirstNameInput } from "@/components/ui/first-name-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { logger } from '@/utils/logger';

interface SearchFieldProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required: boolean;
  onAddressComponentsExtracted?: (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

const SearchField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  required,
  onAddressComponentsExtracted
}: SearchFieldProps) => {
  const componentLogger = useMemo(() => logger.withContext('SearchField'), []);

  // Use FirstNameInput for first name fields
  const isFirstNameField = placeholder.toLowerCase().includes("first name");

  // Use PhoneInput for phone fields
  const isPhoneField = placeholder.toLowerCase().includes("phone") || type === "tel";

  // Use AddressAutocomplete for address fields
  const isAddressField = placeholder.toLowerCase().includes("address") ||
                        placeholder.toLowerCase().includes("street");

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    // Create a synthetic event to maintain consistency
    const syntheticEvent = {
      target: { value }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle address autocomplete change - no normalization during typing
  const handleAddressAutocompleteChange = (address: string) => {
    componentLogger.debug('Address changed to:', address);
    // Create a synthetic event to maintain consistency
    const syntheticEvent = {
      target: { value: address }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Handle place selection from Google Maps
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    componentLogger.debug('Place selected:', place);
  };

  // Handle address components extraction - CRITICAL CALLBACK
  const handleAddressComponentsExtracted = (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    componentLogger.debug('Components extracted, MUST forward to parent:', components);
    if (onAddressComponentsExtracted) {
      componentLogger.debug('FORWARDING components to parent');
      onAddressComponentsExtracted(components);
    } else {
      componentLogger.warn('onAddressComponentsExtracted callback is MISSING!');
    }
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

  if (isAddressField) {
    return (
      <AddressAutocomplete
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onAddressChange={handleAddressAutocompleteChange}
        onPlaceSelect={handlePlaceSelect}
        onAddressComponentsExtracted={handleAddressComponentsExtracted}
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

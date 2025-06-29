
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGoogleMapsInit } from "@/hooks/useGoogleMapsInit";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { getPlaceholder, getStatusIndicator } from "@/utils/addressAutocompleteUI";
import { AddressComponents } from "@/utils/addressExtraction";

interface AddressAutocompleteProps extends React.ComponentProps<"input"> {
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onAddressChange?: (address: string) => void;
  onAddressComponentsExtracted?: (components: AddressComponents) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, onPlaceSelect, onAddressChange, onAddressComponentsExtracted, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(props.value || "");
    
    const { isGoogleReady, googleMapsStatus } = useGoogleMapsInit();
    
    usePlacesAutocomplete({
      isGoogleReady,
      inputRef,
      onPlaceSelect,
      onAddressChange,
      onAddressComponentsExtracted,
      setInputValue
    });

    useEffect(() => {
      if (props.value !== undefined && props.value !== inputValue) {
        setInputValue(props.value as string);
      }
    }, [props.value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Allow completely unrestricted typing - no modifications at all
      setInputValue(value);
      
      // Call callbacks without any modification
      onAddressChange?.(value);
      onChange?.(e);
    };

    console.log(`AddressAutocomplete status: ${googleMapsStatus}, Google ready: ${isGoogleReady}`);

    return (
      <div className="relative">
        <Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn(className)}
          placeholder={getPlaceholder(googleMapsStatus)}
          value={inputValue}
          onChange={handleInputChange}
          {...props}
        />
        {/* Status indicator in the corner */}
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs opacity-50 pointer-events-none">
          {getStatusIndicator(googleMapsStatus)}
        </span>
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };

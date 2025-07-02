
import React, { useEffect, useRef, useState, useCallback } from "react";
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
    
    // Memoize the callback handlers to prevent useEffect recreation in usePlacesAutocomplete
    const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
      console.log('🏠 AddressAutocomplete - Place selected callback triggered');
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    }, [onPlaceSelect]);

    const handleAddressChange = useCallback((address: string) => {
      console.log('🏠 AddressAutocomplete - Address changed callback triggered, address:', address);
      if (onAddressChange) {
        onAddressChange(address);
      }
    }, [onAddressChange]);

    const handleAddressComponentsExtracted = useCallback((components: AddressComponents) => {
      console.log('🏠 AddressAutocomplete - Components extracted callback triggered:', components);
      if (onAddressComponentsExtracted) {
        console.log('🏠 AddressAutocomplete - Successfully forwarding components to parent');
        onAddressComponentsExtracted(components);
      } else {
        console.log('❌ CRITICAL: AddressAutocomplete - onAddressComponentsExtracted callback is MISSING!');
      }
    }, [onAddressComponentsExtracted]);

    const handleSetInputValue = useCallback((value: string) => {
      console.log('🏠 AddressAutocomplete - setInputValue called with:', value);
      console.log('🏠 AddressAutocomplete - Current inputValue before update:', inputValue);
      setInputValue(value);
      console.log('🏠 AddressAutocomplete - setInputValue completed');
    }, [inputValue]);
    
    usePlacesAutocomplete({
      isGoogleReady,
      inputRef,
      onPlaceSelect: handlePlaceSelect,
      onAddressChange: handleAddressChange,
      onAddressComponentsExtracted: handleAddressComponentsExtracted,
      setInputValue: handleSetInputValue
    });

    useEffect(() => {
      console.log('🏠 AddressAutocomplete - props.value useEffect:', props.value, 'vs inputValue:', inputValue);
      if (props.value !== undefined && props.value !== inputValue) {
        console.log('🏠 AddressAutocomplete - Updating inputValue from props:', props.value);
        setInputValue(props.value as string);
      }
    }, [props.value, inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      console.log('🏠 AddressAutocomplete - Manual input change:', value);
      
      // Allow unrestricted typing for manual entry
      setInputValue(value);
      
      // Call callbacks for manual typing
      if (onAddressChange) {
        console.log('🏠 AddressAutocomplete - Calling onAddressChange for manual input:', value);
        onAddressChange(value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    console.log(`🏠 AddressAutocomplete render - status: ${googleMapsStatus}, Google ready: ${isGoogleReady}, inputValue: "${inputValue}"`);

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

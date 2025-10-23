
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGoogleMapsInit } from "@/hooks/useGoogleMapsInit";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { getPlaceholder, getStatusIndicator } from "@/utils/addressAutocompleteUI";
import { AddressComponents } from "@/utils/addressExtraction";
import { logger } from '@/utils/logger';

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
    const componentLogger = useMemo(() => logger.withContext('AddressAutocomplete'), []);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(props.value || "");
    const isAutocompletingRef = useRef(false);

    const { isGoogleReady, googleMapsStatus } = useGoogleMapsInit();
    
    // Memoize the callback handlers to prevent useEffect recreation in usePlacesAutocomplete
    const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
      componentLogger.debug('Place selected callback triggered');
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    }, [onPlaceSelect, componentLogger]);

    const handleAddressChange = useCallback((address: string) => {
      componentLogger.debug('Address changed callback triggered', { address });
      if (onAddressChange) {
        onAddressChange(address);
      }
    }, [onAddressChange, componentLogger]);

    const handleAddressComponentsExtracted = useCallback((components: AddressComponents) => {
      componentLogger.debug('Components extracted callback triggered', { components });
      if (onAddressComponentsExtracted) {
        componentLogger.debug('Successfully forwarding components to parent');
        onAddressComponentsExtracted(components);
      } else {
        componentLogger.error('CRITICAL: onAddressComponentsExtracted callback is MISSING!');
      }
    }, [onAddressComponentsExtracted, componentLogger]);

    const handleSetInputValue = useCallback((value: string) => {
      componentLogger.debug('setInputValue called from autocomplete', { value });
      // Set flag to prevent onChange from updating parent
      isAutocompletingRef.current = true;
      setInputValue(value);
      // Reset flag after a short delay to allow normal typing again
      setTimeout(() => {
        isAutocompletingRef.current = false;
      }, 100);
      componentLogger.debug('setInputValue completed');
    }, [componentLogger]);
    
    usePlacesAutocomplete({
      isGoogleReady,
      inputRef,
      onPlaceSelect: handlePlaceSelect,
      onAddressChange: handleAddressChange,
      onAddressComponentsExtracted: handleAddressComponentsExtracted,
      setInputValue: handleSetInputValue
    });

    useEffect(() => {
      componentLogger.debug('props.value useEffect', { propsValue: props.value, currentInputValue: inputValue });
      if (props.value !== undefined && props.value !== inputValue) {
        componentLogger.debug('Updating inputValue from props', { propsValue: props.value });
        setInputValue(props.value as string);
      }
    }, [props.value, componentLogger]); // Don't include inputValue to avoid fighting with autocomplete

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      componentLogger.debug('Input change event', { value, isAutocompleting: isAutocompletingRef.current });

      // Always update local input value
      setInputValue(value);

      // Don't call parent callbacks if this is an autocomplete-initiated change
      if (isAutocompletingRef.current) {
        componentLogger.debug('Skipping callbacks - autocomplete in progress');
        return;
      }

      // Call callbacks for manual typing only
      if (onAddressChange) {
        componentLogger.debug('Calling onAddressChange for manual input', { value });
        onAddressChange(value);
      }
      if (onChange) {
        componentLogger.debug('Calling onChange for manual input');
        onChange(e);
      }
    };

    componentLogger.debug('AddressAutocomplete render', {
      status: googleMapsStatus,
      isGoogleReady,
      inputValue
    });

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

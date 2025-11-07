import React, { useRef, useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGoogleMapsInit } from "@/hooks/useGoogleMapsInit";
import { useCityAutocomplete } from "@/hooks/useCityAutocomplete";
import { getPlaceholder, getStatusIndicator } from "@/utils/addressAutocompleteUI";
import { logger } from '@/utils/logger';

interface CityAutocompleteProps extends React.ComponentProps<"input"> {
  onCitySelect?: (city: string, state?: string) => void;
  onCityChange?: (city: string) => void;
}

const CityAutocomplete = React.forwardRef<HTMLInputElement, CityAutocompleteProps>(
  ({ className, onCitySelect, onCityChange, onChange, ...props }, ref) => {
    const componentLogger = useMemo(() => logger.withContext('CityAutocomplete'), []);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(props.value || "");
    const isAutocompletingRef = useRef(false);

    const { isGoogleReady, googleMapsStatus } = useGoogleMapsInit();

    // Memoize the callback handlers
    const handleCitySelect = useCallback((city: string, state?: string) => {
      componentLogger.debug('City selected callback triggered', { city, state });
      if (onCitySelect) {
        onCitySelect(city, state);
      }
    }, [onCitySelect, componentLogger]);

    const handleSetInputValue = useCallback((value: string) => {
      componentLogger.debug('setInputValue called from autocomplete', { value });
      // Set flag to prevent onChange from updating parent
      isAutocompletingRef.current = true;
      setInputValue(value);
      // Reset flag after a short delay
      setTimeout(() => {
        isAutocompletingRef.current = false;
      }, 100);
      componentLogger.debug('setInputValue completed');
    }, [componentLogger]);

    useCityAutocomplete({
      isGoogleReady,
      inputRef,
      onCitySelect: handleCitySelect,
      setInputValue: handleSetInputValue
    });

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
      if (onCityChange) {
        componentLogger.debug('Calling onCityChange for manual input', { value });
        onCityChange(value);
      }
      if (onChange) {
        componentLogger.debug('Calling onChange for manual input');
        onChange(e);
      }
    };

    componentLogger.debug('CityAutocomplete render', {
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
          placeholder={googleMapsStatus === 'ready' ? "Start typing city name..." : getPlaceholder(googleMapsStatus)}
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

CityAutocomplete.displayName = "CityAutocomplete";

export { CityAutocomplete };

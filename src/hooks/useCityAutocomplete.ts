import { useEffect, useRef, useCallback, useMemo } from "react";
import { logger } from '@/utils/logger';

interface UseCityAutocompleteProps {
  isGoogleReady: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onCitySelect?: (city: string, state?: string) => void;
  setInputValue: (value: string) => void;
}

export const useCityAutocomplete = ({
  isGoogleReady,
  inputRef,
  onCitySelect,
  setInputValue
}: UseCityAutocompleteProps) => {
  const hookLogger = useMemo(() => logger.withContext('useCityAutocomplete'), []);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Create stable callback refs to avoid useEffect recreation
  const onCitySelectRef = useRef(onCitySelect);
  const setInputValueRef = useRef(setInputValue);

  // Update refs when props change
  useEffect(() => {
    onCitySelectRef.current = onCitySelect;
    setInputValueRef.current = setInputValue;
  });

  // Stable place change handler
  const handlePlaceChanged = useCallback(() => {
    hookLogger.debug('handlePlaceChanged - STARTING');

    if (!autocompleteRef.current) {
      hookLogger.debug('No autocomplete instance available');
      return;
    }

    const place = autocompleteRef.current.getPlace();

    hookLogger.debug('handlePlaceChanged - Place object:', {
      hasPlace: !!place,
      formatted_address: place?.formatted_address,
      hasAddressComponents: !!place?.address_components,
      addressComponentsLength: place?.address_components?.length
    });

    if (place && place.address_components) {
      hookLogger.debug('Place selected:', place.formatted_address);
      hookLogger.debug('Address components:', place.address_components);

      try {
        // Extract city and state from address components
        let city = '';
        let state = '';

        for (const component of place.address_components) {
          const types = component.types;

          // Get city (locality)
          if (types.includes('locality')) {
            city = component.long_name;
          }

          // Get state (administrative_area_level_1)
          if (types.includes('administrative_area_level_1')) {
            state = component.short_name; // Use short name for state abbreviation
          }
        }

        hookLogger.debug('Extracted city:', city, 'state:', state);

        // Set input value to city name only
        if (city && setInputValueRef.current) {
          setInputValueRef.current(city);
          hookLogger.debug('setInputValue called with city:', city);
        }

        // Call callback with city and state
        if (onCitySelectRef.current && city) {
          hookLogger.debug('CALLING onCitySelect with:', { city, state });
          onCitySelectRef.current(city, state);
          hookLogger.debug('onCitySelect called successfully');
        }

        hookLogger.debug('handlePlaceChanged - COMPLETED SUCCESSFULLY');
      } catch (error) {
        hookLogger.error('Error extracting city:', error);
        // Fallback: use formatted_address
        const fallbackCity = place.formatted_address?.split(',')[0] || '';
        hookLogger.debug('Using fallback city:', fallbackCity);
        if (setInputValueRef.current) {
          setInputValueRef.current(fallbackCity);
        }
      }
    } else {
      hookLogger.debug('Place selected but missing required data:', {
        hasPlace: !!place,
        hasComponents: !!place?.address_components
      });
    }
  }, [hookLogger]);

  useEffect(() => {
    hookLogger.debug('useCityAutocomplete useEffect triggered, isGoogleReady:', isGoogleReady);

    if (!isGoogleReady || !inputRef.current) {
      hookLogger.debug('Google not ready or no input ref, skipping initialization');
      return;
    }

    // Check if Google Maps and Places are properly loaded
    if (!window.google?.maps?.places?.Autocomplete) {
      hookLogger.debug('Google Places not ready yet, will retry...');
      return;
    }

    try {
      hookLogger.debug('Setting up Google Places Autocomplete for cities...');

      // Clean up existing instance and listener
      if (listenerRef.current) {
        hookLogger.debug('Cleaning up existing listener');
        try {
          window.google.maps.event.removeListener(listenerRef.current);
        } catch (e) {
          hookLogger.debug('Error cleaning up listener:', e);
        }
        listenerRef.current = null;
      }

      if (autocompleteRef.current) {
        hookLogger.debug('Cleaning up existing autocomplete instance');
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          hookLogger.debug('Error cleaning up autocomplete:', e);
        }
        autocompleteRef.current = null;
      }

      // Create new autocomplete instance for cities only
      hookLogger.debug('Creating new city autocomplete instance');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'], // Restrict to cities only
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address']
      });

      hookLogger.info('Google Places City Autocomplete initialized successfully');

      // Add the place changed listener
      hookLogger.debug('Adding place_changed listener');
      listenerRef.current = autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      hookLogger.debug('place_changed listener added successfully');

    } catch (error) {
      hookLogger.error('Error initializing Google Places City Autocomplete:', error);
    }

    // Cleanup function
    return () => {
      hookLogger.debug('Cleanup function called');
      if (listenerRef.current) {
        try {
          window.google.maps.event.removeListener(listenerRef.current);
        } catch (e) {
          hookLogger.debug('Error in cleanup:', e);
        }
        listenerRef.current = null;
      }
    };
  }, [isGoogleReady, handlePlaceChanged, hookLogger]);

  return { autocompleteRef };
};

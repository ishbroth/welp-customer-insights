
import { useEffect, useRef, useCallback } from "react";
import { extractAddressComponents, AddressComponents } from "@/utils/addressExtraction";
import { logger } from '@/utils/logger';

interface UsePlacesAutocompleteProps {
  isGoogleReady: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onAddressChange?: (address: string) => void;
  onAddressComponentsExtracted?: (components: AddressComponents) => void;
  setInputValue: (value: string) => void;
}

export const usePlacesAutocomplete = ({
  isGoogleReady,
  inputRef,
  onPlaceSelect,
  onAddressChange,
  onAddressComponentsExtracted,
  setInputValue
}: UsePlacesAutocompleteProps) => {
  const hookLogger = logger.withContext('usePlacesAutocomplete');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Create stable callback refs to avoid useEffect recreation
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onAddressChangeRef = useRef(onAddressChange);
  const onAddressComponentsExtractedRef = useRef(onAddressComponentsExtracted);
  const setInputValueRef = useRef(setInputValue);

  // Update refs when props change
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    onAddressChangeRef.current = onAddressChange;
    onAddressComponentsExtractedRef.current = onAddressComponentsExtracted;
    setInputValueRef.current = setInputValue;
  });

  // Stable place change handler that doesn't change on every render
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

    if (place && place.formatted_address && place.address_components) {
      hookLogger.debug('Place selected:', place.formatted_address);
      hookLogger.debug('Address components:', place.address_components);

      try {
        hookLogger.debug('CALLING extractAddressComponents...');
        const components = extractAddressComponents(place);
        hookLogger.debug('EXTRACTED components:', components);

        // CRITICAL: Set the input value to ONLY the street address
        hookLogger.debug('SETTING input to street address ONLY:', components.streetAddress);
        if (setInputValueRef.current) {
          setInputValueRef.current(components.streetAddress);
          hookLogger.debug('setInputValue called successfully');
        }

        // Call address change callback with street address ONLY
        if (onAddressChangeRef.current) {
          hookLogger.debug('CALLING onAddressChange with street address:', components.streetAddress);
          onAddressChangeRef.current(components.streetAddress);
          hookLogger.debug('onAddressChange called successfully');
        }

        // CRITICAL: Extract and populate other address fields
        if (onAddressComponentsExtractedRef.current) {
          hookLogger.debug('CALLING onAddressComponentsExtracted with all components:', components);
          onAddressComponentsExtractedRef.current(components);
          hookLogger.debug('onAddressComponentsExtracted called successfully');
        } else {
          hookLogger.warn('CRITICAL: onAddressComponentsExtracted callback is MISSING!');
        }

        // Call place select callback
        if (onPlaceSelectRef.current) {
          hookLogger.debug('CALLING onPlaceSelect');
          onPlaceSelectRef.current(place);
          hookLogger.debug('onPlaceSelect called successfully');
        }

        hookLogger.debug('handlePlaceChanged - COMPLETED SUCCESSFULLY');
      } catch (error) {
        hookLogger.error('Error extracting address components:', error);
        // Fallback: at least set the input value to something reasonable
        const fallbackAddress = place.formatted_address?.split(',')[0] || '';
        hookLogger.debug('Using fallback address:', fallbackAddress);
        if (setInputValueRef.current) {
          setInputValueRef.current(fallbackAddress);
        }
        if (onAddressChangeRef.current) {
          onAddressChangeRef.current(fallbackAddress);
        }
      }
    } else {
      hookLogger.debug('Place selected but missing required data:', {
        hasPlace: !!place,
        hasAddress: !!place?.formatted_address,
        hasComponents: !!place?.address_components
      });
    }
  }, [hookLogger]); // Empty dependency array - this callback never changes

  useEffect(() => {
    hookLogger.debug('usePlacesAutocomplete useEffect triggered, isGoogleReady:', isGoogleReady);

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
      hookLogger.debug('Setting up Google Places Autocomplete...');

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

      // Create new autocomplete instance
      hookLogger.debug('Creating new autocomplete instance');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      hookLogger.info('Google Places Autocomplete initialized successfully');

      // Add the place changed listener
      hookLogger.debug('Adding place_changed listener');
      listenerRef.current = autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      hookLogger.debug('place_changed listener added successfully');

    } catch (error) {
      hookLogger.error('Error initializing Google Places Autocomplete:', error);
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
  }, [isGoogleReady, handlePlaceChanged, hookLogger]); // Only depend on isGoogleReady and the stable handlePlaceChanged

  return { autocompleteRef };
};

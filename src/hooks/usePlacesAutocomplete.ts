
import { useEffect, useRef, useCallback } from "react";
import { extractAddressComponents, AddressComponents } from "@/utils/addressExtraction";

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Memoize the place change handler to prevent useEffect from recreating
  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    
    if (place && place.formatted_address && place.address_components) {
      console.log('🏠 Place selected:', place.formatted_address);
      console.log('🏠 Address components:', place.address_components);
      
      try {
        const components = extractAddressComponents(place);
        console.log('🏠 Extracted components:', components);
        
        // CRITICAL: Set the input value to ONLY the street address
        console.log('🏠 Setting input to street address ONLY:', components.streetAddress);
        setInputValue(components.streetAddress);
        
        // Call address change callback with street address ONLY
        if (onAddressChange) {
          console.log('🏠 Calling onAddressChange with street address:', components.streetAddress);
          onAddressChange(components.streetAddress);
        }
        
        // CRITICAL: Extract and populate other address fields
        if (onAddressComponentsExtracted) {
          console.log('🏠 CALLING onAddressComponentsExtracted with all components:', components);
          onAddressComponentsExtracted(components);
        } else {
          console.log('❌ CRITICAL: onAddressComponentsExtracted callback is MISSING!');
        }
        
        // Call place select callback
        if (onPlaceSelect) {
          console.log('🏠 Calling onPlaceSelect');
          onPlaceSelect(place);
        }
      } catch (error) {
        console.error('❌ Error extracting address components:', error);
        // Fallback: at least set the input value to something reasonable
        const fallbackAddress = place.formatted_address?.split(',')[0] || '';
        setInputValue(fallbackAddress);
        if (onAddressChange) {
          onAddressChange(fallbackAddress);
        }
      }
    } else {
      console.log('❌ Place selected but missing required data:', { 
        hasAddress: !!place?.formatted_address, 
        hasComponents: !!place?.address_components 
      });
    }
  }, [onPlaceSelect, onAddressChange, onAddressComponentsExtracted, setInputValue]);

  // Memoize the initialization function to prevent constant recreation
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current) return;

    try {
      console.log('🔧 Setting up Google Places Autocomplete...');
      
      // Check if Google Maps and Places are properly loaded
      if (!window.google || !window.google.maps || !window.google.maps.places || !window.google.maps.places.Autocomplete) {
        console.log('⏳ Google Places not ready yet, retrying in 100ms...');
        setTimeout(initializeAutocomplete, 100);
        return;
      }
      
      // Clean up existing instance
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }

      // Create new autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      console.log('✅ Google Places Autocomplete initialized successfully');

      // Add the place changed listener
      const listener = autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

      return () => {
        if (listener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('❌ Error initializing Google Places Autocomplete:', error);
      // Retry after a short delay
      setTimeout(initializeAutocomplete, 200);
    }
  }, [handlePlaceChanged]);

  useEffect(() => {
    if (!isGoogleReady) return;

    const cleanup = initializeAutocomplete();
    return cleanup;
  }, [isGoogleReady, initializeAutocomplete]);

  return { autocompleteRef };
};

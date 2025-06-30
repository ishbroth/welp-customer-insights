
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!isGoogleReady || !inputRef.current) return;

    try {
      console.log('🔧 Setting up Google Places Autocomplete...');
      
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      console.log('✅ Google Places Autocomplete initialized successfully');

      const placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place && place.formatted_address && place.address_components) {
          console.log('🏠 Place selected:', place.formatted_address);
          console.log('🏠 Address components:', place.address_components);
          
          const components = extractAddressComponents(place);
          console.log('🏠 Extracted components:', components);
          
          // Update the input value with ONLY the street address (not the full formatted address)
          console.log('🏠 Setting input to street address only:', components.streetAddress);
          setInputValue(components.streetAddress);
          
          // Call callbacks - address change gets street address only, components get all parts
          onAddressChange?.(components.streetAddress);
          
          // CRITICAL: Always call the components extracted callback to populate other fields
          console.log('🏠 Calling onAddressComponentsExtracted with:', components);
          onAddressComponentsExtracted?.(components);
          
          onPlaceSelect?.(place);
        }
      });

      return () => {
        if (placeChangedListener) {
          window.google.maps.event.removeListener(placeChangedListener);
        }
      };
    } catch (error) {
      console.error('❌ Error initializing Google Places Autocomplete:', error);
    }
  }, [isGoogleReady, onPlaceSelect, onAddressChange, onAddressComponentsExtracted, setInputValue]);

  return { autocompleteRef };
};

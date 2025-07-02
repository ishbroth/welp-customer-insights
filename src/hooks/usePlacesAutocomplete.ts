
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

    const initializeAutocomplete = () => {
      try {
        console.log('🔧 Setting up Google Places Autocomplete...');
        
        // Check if Google Maps and Places are properly loaded
        if (!window.google || !window.google.maps || !window.google.maps.places || !window.google.maps.places.Autocomplete) {
          console.log('⏳ Google Places not ready yet, retrying in 100ms...');
          setTimeout(initializeAutocomplete, 100);
          return;
        }
        
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current!, {
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
            
            // ALWAYS set the input value to the street address
            console.log('🏠 Setting input to street address:', components.streetAddress);
            setInputValue(components.streetAddress);
            
            // ALWAYS call address change callback with street address
            if (onAddressChange) {
              console.log('🏠 Calling onAddressChange with:', components.streetAddress);
              onAddressChange(components.streetAddress);
            }
            
            // CRITICAL: ALWAYS call the components extracted callback to populate other fields
            if (onAddressComponentsExtracted) {
              console.log('🏠 CALLING onAddressComponentsExtracted with:', components);
              onAddressComponentsExtracted(components);
            } else {
              console.log('❌ onAddressComponentsExtracted callback is missing!');
            }
            
            // Call place select callback
            if (onPlaceSelect) {
              console.log('🏠 Calling onPlaceSelect');
              onPlaceSelect(place);
            }
          } else {
            console.log('🏠 Place selected but missing required data:', { 
              hasAddress: !!place?.formatted_address, 
              hasComponents: !!place?.address_components 
            });
          }
        });

        return () => {
          if (placeChangedListener) {
            window.google.maps.event.removeListener(placeChangedListener);
          }
        };
      } catch (error) {
        console.error('❌ Error initializing Google Places Autocomplete:', error);
        // Retry after a short delay
        setTimeout(initializeAutocomplete, 200);
      }
    };

    // Start initialization
    initializeAutocomplete();
  }, [isGoogleReady, onPlaceSelect, onAddressChange, onAddressComponentsExtracted, setInputValue]);

  return { autocompleteRef };
};

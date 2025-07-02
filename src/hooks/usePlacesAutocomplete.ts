
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
    console.log('🏠 handlePlaceChanged - STARTING');
    
    if (!autocompleteRef.current) {
      console.log('❌ No autocomplete instance available');
      return;
    }
    
    const place = autocompleteRef.current.getPlace();
    
    console.log('🏠 handlePlaceChanged - Place object:', {
      hasPlace: !!place,
      formatted_address: place?.formatted_address,
      hasAddressComponents: !!place?.address_components,
      addressComponentsLength: place?.address_components?.length
    });
    
    if (place && place.formatted_address && place.address_components) {
      console.log('🏠 Place selected:', place.formatted_address);
      console.log('🏠 Address components:', place.address_components);
      
      try {
        console.log('🏠 CALLING extractAddressComponents...');
        const components = extractAddressComponents(place);
        console.log('🏠 EXTRACTED components:', components);
        
        // CRITICAL: Set the input value to ONLY the street address
        console.log('🏠 SETTING input to street address ONLY:', components.streetAddress);
        if (setInputValueRef.current) {
          setInputValueRef.current(components.streetAddress);
          console.log('🏠 setInputValue called successfully');
        }
        
        // Call address change callback with street address ONLY
        if (onAddressChangeRef.current) {
          console.log('🏠 CALLING onAddressChange with street address:', components.streetAddress);
          onAddressChangeRef.current(components.streetAddress);
          console.log('🏠 onAddressChange called successfully');
        }
        
        // CRITICAL: Extract and populate other address fields
        if (onAddressComponentsExtractedRef.current) {
          console.log('🏠 CALLING onAddressComponentsExtracted with all components:', components);
          onAddressComponentsExtractedRef.current(components);
          console.log('🏠 onAddressComponentsExtracted called successfully');
        } else {
          console.log('❌ CRITICAL: onAddressComponentsExtracted callback is MISSING!');
        }
        
        // Call place select callback
        if (onPlaceSelectRef.current) {
          console.log('🏠 CALLING onPlaceSelect');
          onPlaceSelectRef.current(place);
          console.log('🏠 onPlaceSelect called successfully');
        }
        
        console.log('🏠 handlePlaceChanged - COMPLETED SUCCESSFULLY');
      } catch (error) {
        console.error('❌ Error extracting address components:', error);
        // Fallback: at least set the input value to something reasonable
        const fallbackAddress = place.formatted_address?.split(',')[0] || '';
        console.log('🏠 Using fallback address:', fallbackAddress);
        if (setInputValueRef.current) {
          setInputValueRef.current(fallbackAddress);
        }
        if (onAddressChangeRef.current) {
          onAddressChangeRef.current(fallbackAddress);
        }
      }
    } else {
      console.log('❌ Place selected but missing required data:', { 
        hasPlace: !!place,
        hasAddress: !!place?.formatted_address, 
        hasComponents: !!place?.address_components 
      });
    }
  }, []); // Empty dependency array - this callback never changes

  useEffect(() => {
    console.log('🔧 usePlacesAutocomplete useEffect triggered, isGoogleReady:', isGoogleReady);
    
    if (!isGoogleReady || !inputRef.current) {
      console.log('🔧 Google not ready or no input ref, skipping initialization');
      return;
    }

    // Check if Google Maps and Places are properly loaded
    if (!window.google?.maps?.places?.Autocomplete) {
      console.log('⏳ Google Places not ready yet, will retry...');
      return;
    }
    
    try {
      console.log('🔧 Setting up Google Places Autocomplete...');
      
      // Clean up existing instance and listener
      if (listenerRef.current) {
        console.log('🔧 Cleaning up existing listener');
        try {
          window.google.maps.event.removeListener(listenerRef.current);
        } catch (e) {
          console.log('🔧 Error cleaning up listener:', e);
        }
        listenerRef.current = null;
      }
      
      if (autocompleteRef.current) {
        console.log('🔧 Cleaning up existing autocomplete instance');
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          console.log('🔧 Error cleaning up autocomplete:', e);
        }
        autocompleteRef.current = null;
      }

      // Create new autocomplete instance
      console.log('🔧 Creating new autocomplete instance');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      console.log('✅ Google Places Autocomplete initialized successfully');

      // Add the place changed listener
      console.log('🔧 Adding place_changed listener');
      listenerRef.current = autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      console.log('✅ place_changed listener added successfully');

    } catch (error) {
      console.error('❌ Error initializing Google Places Autocomplete:', error);
    }

    // Cleanup function
    return () => {
      console.log('🔧 Cleanup function called');
      if (listenerRef.current) {
        try {
          window.google.maps.event.removeListener(listenerRef.current);
        } catch (e) {
          console.log('🔧 Error in cleanup:', e);
        }
        listenerRef.current = null;
      }
    };
  }, [isGoogleReady, handlePlaceChanged]); // Only depend on isGoogleReady and the stable handlePlaceChanged

  return { autocompleteRef };
};

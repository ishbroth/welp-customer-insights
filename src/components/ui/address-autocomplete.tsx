
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAddress } from "@/utils/addressNormalization";

interface AddressAutocompleteProps extends React.ComponentProps<"input"> {
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onAddressChange?: (address: string) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, onPlaceSelect, onAddressChange, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isGoogleReady, setIsGoogleReady] = useState(false);
    const [inputValue, setInputValue] = useState(props.value || "");

    useEffect(() => {
      let mounted = true;
      
      const initializeGoogle = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-secret', {
            body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
          });
          
          if (error || !data?.secret) {
            console.log("Google Maps API key not available, using regular input");
            return;
          }

          if (window.google && window.google.maps && window.google.maps.places) {
            if (mounted) setIsGoogleReady(true);
            return;
          }

          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.secret}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            if (mounted) setIsGoogleReady(true);
          };

          script.onerror = () => {
            console.warn('Failed to load Google Maps script');
          };

          document.head.appendChild(script);
        } catch (error) {
          console.warn("Error loading Google Maps:", error);
        }
      };

      initializeGoogle();
      
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      if (!isGoogleReady || !inputRef.current) return;

      try {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        const placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.formatted_address) {
            const cleanAddress = place.formatted_address.replace(/,/g, '');
            const normalizedAddress = normalizeAddress(cleanAddress);
            
            // Update the input value in our state
            setInputValue(normalizedAddress);
            
            // Call callbacks
            onAddressChange?.(normalizedAddress);
            onPlaceSelect?.(place);
          }
        });

        return () => {
          if (placeChangedListener) {
            window.google.maps.event.removeListener(placeChangedListener);
          }
        };
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }, [isGoogleReady, onPlaceSelect, onAddressChange]);

    // Sync with external value changes
    useEffect(() => {
      if (props.value !== undefined && props.value !== inputValue) {
        setInputValue(props.value as string);
      }
    }, [props.value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Always allow the user to type freely
      setInputValue(value);
      
      // Call callbacks
      onAddressChange?.(value);
      onChange?.(e);
    };

    const getPlaceholder = () => {
      if (isGoogleReady) {
        return "Start typing your address...";
      }
      return "Enter your address";
    };

    return (
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
        placeholder={getPlaceholder()}
        value={inputValue}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };

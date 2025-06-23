
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
    const [userTyping, setUserTyping] = useState(false);
    const lastUserInput = useRef<string>("");

    useEffect(() => {
      let mounted = true;
      
      const initializeGoogle = async () => {
        try {
          // Try to get API key
          const { data, error } = await supabase.functions.invoke('get-secret', {
            body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
          });
          
          if (error || !data?.secret) {
            console.log("Google Maps API key not available, using regular input");
            return;
          }

          // Check if already loaded
          if (window.google && window.google.maps && window.google.maps.places) {
            if (mounted) setIsGoogleReady(true);
            return;
          }

          // Load Google Maps script
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
        // Clean up existing autocomplete
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        // Initialize new autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        // Handle place selection
        const placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.formatted_address) {
            const cleanAddress = place.formatted_address.replace(/,/g, '');
            const normalizedAddress = normalizeAddress(cleanAddress);
            
            // Update input value
            if (inputRef.current) {
              inputRef.current.value = normalizedAddress;
              lastUserInput.current = normalizedAddress;
            }
            
            // Call callbacks
            onAddressChange?.(normalizedAddress);
            onPlaceSelect?.(place);
            
            // Reset user typing flag after autocomplete selection
            setTimeout(() => setUserTyping(false), 100);
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

    // Handle manual typing - this is crucial for space bar functionality
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Track that user is manually typing
      setUserTyping(true);
      lastUserInput.current = value;
      
      // Allow normal typing behavior
      onAddressChange?.(value);
      onChange?.(e);
      
      // Clear user typing flag after a delay
      setTimeout(() => setUserTyping(false), 1000);
    };

    // Handle key events to ensure space bar works
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Always allow space bar and other keys
      if (e.key === ' ') {
        setUserTyping(true);
      }
      
      // Call original onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };

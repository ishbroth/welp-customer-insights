
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
  ({ className, onPlaceSelect, onAddressChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
      // Get API key from Supabase secrets
      const getApiKey = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-secret', {
            body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
          });
          
          if (error) {
            console.warn("Could not retrieve Google Maps API key from Supabase:", error);
            return;
          }
          
          if (data?.secret) {
            console.log("Google Maps API Key retrieved successfully");
            setApiKey(data.secret);
            setHasApiKey(true);
          } else {
            console.warn("Google Maps API key not found in Supabase secrets");
          }
        } catch (error) {
          console.warn("Error retrieving Google Maps API key:", error);
          
          // Fallback to environment variable
          const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (envApiKey) {
            console.log("Using fallback environment variable for Google Maps API key");
            setApiKey(envApiKey);
            setHasApiKey(true);
          }
        }
      };

      getApiKey();
    }, []);

    useEffect(() => {
      if (!apiKey || !hasApiKey) {
        console.log("API key not available yet");
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Maps already loaded");
        setIsLoaded(true);
        return;
      }

      // Load Google Maps script
      console.log("Loading Google Maps script...");
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setIsLoaded(false);
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      };
    }, [apiKey, hasApiKey]);

    useEffect(() => {
      if (!isLoaded || !inputRef.current || !hasApiKey) {
        console.log("Autocomplete not ready:", { isLoaded, hasInput: !!inputRef.current, hasApiKey });
        return;
      }

      try {
        console.log("Initializing Google Places Autocomplete...");
        // Initialize autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        console.log("Autocomplete initialized, adding listeners...");

        // Add place changed listener
        autocompleteRef.current.addListener('place_changed', () => {
          console.log("Place changed event triggered");
          const place = autocompleteRef.current?.getPlace();
          console.log("Selected place:", place);
          
          if (place && place.formatted_address) {
            // Remove comma from the address before setting
            const cleanAddress = place.formatted_address.replace(/,/g, '');
            console.log("Clean address:", cleanAddress);
            
            if (onAddressChange) {
              onAddressChange(cleanAddress);
            }
            
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          }
        });

        console.log("Autocomplete setup complete");
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }

      return () => {
        if (autocompleteRef.current) {
          try {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          } catch (error) {
            console.error('Error clearing autocomplete listeners:', error);
          }
        }
      };
    }, [isLoaded, onPlaceSelect, onAddressChange, hasApiKey]);

    // If Google Maps is not loaded or no API key, fall back to regular input
    if (!isLoaded || !hasApiKey) {
      return (
        <Input
          ref={ref}
          className={className}
          placeholder={hasApiKey ? "Loading address autocomplete..." : "Enter your address (autocomplete unavailable)"}
          {...props}
        />
      );
    }

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
        placeholder="Start typing your address..."
        {...props}
      />
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };

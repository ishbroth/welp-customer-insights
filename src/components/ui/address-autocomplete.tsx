import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAddress } from "@/utils/addressNormalization";

interface AddressAutocompleteProps extends React.ComponentProps<"input"> {
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onAddressChange?: (address: string) => void;
  onAddressComponentsExtracted?: (components: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, onPlaceSelect, onAddressChange, onAddressComponentsExtracted, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isGoogleReady, setIsGoogleReady] = useState(false);
    const [inputValue, setInputValue] = useState(props.value || "");
    const [googleMapsStatus, setGoogleMapsStatus] = useState<'loading' | 'ready' | 'error' | 'no-key'>('loading');

    useEffect(() => {
      let mounted = true;
      
      const initializeGoogle = async () => {
        try {
          console.log('🗺️ Initializing Google Maps...');
          const { data, error } = await supabase.functions.invoke('get-secret', {
            body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
          });
          
          if (error || !data?.secret) {
            console.log("❌ Google Maps API key not available, using regular input");
            setGoogleMapsStatus('no-key');
            return;
          }

          console.log('✅ Google Maps API key retrieved successfully');

          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('✅ Google Maps already loaded');
            if (mounted) {
              setIsGoogleReady(true);
              setGoogleMapsStatus('ready');
            }
            return;
          }

          console.log('🔄 Loading Google Maps script...');
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.secret}&libraries=places&loading=async`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            console.log('✅ Google Maps script loaded successfully');
            if (mounted) {
              setIsGoogleReady(true);
              setGoogleMapsStatus('ready');
            }
          };

          script.onerror = (error) => {
            console.error('❌ Failed to load Google Maps script:', error);
            setGoogleMapsStatus('error');
          };

          document.head.appendChild(script);
        } catch (error) {
          console.error("❌ Error loading Google Maps:", error);
          setGoogleMapsStatus('error');
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
            
            // Extract address components for proper form field population
            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zipCode = '';
            
            place.address_components.forEach((component) => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                route = component.long_name;
              } else if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name; // Use short_name for state abbreviation
              } else if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });
            
            // Create the street address (just street number + route) for this field
            const streetAddress = `${streetNumber} ${route}`.trim();
            const normalizedAddress = normalizeAddress(streetAddress);
            
            // Update the input value with just the street address
            setInputValue(normalizedAddress);
            
            // Call callbacks - pass the street address to onAddressChange
            onAddressChange?.(normalizedAddress);
            
            // Pass extracted components to parent for populating other fields
            if (onAddressComponentsExtracted) {
              onAddressComponentsExtracted({
                streetAddress: normalizedAddress,
                city,
                state,
                zipCode
              });
            }
            
            // Also pass the full place object for any other processing
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
        setGoogleMapsStatus('error');
      }
    }, [isGoogleReady, onPlaceSelect, onAddressChange, onAddressComponentsExtracted]);

    useEffect(() => {
      if (props.value !== undefined && props.value !== inputValue) {
        setInputValue(props.value as string);
      }
    }, [props.value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Allow completely free typing - no restrictions whatsoever
      setInputValue(value);
      
      // Call callbacks without any modification
      onAddressChange?.(value);
      onChange?.(e);
    };

    const getPlaceholder = () => {
      switch (googleMapsStatus) {
        case 'loading':
          return "Loading Google Maps...";
        case 'ready':
          return "Start typing your address...";
        case 'error':
          return "Enter your address (autocomplete unavailable)";
        case 'no-key':
          return "Enter your address";
        default:
          return "Enter your address";
      }
    };

    const getStatusIndicator = () => {
      switch (googleMapsStatus) {
        case 'loading':
          return '🔄';
        case 'ready':
          return '🗺️';
        case 'error':
          return '❌';
        case 'no-key':
          return '📝';
        default:
          return '';
      }
    };

    console.log(`AddressAutocomplete status: ${googleMapsStatus}, Google ready: ${isGoogleReady}`);

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
          placeholder={getPlaceholder()}
          value={inputValue}
          onChange={handleInputChange}
          {...props}
        />
        {/* Status indicator in the corner */}
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs opacity-50 pointer-events-none">
          {getStatusIndicator()}
        </span>
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };

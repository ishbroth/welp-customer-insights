
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GoogleMapsStatus = 'loading' | 'ready' | 'error' | 'no-key';

export const useGoogleMapsInit = () => {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<GoogleMapsStatus>('loading');

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initializeGoogle = async () => {
      try {
        console.log('🗺️ Initializing Google Maps...');
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
        });
        
        if (error || !data?.secret) {
          console.log("❌ Google Maps API key not available, using regular input");
          if (mounted) {
            setGoogleMapsStatus('no-key');
          }
          return;
        }

        console.log('✅ Google Maps API key retrieved successfully');

        // Check if already loaded and ready
        if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
          console.log('✅ Google Maps already loaded and ready');
          if (mounted) {
            setIsGoogleReady(true);
            setGoogleMapsStatus('ready');
          }
          return;
        }

        console.log('🔄 Loading Google Maps script...');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.secret}&libraries=places&loading=async&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        // Create a global callback that will be called when Google Maps is ready
        (window as any).initGoogleMaps = () => {
          console.log('✅ Google Maps script loaded and callback fired');
          
          // Double-check that places library is available with timeout
          const checkPlacesReady = () => {
            if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
              console.log('✅ Google Places library confirmed ready');
              if (mounted) {
                setIsGoogleReady(true);
                setGoogleMapsStatus('ready');
              }
            } else {
              console.log('⏳ Google Places library not ready yet, checking again...');
              if (mounted) {
                timeoutId = setTimeout(checkPlacesReady, 100);
              }
            }
          };
          
          checkPlacesReady();
        };

        script.onerror = (error) => {
          console.error('❌ Failed to load Google Maps script:', error);
          if (mounted) {
            setGoogleMapsStatus('error');
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("❌ Error loading Google Maps:", error);
        if (mounted) {
          setGoogleMapsStatus('error');
        }
      }
    };

    initializeGoogle();
    
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Clean up the global callback
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, []);

  return { isGoogleReady, googleMapsStatus };
};

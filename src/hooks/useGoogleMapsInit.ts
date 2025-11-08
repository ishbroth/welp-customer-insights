
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export type GoogleMapsStatus = 'loading' | 'ready' | 'error' | 'no-key';

export const useGoogleMapsInit = () => {
  const hookLogger = logger.withContext('useGoogleMapsInit');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<GoogleMapsStatus>('loading');

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeGoogle = async () => {
      try {
        hookLogger.info('Initializing Google Maps...');

        // Check if already loaded and ready
        if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
          hookLogger.info('Google Maps already loaded and ready');
          if (mounted) {
            setIsGoogleReady(true);
            setGoogleMapsStatus('ready');
          }
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          hookLogger.info('Google Maps script already present, waiting for it to load...');
          // Wait for existing script to finish loading
          const checkReady = () => {
            if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
              if (mounted) {
                setIsGoogleReady(true);
                setGoogleMapsStatus('ready');
              }
            } else if (mounted) {
              timeoutId = setTimeout(checkReady, 100);
            }
          };
          checkReady();
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'VITE_GOOGLE_MAPS_API_KEY' }
        });

        if (error) {
          hookLogger.error("Error calling get-secret function:", error);
          if (mounted) {
            setGoogleMapsStatus('error');
          }
          return;
        }

        if (!data?.secret) {
          hookLogger.warn("Google Maps API key not available");
          if (mounted) {
            setGoogleMapsStatus('no-key');
          }
          return;
        }

        hookLogger.info('Google Maps API key retrieved successfully');

        hookLogger.debug('Loading Google Maps script...');
        const script = document.createElement('script');
        // Use v=weekly to get latest stable version and explicitly request places library
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.secret}&libraries=places&v=weekly&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script'; // Add ID to easily identify
        
        // Create a global callback that will be called when Google Maps is ready
        (window as any).initGoogleMaps = () => {
          hookLogger.info('Google Maps script loaded and callback fired');

          // Double-check that places library is available with timeout
          const checkPlacesReady = () => {
            if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
              hookLogger.info('Google Places library confirmed ready');
              if (mounted) {
                setIsGoogleReady(true);
                setGoogleMapsStatus('ready');
              }
            } else {
              hookLogger.debug('Google Places library not ready yet, checking again...');
              if (mounted) {
                timeoutId = setTimeout(checkPlacesReady, 100);
              }
            }
          };

          checkPlacesReady();
        };

        script.onerror = (error) => {
          hookLogger.error('Failed to load Google Maps script:', error);
          if (mounted) {
            setGoogleMapsStatus('error');
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        hookLogger.error("Error loading Google Maps:", error);
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

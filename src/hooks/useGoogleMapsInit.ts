
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GoogleMapsStatus = 'loading' | 'ready' | 'error' | 'no-key';

export const useGoogleMapsInit = () => {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleMapsStatus, setGoogleMapsStatus] = useState<GoogleMapsStatus>('loading');

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

  return { isGoogleReady, googleMapsStatus };
};

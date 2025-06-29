
import { GoogleMapsStatus } from "@/hooks/useGoogleMapsInit";

export const getPlaceholder = (googleMapsStatus: GoogleMapsStatus) => {
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

export const getStatusIndicator = (googleMapsStatus: GoogleMapsStatus) => {
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

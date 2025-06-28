
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Initialize Capacitor when running in a mobile environment
if (Capacitor.isNativePlatform()) {
  console.log('Running in native mobile environment');
}

createRoot(document.getElementById("root")!).render(<App />);


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { logger } from '@/utils/logger';

const mainLogger = logger.withContext('main');

// Initialize Capacitor when running in a mobile environment
if (Capacitor.isNativePlatform()) {
  mainLogger.info('Running in native mobile environment');
}

createRoot(document.getElementById("root")!).render(<App />);

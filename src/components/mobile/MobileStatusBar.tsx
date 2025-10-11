import React, { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useTheme } from 'next-themes';
import { logger } from '@/utils/logger';

interface MobileStatusBarProps {
  backgroundColor?: string;
  overlay?: boolean;
}

const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  backgroundColor,
  overlay = false
}) => {
  const componentLogger = logger.withContext('MobileStatusBar');
  const { theme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const configureStatusBar = async () => {
      try {
        // Set status bar style based on theme
        await StatusBar.setStyle({
          style: theme === 'dark' ? Style.Dark : Style.Light
        });

        // Set background color if provided
        if (backgroundColor) {
          await StatusBar.setBackgroundColor({ color: backgroundColor });
        }

        // Configure overlay mode
        await StatusBar.setOverlaysWebView({ overlay });
      } catch (error) {
        componentLogger.error('StatusBar configuration error', { error });
      }
    };

    configureStatusBar();
  }, [theme, backgroundColor, overlay]);

  // This component doesn't render anything visible
  return null;
};

export default MobileStatusBar;
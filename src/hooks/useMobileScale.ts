import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook for calculating mobile scale factor for proportional desktop layout scaling
 */
export const useMobileScale = () => {
  const isMobile = useIsMobile();
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState('100%');

  useEffect(() => {
    if (!isMobile) {
      setScale(1);
      setContainerWidth('100%');
      return;
    }

    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const desktopWidth = 1024; // Minimum desktop width we want to scale from
      const scaleRatio = Math.min(viewportWidth / desktopWidth, 1);
      
      // Apply minimum scale to ensure readability
      const finalScale = Math.max(scaleRatio, 0.6);
      
      setScale(finalScale);
      // Adjust container width to accommodate scaled content
      setContainerWidth(`${100 / finalScale}%`);
    };

    updateScale();
    
    const handleResize = () => {
      updateScale();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isMobile]);

  return {
    isMobile,
    scale,
    containerWidth,
    shouldScale: isMobile && scale < 1
  };
};
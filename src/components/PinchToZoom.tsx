import { ReactNode, useRef, useState, useEffect } from 'react';

interface PinchToZoomProps {
  children: ReactNode;
  maxScale?: number;
  className?: string;
}

const PinchToZoom = ({ children, maxScale = 1.5, className = '' }: PinchToZoomProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Store initial pinch distance
  const initialDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Calculate distance between two touch points
    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setIsTransitioning(false);
        initialDistance.current = getDistance(e.touches);
        initialScale.current = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);

        if (initialDistance.current > 0) {
          // Calculate scale based on pinch distance
          const scaleChange = currentDistance / initialDistance.current;
          let newScale = initialScale.current * scaleChange;

          // Clamp scale between 1 and maxScale
          newScale = Math.max(1, Math.min(maxScale, newScale));

          setScale(newScale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        // Snap back to normal size with smooth transition
        setIsTransitioning(true);
        setScale(1);
        initialDistance.current = 0;
      }
    };

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [scale, maxScale]);

  return (
    <div
      ref={containerRef}
      className={`${className} touch-none select-none`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: isTransitioning ? 'transform 0.3s ease-out' : 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default PinchToZoom;

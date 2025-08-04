import React, { useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileSwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

const MobileSwipeGesture: React.FC<MobileSwipeGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  threshold = 50,
  className,
}) => {
  const isMobile = useIsMobile();
  const startPosRef = useRef({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPosRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    
    // Set swiping if movement exceeds threshold
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      setIsSwiping(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startPosRef.current || !isSwiping) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setIsSwiping(false);
  };

  return (
    <div
      className={`${className} touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export default MobileSwipeGesture;
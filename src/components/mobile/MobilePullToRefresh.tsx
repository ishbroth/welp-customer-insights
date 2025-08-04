import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
}) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isMobile) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY && containerRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setStartY(0);
    setPullDistance(0);
  };

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const shouldShowRefresh = pullDistance > 20;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {shouldShowRefresh && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex justify-center items-center transition-all duration-200"
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
            opacity: refreshOpacity,
          }}
        >
          <div className="bg-white rounded-full p-3 shadow-lg border">
            <RefreshCw
              className={`h-5 w-5 text-primary ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullDistance * 2}deg)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance * 0.5}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobilePullToRefresh;
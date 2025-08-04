import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
}

interface MobilePerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showDebugInfo?: boolean;
}

const MobilePerformanceMonitor: React.FC<MobilePerformanceMonitorProps> = ({
  onMetricsUpdate,
  showDebugInfo = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile || !showDebugInfo) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    // FPS monitoring
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
          renderTime: currentTime - performance.timing?.domContentLoadedEventEnd || 0
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Start monitoring
    measureFPS();

    // Performance observer for additional metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.fetchStart
            }));
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }

      return () => {
        cancelAnimationFrame(animationId);
        observer.disconnect();
      };
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMobile, showDebugInfo]);

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Only show debug info on mobile when enabled
  if (!isMobile || !showDebugInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50 font-mono">
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {Math.round(metrics.memoryUsage / 1024 / 1024)}MB</div>
      <div>Load: {Math.round(metrics.loadTime)}ms</div>
    </div>
  );
};

export default React.memo(MobilePerformanceMonitor);
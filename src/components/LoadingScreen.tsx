
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import './LoadingScreen.css';

const LoadingScreen: React.FC = React.memo(() => {
  const { isPageLoading, isInitialLoading } = useLoading();

  if (!isPageLoading && !isInitialLoading) return null;

  return (
    <div className="fixed inset-0 bg-[#ea384c] z-50 flex items-center justify-center loading-screen-overlay">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <g transform="translate(100, 100) rotate(12)">
            {/* Right arm (0 degrees) */}
            <path 
              d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
              fill="white" 
              className="arm-right" 
            />
            
            {/* Bottom-right diagonal arm (72 degrees) */}
            <g transform="rotate(72)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="arm-bottom-right" 
              />
            </g>
            
            {/* Bottom-left diagonal arm (144 degrees) */}
            <g transform="rotate(144)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="arm-bottom-left" 
              />
            </g>
            
            {/* Top-left diagonal arm (216 degrees) */}
            <g transform="rotate(216)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="arm-top-left" 
              />
            </g>
            
            {/* Period positioned at 288 degrees */}
            <circle 
              cx="7.5" 
              cy="-20" 
              r="8" 
              fill="white" 
              className="period" 
            />
          </g>
        </svg>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;

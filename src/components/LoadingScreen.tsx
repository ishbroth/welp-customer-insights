
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
            {/* Right arm */}
            <path
              d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0"
              fill="white"
            />

            {/* Bottom-right arm */}
            <g transform="rotate(72)">
              <path
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0"
                fill="white"
              />
            </g>

            {/* Bottom-left arm */}
            <g transform="rotate(144)">
              <path
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0"
                fill="white"
              />
            </g>

            {/* Top-left arm */}
            <g transform="rotate(216)">
              <path
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0"
                fill="white"
              />
            </g>

            {/* Period */}
            <circle
              cx="7.5"
              cy="-20"
              r="8"
              fill="white"
            />
          </g>
        </svg>
      </div>
    </div>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;

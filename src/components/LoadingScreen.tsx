
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#ea384c] flex items-center justify-center z-50">
      <div className="relative">
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pulse"
        >
          {/* Asterisk with 5 arms (4 actual arms + period replacing top arm), tilted */}
          <g transform="translate(156, 72) rotate(12)">
            {/* Right arm (0 degrees) */}
            <path
              d="M 2.4 0 Q 21.6 -12 40.8 -6 Q 45.6 0 40.8 6 Q 21.6 12 2.4 0"
              fill="white"
              className="arm-right"
            />
            
            {/* Bottom-right diagonal arm (72 degrees) */}
            <g transform="rotate(72)">
              <path
                d="M 2.4 0 Q 21.6 -12 40.8 -6 Q 45.6 0 40.8 6 Q 21.6 12 2.4 0"
                fill="white"
                className="arm-bottom-right"
              />
            </g>
            
            {/* Bottom-left diagonal arm (144 degrees) */}
            <g transform="rotate(144)">
              <path
                d="M 2.4 0 Q 21.6 -12 40.8 -6 Q 45.6 0 40.8 6 Q 21.6 12 2.4 0"
                fill="white"
                className="arm-bottom-left"
              />
            </g>
            
            {/* Top-left diagonal arm (216 degrees) */}
            <g transform="rotate(216)">
              <path
                d="M 2.4 0 Q 21.6 -12 40.8 -6 Q 45.6 0 40.8 6 Q 21.6 12 2.4 0"
                fill="white"
                className="arm-top-left"
              />
            </g>
            
            {/* Period positioned at 288 degrees */}
            <circle
              cx="9"
              cy="-24"
              r="9.6"
              fill="white"
              className="period"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LoadingScreen;


import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  const { isPageLoading } = useLoading();

  console.log('🔄 LoadingScreen render - isPageLoading:', isPageLoading);

  if (!isPageLoading) return null;

  return (
    <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-[9999]">
      <div className="flex items-center justify-center">
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="animate-spin"
          style={{ animationDuration: '2s' }}
        >
          {/* Using the same asterisk design from WelpAppIcon with clockwise highlighting */}
          <g transform="translate(30, 30) rotate(12)">
            {/* Right arm (0 degrees) */}
            <path
              d="M 0.6 0 Q 5.4 -3 10.2 -1.5 Q 11.4 0 10.2 1.5 Q 5.4 3 0.6 0"
              fill="white"
              className="arm-right"
            />
            
            {/* Bottom-right diagonal arm (72 degrees) */}
            <g transform="rotate(72)">
              <path
                d="M 0.6 0 Q 5.4 -3 10.2 -1.5 Q 11.4 0 10.2 1.5 Q 5.4 3 0.6 0"
                fill="white"
                className="arm-bottom-right"
              />
            </g>
            
            {/* Bottom-left diagonal arm (144 degrees) */}
            <g transform="rotate(144)">
              <path
                d="M 0.6 0 Q 5.4 -3 10.2 -1.5 Q 11.4 0 10.2 1.5 Q 5.4 3 0.6 0"
                fill="white"
                className="arm-bottom-left"
              />
            </g>
            
            {/* Top-left diagonal arm (216 degrees) */}
            <g transform="rotate(216)">
              <path
                d="M 0.6 0 Q 5.4 -3 10.2 -1.5 Q 11.4 0 10.2 1.5 Q 5.4 3 0.6 0"
                fill="white"
                className="arm-top-left"
              />
            </g>
            
            {/* Period positioned at 288 degrees */}
            <circle
              cx="2.25"
              cy="-6"
              r="2.4"
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

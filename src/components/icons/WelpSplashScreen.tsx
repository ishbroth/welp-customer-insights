
import React from 'react';
import WelpAppIcon from './WelpAppIcon';

interface WelpSplashScreenProps {
  width?: number;
  height?: number;
  className?: string;
}

const WelpSplashScreen: React.FC<WelpSplashScreenProps> = ({ 
  width = 375, 
  height = 812, 
  className = "" 
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width, 
        height, 
        backgroundColor: '#ea384c' 
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red background */}
        <rect
          width={width}
          height={height}
          fill="#ea384c"
        />
        
        {/* Centered app icon */}
        <g transform={`translate(${width/2 - 60}, ${height/2 - 60})`}>
          {/* Simplified version of the app icon for splash screen */}
          <circle r="60" fill="rgba(255,255,255,0.1)" />
          
          {/* Asterisk */}
          <g transform="translate(20, -15) rotate(15)">
            <path
              d="M 0 -25 L 0 25 M -22 -12 L 22 12 M -22 12 L 22 -12"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="0" cy="-35" r="4" fill="white" />
          </g>
          
          {/* "Welp" text */}
          <text
            x="0"
            y="45"
            textAnchor="middle"
            fill="white"
            fontSize="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            letterSpacing="-0.02em"
          >
            Welp
          </text>
        </g>
      </svg>
    </div>
  );
};

export default WelpSplashScreen;

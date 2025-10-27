import React from 'react';
import './WelpLoadingIcon.css';

interface WelpLoadingIconProps {
  size?: number;
  showText?: boolean;
  text?: string;
  className?: string;
}

const WelpLoadingIcon: React.FC<WelpLoadingIconProps> = ({ 
  size = 80, 
  showText = false, 
  text = "Loading...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size} viewBox="0 0 200 200">
          <g transform="translate(100, 100) rotate(12)">
            {/* Right arm (0 degrees) */}
            <path 
              d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
              fill="white" 
              className="welp-arm-right" 
            />
            
            {/* Bottom-right diagonal arm (72 degrees) */}
            <g transform="rotate(72)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="welp-arm-bottom-right" 
              />
            </g>
            
            {/* Bottom-left diagonal arm (144 degrees) */}
            <g transform="rotate(144)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="welp-arm-bottom-left" 
              />
            </g>
            
            {/* Top-left diagonal arm (216 degrees) */}
            <g transform="rotate(216)">
              <path 
                d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" 
                fill="white" 
                className="welp-arm-top-left" 
              />
            </g>
            
            {/* Period positioned at 288 degrees */}
            <circle 
              cx="7.5" 
              cy="-20" 
              r="8" 
              fill="white" 
              className="welp-period" 
            />
          </g>
        </svg>
      </div>
      {showText && (
        <p className="mt-3 text-muted-foreground text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default WelpLoadingIcon;
import React from 'react';
import './WelpLoadingIcon.css';

interface WelpLoadingIconProps {
  size?: number;
  showText?: boolean;
  text?: string;
  className?: string;
  duration?: number; // Duration in seconds for one full rotation
}

const WelpLoadingIcon: React.FC<WelpLoadingIconProps> = ({
  size = 80,
  showText = false,
  text = "Loading...",
  className = "",
  duration = 3 // Default 3 seconds for one full rotation
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
      >
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
      {showText && (
        <p className="mt-3 text-muted-foreground text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default WelpLoadingIcon;
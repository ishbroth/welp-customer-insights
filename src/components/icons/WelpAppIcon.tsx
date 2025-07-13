
import React from 'react';

interface WelpAppIconProps {
  size?: number;
  className?: string;
}

const WelpAppIcon: React.FC<WelpAppIconProps> = ({ size = 1024, className = "" }) => {
  const iconSize = size;
  const fontSize = size * 0.24; // 200% larger - was 0.12
  const asteriskSize = size * 0.5; // 200% larger - was 0.25

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: iconSize, height: iconSize }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red background with rounded corners for app icon */}
        <rect
          width={iconSize}
          height={iconSize}
          rx={iconSize * 0.18} // iOS-style rounded corners
          fill="#ea384c"
        />
        
        {/* Custom cartoonish asterisk with separated arms and period replacing top arm */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.25}) rotate(15)`}>
          {/* Bottom arm (vertical down) - separated from center */}
          <path
            d={`M 0 ${asteriskSize * 0.15} L 0 ${asteriskSize * 0.4}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bottom-left diagonal arm - separated from center */}
          <path
            d={`M -${asteriskSize * 0.11} ${asteriskSize * 0.11} L -${asteriskSize * 0.35} ${asteriskSize * 0.35}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bottom-right diagonal arm - separated from center */}
          <path
            d={`M ${asteriskSize * 0.11} ${asteriskSize * 0.11} L ${asteriskSize * 0.35} ${asteriskSize * 0.35}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Top-left diagonal arm - separated from center */}
          <path
            d={`M -${asteriskSize * 0.11} -${asteriskSize * 0.11} L -${asteriskSize * 0.35} -${asteriskSize * 0.35}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Top-right diagonal arm - separated from center */}
          <path
            d={`M ${asteriskSize * 0.11} -${asteriskSize * 0.11} L ${asteriskSize * 0.35} -${asteriskSize * 0.35}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Period replacing the top arm of the asterisk */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.35}
            r={asteriskSize * 0.08}
            fill="white"
          />
        </g>
        
        {/* "Welp" text in bottom third - stretched to fill 80% width */}
        <text
          x={iconSize / 2}
          y={iconSize * 0.82}
          textAnchor="middle"
          fill="white"
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          letterSpacing="0.08em"
          transform={`scale(2.0, 1)`}
        >
          Welp
        </text>
      </svg>
    </div>
  );
};

export default WelpAppIcon;

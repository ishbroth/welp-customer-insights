
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
        <g transform={`translate(${iconSize * 0.5}, ${iconSize * 0.33}) rotate(0)`}>
          {/* Top-right diagonal arm (45 degrees) - separated from center */}
          <path
            d={`M ${asteriskSize * 0.08} -${asteriskSize * 0.08} L ${asteriskSize * 0.32} -${asteriskSize * 0.32}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right horizontal arm (90 degrees) - separated from center */}
          <path
            d={`M ${asteriskSize * 0.08} 0 L ${asteriskSize * 0.32} 0`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bottom-right diagonal arm (135 degrees) - separated from center */}
          <path
            d={`M ${asteriskSize * 0.08} ${asteriskSize * 0.08} L ${asteriskSize * 0.32} ${asteriskSize * 0.32}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bottom vertical arm (180 degrees) - separated from center */}
          <path
            d={`M 0 ${asteriskSize * 0.08} L 0 ${asteriskSize * 0.32}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Bottom-left diagonal arm (225 degrees) - separated from center */}
          <path
            d={`M -${asteriskSize * 0.08} ${asteriskSize * 0.08} L -${asteriskSize * 0.32} ${asteriskSize * 0.32}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left horizontal arm (270 degrees) - separated from center */}
          <path
            d={`M -${asteriskSize * 0.08} 0 L -${asteriskSize * 0.32} 0`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Top-left diagonal arm (315 degrees) - separated from center */}
          <path
            d={`M -${asteriskSize * 0.08} -${asteriskSize * 0.08} L -${asteriskSize * 0.32} -${asteriskSize * 0.32}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Period replacing the top arm of the asterisk */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.32}
            r={asteriskSize * 0.06}
            fill="white"
          />
        </g>
        
        {/* "Welp" text centered in the icon square */}
        <text
          x={iconSize / 2}
          y={iconSize * 0.82}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          Welp
        </text>
      </svg>
    </div>
  );
};

export default WelpAppIcon;

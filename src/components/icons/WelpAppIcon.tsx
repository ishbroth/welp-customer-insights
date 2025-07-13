
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
        
        {/* Custom cartoonish asterisk with period replacing top point */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.25}) rotate(15)`}>
          {/* Vertical line (bottom part only since top is replaced by period) */}
          <path
            d={`M 0 -${asteriskSize * 0.1} L 0 ${asteriskSize * 0.4}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Diagonal lines with gaps in the center for cartoonish effect */}
          <path
            d={`M -${asteriskSize * 0.35} -${asteriskSize * 0.2} L -${asteriskSize * 0.08} -${asteriskSize * 0.08} M ${asteriskSize * 0.08} ${asteriskSize * 0.08} L ${asteriskSize * 0.35} ${asteriskSize * 0.2}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M -${asteriskSize * 0.35} ${asteriskSize * 0.2} L -${asteriskSize * 0.08} ${asteriskSize * 0.08} M ${asteriskSize * 0.08} -${asteriskSize * 0.08} L ${asteriskSize * 0.35} -${asteriskSize * 0.2}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.12}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Period replacing the top point of the asterisk */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.35}
            r={asteriskSize * 0.08}
            fill="white"
          />
        </g>
        
        {/* "Welp" text in bottom third - 200% larger */}
        <text
          x={iconSize / 2}
          y={iconSize * 0.82}
          textAnchor="middle"
          fill="white"
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          letterSpacing="-0.02em"
        >
          Welp
        </text>
      </svg>
    </div>
  );
};

export default WelpAppIcon;

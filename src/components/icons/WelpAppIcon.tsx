
import React from 'react';

interface WelpAppIconProps {
  size?: number;
  className?: string;
}

const WelpAppIcon: React.FC<WelpAppIconProps> = ({ size = 1024, className = "" }) => {
  const iconSize = size;
  const fontSize = size * 0.12; // Font size relative to icon size
  const asteriskSize = size * 0.25; // Asterisk size relative to icon size

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
        
        {/* Custom asterisk with period on top - positioned in top right area */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.25}) rotate(15)`}>
          {/* Main asterisk body */}
          <path
            d={`M 0 -${asteriskSize * 0.4} L 0 ${asteriskSize * 0.4} M -${asteriskSize * 0.35} -${asteriskSize * 0.2} L ${asteriskSize * 0.35} ${asteriskSize * 0.2} M -${asteriskSize * 0.35} ${asteriskSize * 0.2} L ${asteriskSize * 0.35} -${asteriskSize * 0.2}`}
            stroke="white"
            strokeWidth={asteriskSize * 0.08}
            strokeLinecap="round"
            fill="none"
          />
          {/* Period at the top instead of exclamation point */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.55}
            r={asteriskSize * 0.06}
            fill="white"
          />
        </g>
        
        {/* "Welp" text in bottom third */}
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

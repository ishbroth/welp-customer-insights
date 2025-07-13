
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
        
        {/* Yelp-style asterisk with 4 bulbous arms and period at top, tilted slightly */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.3}) rotate(-12)`}>
          {/* Right arm (0 degrees) - bulbous shape like Yelp */}
          <path
            d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
            fill="white"
          />
          
          {/* Bottom-right diagonal arm (90 degrees) */}
          <g transform="rotate(90)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Left arm (180 degrees) */}
          <g transform="rotate(180)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Top-left diagonal arm (270 degrees) */}
          <g transform="rotate(270)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Period at the top (replacing the 5th arm) */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.32}
            r={asteriskSize * 0.08}
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

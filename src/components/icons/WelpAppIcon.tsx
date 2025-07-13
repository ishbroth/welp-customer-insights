
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
        
        {/* Yelp-style asterisk with 5 arms (4 actual arms + period replacing top arm), tilted opposite direction */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.3}) rotate(12)`}>
          {/* Right arm (0 degrees) - bulbous shape like Yelp */}
          <path
            d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
            fill="white"
          />
          
          {/* Bottom-right diagonal arm (72 degrees) */}
          <g transform="rotate(72)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Bottom-left diagonal arm (144 degrees) */}
          <g transform="rotate(144)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Top-left diagonal arm (216 degrees) */}
          <g transform="rotate(216)">
            <path
              d={`M 0 0 Q ${asteriskSize * 0.15} -${asteriskSize * 0.08} ${asteriskSize * 0.28} -${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.32} 0 ${asteriskSize * 0.28} ${asteriskSize * 0.04} 
                  Q ${asteriskSize * 0.15} ${asteriskSize * 0.08} 0 0`}
              fill="white"
            />
          </g>
          
          {/* Period centered between the two top arms */}
          <circle
            cx={asteriskSize * 0.12}
            cy={-asteriskSize * 0.24}
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

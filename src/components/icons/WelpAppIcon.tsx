
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
        
        {/* Custom cartoonish asterisk with 5 arms and period at top, tilted slightly */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.3}) rotate(-12)`}>
          {/* Right arm (0 degrees) */}
          <path
            d={`M ${asteriskSize * 0.08} 0 Q ${asteriskSize * 0.2} -${asteriskSize * 0.02} ${asteriskSize * 0.32} 0 Q ${asteriskSize * 0.2} ${asteriskSize * 0.02} ${asteriskSize * 0.08} 0`}
            fill="white"
          />
          
          {/* Bottom-right diagonal arm (72 degrees) */}
          <g transform="rotate(72)">
            <path
              d={`M ${asteriskSize * 0.08} 0 Q ${asteriskSize * 0.2} -${asteriskSize * 0.02} ${asteriskSize * 0.32} 0 Q ${asteriskSize * 0.2} ${asteriskSize * 0.02} ${asteriskSize * 0.08} 0`}
              fill="white"
            />
          </g>
          
          {/* Bottom-left diagonal arm (144 degrees) */}
          <g transform="rotate(144)">
            <path
              d={`M ${asteriskSize * 0.08} 0 Q ${asteriskSize * 0.2} -${asteriskSize * 0.02} ${asteriskSize * 0.32} 0 Q ${asteriskSize * 0.2} ${asteriskSize * 0.02} ${asteriskSize * 0.08} 0`}
              fill="white"
            />
          </g>
          
          {/* Top-left diagonal arm (216 degrees) */}
          <g transform="rotate(216)">
            <path
              d={`M ${asteriskSize * 0.08} 0 Q ${asteriskSize * 0.2} -${asteriskSize * 0.02} ${asteriskSize * 0.32} 0 Q ${asteriskSize * 0.2} ${asteriskSize * 0.02} ${asteriskSize * 0.08} 0`}
              fill="white"
            />
          </g>
          
          {/* Top-right diagonal arm (288 degrees) */}
          <g transform="rotate(288)">
            <path
              d={`M ${asteriskSize * 0.08} 0 Q ${asteriskSize * 0.2} -${asteriskSize * 0.02} ${asteriskSize * 0.32} 0 Q ${asteriskSize * 0.2} ${asteriskSize * 0.02} ${asteriskSize * 0.08} 0`}
              fill="white"
            />
          </g>
          
          {/* Period at the top */}
          <circle
            cx="0"
            cy={-asteriskSize * 0.35}
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

import { ReactNode } from 'react';
import { useMobileScale } from '@/hooks/useMobileScale';

interface MobileScaleWrapperProps {
  children: ReactNode;
  className?: string;
  forceScale?: boolean; // Force scaling even for specific pages
}

const MobileScaleWrapper = ({ children, className = '', forceScale = false }: MobileScaleWrapperProps) => {
  const { shouldScale, scale, containerWidth } = useMobileScale();

  if (!shouldScale) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`overflow-x-auto ${className}`}
      style={{
        width: containerWidth,
        transformOrigin: 'top left'
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: '100%',
          minHeight: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileScaleWrapper;
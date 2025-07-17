
import React from 'react';

interface AppIconPreviewProps {
  icon: string;
  size?: number;
}

const AppIconPreview: React.FC<AppIconPreviewProps> = ({ icon, size = 24 }) => {
  // Secure SVG creation without innerHTML manipulation
  const createSecureSVG = (iconString: string, svgSize: number) => {
    // Parse the icon string safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(iconString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) {
      // Fallback for invalid SVG
      return null;
    }
    
    // Create a new SVG element with secure attributes
    const secureSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // Set secure attributes
    secureSVG.setAttribute('width', svgSize.toString());
    secureSVG.setAttribute('height', svgSize.toString());
    secureSVG.setAttribute('viewBox', svgElement.getAttribute('viewBox') || `0 0 ${svgSize} ${svgSize}`);
    secureSVG.setAttribute('fill', svgElement.getAttribute('fill') || 'currentColor');
    
    // Copy child elements safely
    Array.from(svgElement.children).forEach(child => {
      const clonedChild = child.cloneNode(true);
      secureSVG.appendChild(clonedChild);
    });
    
    return secureSVG;
  };

  const svgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (svgRef.current && icon) {
      // Clear previous content
      svgRef.current.innerHTML = '';
      
      const secureSVG = createSecureSVG(icon, size);
      if (secureSVG) {
        svgRef.current.appendChild(secureSVG);
      }
    }
  }, [icon, size]);

  return (
    <div 
      ref={svgRef}
      className="inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    />
  );
};

export default AppIconPreview;

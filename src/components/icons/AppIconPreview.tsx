import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import WelpAppIcon from './WelpAppIcon';

const AppIconPreview: React.FC = () => {
  const downloadIcon = (size: number, format: 'png' | 'svg' = 'png') => {
    // Create a temporary container to render the WelpAppIcon
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.innerHTML = `
      <div style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#ea384c"/>
          <g transform="translate(${size * 0.65}, ${size * 0.3}) rotate(12)">
            <path d="M ${size * 0.012} 0 Q ${size * 0.108} -${size * 0.06} ${size * 0.204} -${size * 0.03} Q ${size * 0.228} 0 ${size * 0.204} ${size * 0.03} Q ${size * 0.108} ${size * 0.06} ${size * 0.012} 0" fill="white"/>
            <g transform="rotate(72)">
              <path d="M ${size * 0.012} 0 Q ${size * 0.108} -${size * 0.06} ${size * 0.204} -${size * 0.03} Q ${size * 0.228} 0 ${size * 0.204} ${size * 0.03} Q ${size * 0.108} ${size * 0.06} ${size * 0.012} 0" fill="white"/>
            </g>
            <g transform="rotate(144)">
              <path d="M ${size * 0.012} 0 Q ${size * 0.108} -${size * 0.06} ${size * 0.204} -${size * 0.03} Q ${size * 0.228} 0 ${size * 0.204} ${size * 0.03} Q ${size * 0.108} ${size * 0.06} ${size * 0.012} 0" fill="white"/>
            </g>
            <g transform="rotate(216)">
              <path d="M ${size * 0.012} 0 Q ${size * 0.108} -${size * 0.06} ${size * 0.204} -${size * 0.03} Q ${size * 0.228} 0 ${size * 0.204} ${size * 0.03} Q ${size * 0.108} ${size * 0.06} ${size * 0.012} 0" fill="white"/>
            </g>
            <circle cx="${size * 0.045}" cy="-${size * 0.12}" r="${size * 0.048}" fill="white"/>
          </g>
          <text x="${size / 2}" y="${size * 0.82}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${size * 0.24}" font-family="system-ui, -apple-system, sans-serif" font-weight="700" letter-spacing="0.08em">Welp</text>
        </svg>
      </div>
    `;
    document.body.appendChild(tempContainer);

    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const svgElement = tempContainer.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `welp-icon-${size}x${size}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(svgUrl);
      document.body.removeChild(tempContainer);
    };
    img.src = svgUrl;
  };

  const iconSizes = [
    { size: 16, label: '16×16 (Favicon)' },
    { size: 32, label: '32×32 (Favicon)' },
    { size: 57, label: '57×57 (iOS)' },
    { size: 60, label: '60×60 (iOS)' },
    { size: 72, label: '72×72 (iOS)' },
    { size: 76, label: '76×76 (iOS)' },
    { size: 114, label: '114×114 (iOS)' },
    { size: 120, label: '120×120 (iOS)' },
    { size: 144, label: '144×144 (iOS)' },
    { size: 152, label: '152×152 (iOS)' },
    { size: 180, label: '180×180 (iOS)' },
    { size: 192, label: '192×192 (Android)' },
    { size: 512, label: '512×512 (Android)' },
    { size: 1024, label: '1024×1024 (App Store)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Welp App Icon Preview</h1>
          
          {/* Large Preview - Using our custom WelpAppIcon */}
          <div className="text-center mb-12">
            <div className="inline-block shadow-lg mx-auto mb-4">
              <WelpAppIcon size={128} className="rounded-3xl" />
            </div>
            <p className="text-gray-600">Preview (128×128) - Custom Welp Icon with Asterisk & Period</p>
          </div>

          {/* Download Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iconSizes.map(({ size, label }) => (
              <div key={size} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{label}</h3>
                    <p className="text-sm text-gray-500">{size}×{size} pixels</p>
                  </div>
                  <Button
                    onClick={() => downloadIcon(size)}
                    size="sm"
                    className="bg-[#ea384c] hover:bg-[#d02e40]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">About This Icon</h2>
            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>• Features a custom Yelp-style asterisk with 4 arms and a period</li>
              <li>• Red background (#ea384c) with rounded corners for iOS style</li>
              <li>• "Welp" text with professional typography</li>
              <li>• Designed specifically for the Welp brand identity</li>
            </ul>
            <h2 className="text-lg font-semibold mb-2">Usage Instructions</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use 16×16 and 32×32 for favicon.ico</li>
              <li>• iOS icons should be placed in your app bundle</li>
              <li>• Android icons go in res/mipmap directories</li>
              <li>• 1024×1024 is required for App Store submissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppIconPreview;

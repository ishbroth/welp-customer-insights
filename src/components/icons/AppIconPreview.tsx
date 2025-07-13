
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AppIconPreview: React.FC = () => {
  const downloadIcon = (size: number, format: 'png' | 'svg' = 'png') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#ea384c');
    gradient.addColorStop(1, '#d02e40');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add rounded corners
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = size * 0.225; // iOS standard corner radius
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // Add "W" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', size / 2, size / 2);

    // Download the image
    const link = document.createElement('a');
    link.download = `welp-icon-${size}x${size}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
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
          
          {/* Large Preview */}
          <div className="text-center mb-12">
            <div 
              className="inline-block w-32 h-32 rounded-3xl shadow-lg mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, #ea384c 0%, #d02e40 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              W
            </div>
            <p className="text-gray-600">Preview (128×128)</p>
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

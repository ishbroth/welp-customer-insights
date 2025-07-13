
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Tablet, Monitor } from "lucide-react";

const AppStoreAssets: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'phone' | 'tablet' | 'desktop'>('phone');

  const downloadScreenshot = (width: number, height: number, device: string, index: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Header
    const headerHeight = height * 0.1;
    ctx.fillStyle = '#ea384c';
    ctx.fillRect(0, 0, width, headerHeight);

    // Welp logo in header
    ctx.fillStyle = 'white';
    ctx.font = `bold ${headerHeight * 0.4}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Welp.', width * 0.05, headerHeight / 2);

    // Main content area
    const contentY = headerHeight + 20;
    const contentHeight = height - headerHeight - 40;

    // Mock content based on screenshot type
    const screenshots = [
      {
        title: 'Search & Discover',
        subtitle: 'Find trusted customers in your area',
        features: ['Advanced search filters', 'Verified customer profiles', 'Real business reviews']
      },
      {
        title: 'Rate & Review',
        subtitle: 'Share your customer experiences',
        features: ['5-star rating system', 'Detailed review forms', 'Photo attachments']
      },
      {
        title: 'Business Dashboard',
        subtitle: 'Manage your reputation',
        features: ['Review analytics', 'Customer insights', 'Response management']
      },
      {
        title: 'Verified Network',
        subtitle: 'Connect with quality customers',
        features: ['Identity verification', 'Business licensing', 'Trust & safety']
      },
      {
        title: 'Mobile Ready',
        subtitle: 'Take Welp everywhere',
        features: ['Native mobile apps', 'Offline access', 'Push notifications']
      }
    ];

    const screenshot = screenshots[index % screenshots.length];

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${width * 0.06}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(screenshot.title, width / 2, contentY + 60);

    // Subtitle
    ctx.fillStyle = '#6b7280';
    ctx.font = `${width * 0.04}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillText(screenshot.subtitle, width / 2, contentY + 120);

    // Features list
    ctx.textAlign = 'left';
    ctx.fillStyle = '#374151';
    ctx.font = `${width * 0.035}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    
    screenshot.features.forEach((feature, i) => {
      const y = contentY + 200 + (i * 60);
      
      // Bullet point
      ctx.fillStyle = '#ea384c';
      ctx.beginPath();
      ctx.arc(width * 0.1, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Feature text
      ctx.fillStyle = '#374151';
      ctx.fillText(feature, width * 0.15, y + 5);
    });

    // Mock phone/tablet frame for mobile screenshots
    if (device !== 'desktop') {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 3;
      ctx.roundRect(width * 0.1, contentY + 350, width * 0.8, height * 0.4, 20);
      ctx.stroke();
      
      // Mock app interface inside frame
      const frameX = width * 0.1 + 10;
      const frameY = contentY + 360;
      const frameWidth = width * 0.8 - 20;
      const frameHeight = height * 0.4 - 20;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      
      // Mock search bar
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(frameX + 20, frameY + 20, frameWidth - 40, 40);
      
      // Mock content cards
      for (let i = 0; i < 3; i++) {
        const cardY = frameY + 80 + (i * 60);
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(frameX + 20, cardY, frameWidth - 40, 50);
        
        ctx.fillStyle = '#ea384c';
        ctx.beginPath();
        ctx.arc(frameX + 45, cardY + 25, 15, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Download
    const link = document.createElement('a');
    link.download = `welp-screenshot-${device}-${width}x${height}-${index + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const screenshotSets = {
    phone: [
      { width: 1290, height: 2796, label: 'iPhone 15 Pro Max' },
      { width: 1179, height: 2556, label: 'iPhone 15 Pro' },
      { width: 1290, height: 2796, label: 'iPhone 15 Plus' },
      { width: 1179, height: 2556, label: 'iPhone 15' },
      { width: 1284, height: 2778, label: 'iPhone 14 Pro Max' },
    ],
    tablet: [
      { width: 2048, height: 2732, label: 'iPad Pro 12.9"' },
      { width: 1668, height: 2388, label: 'iPad Pro 11"' },
      { width: 1620, height: 2160, label: 'iPad Air' },
      { width: 1488, height: 2266, label: 'iPad Mini' },
    ],
    desktop: [
      { width: 1920, height: 1080, label: 'Desktop HD' },
      { width: 2560, height: 1440, label: 'Desktop QHD' },
      { width: 1366, height: 768, label: 'Laptop Standard' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">App Store Assets Generator</h1>
          
          {/* Device Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-2 shadow-sm border">
              <div className="flex space-x-2">
                <Button
                  variant={selectedDevice === 'phone' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('phone')}
                  className="flex items-center"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Phone
                </Button>
                <Button
                  variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('tablet')}
                  className="flex items-center"
                >
                  <Tablet className="w-4 h-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('desktop')}
                  className="flex items-center"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
              </div>
            </div>
          </div>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshotSets[selectedDevice].map((size, index) => (
              <div key={`${size.width}x${size.height}`} className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">{size.label}</h3>
                <p className="text-gray-600 mb-4">{size.width} × {size.height}</p>
                
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((screenshotNum) => (
                    <Button
                      key={screenshotNum}
                      onClick={() => downloadScreenshot(size.width, size.height, selectedDevice, screenshotNum - 1)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Screenshot {screenshotNum}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">App Store Requirements</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• iPhone: Up to 10 screenshots</li>
                <li>• iPad: Up to 10 screenshots</li>
                <li>• Screenshots must be in PNG or JPEG format</li>
                <li>• Use device-specific resolutions</li>
                <li>• Show actual app functionality</li>
                <li>• Avoid mockups or conceptual images</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Google Play Requirements</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Phone: Up to 8 screenshots</li>
                <li>• Tablet: Up to 8 screenshots</li>
                <li>• 16:9 or 9:16 aspect ratio recommended</li>
                <li>• Minimum 320px on any side</li>
                <li>• Maximum 3840px on any side</li>
                <li>• PNG or JPEG format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStoreAssets;


import React from 'react';
import WelpAppIcon from './WelpAppIcon';

const AppIconPreview: React.FC = () => {
  const iconSizes = [
    { size: 16, label: 'Notification (16px)' },
    { size: 20, label: 'Settings (20px)' },
    { size: 29, label: 'Spotlight (29px)' },
    { size: 40, label: 'Spotlight (40px)' },
    { size: 58, label: 'iPhone Settings (58px)' },
    { size: 60, label: 'iPhone App (60px)' },
    { size: 80, label: 'iPad Spotlight (80px)' },
    { size: 87, label: 'iPhone Spotlight (87px)' },
    { size: 120, label: 'iPhone App (120px)' },
    { size: 180, label: 'iPhone App (180px)' },
    { size: 1024, label: 'App Store (1024px)' }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Welp App Icon Preview</h1>
        <p className="text-center text-gray-600 mb-12">
          App icon design inspired by Yelp with "Welp" branding and period-topped asterisk
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-end">
          {iconSizes.map(({ size, label }) => (
            <div key={size} className="flex flex-col items-center space-y-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <WelpAppIcon size={size} />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">{size}px</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Large preview */}
        <div className="mt-16 flex justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-center">Main App Store Icon</h2>
            <WelpAppIcon size={256} />
          </div>
        </div>

        {/* App Store Mockup */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">App Store Preview</h2>
          <div className="flex items-center space-x-4 mb-4">
            <WelpAppIcon size={80} className="rounded-xl" />
            <div>
              <h3 className="text-lg font-semibold">Welp. - Review Customers</h3>
              <p className="text-gray-600 text-sm">Business Review Management</p>
              <p className="text-gray-500 text-xs">Business</p>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium">
            GET
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppIconPreview;


import React from 'react';
import WelpAppIcon from '@/components/icons/WelpAppIcon';

const AppIconPreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welp App Icon Preview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Different sizes preview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Small (64px)</h2>
            <div className="flex justify-center">
              <WelpAppIcon size={64} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Medium (128px)</h2>
            <div className="flex justify-center">
              <WelpAppIcon size={128} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Large (256px)</h2>
            <div className="flex justify-center">
              <WelpAppIcon size={256} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4">App Store Size (512px)</h2>
            <div className="flex justify-center">
              <WelpAppIcon size={512} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppIconPreviewPage;

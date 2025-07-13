
import React from 'react';
import WelpAppIcon from '@/components/icons/WelpAppIcon';
import WelpSplashScreen from '@/components/icons/WelpSplashScreen';
import AppScreenshots from './AppScreenshots';

const AppStoreAssets: React.FC = () => {
  const appStoreData = {
    name: "Welp. - Review Customers",
    subtitle: "Business Review Management",
    description: `Take control of your business reputation with Welp - the comprehensive review management platform designed for modern businesses.

Key Features:
• Manage and respond to customer reviews
• Gain valuable customer insights and analytics
• Capture and organize review photos with integrated camera
• Receive instant push notifications for new reviews
• Secure authentication and data protection
• Mobile-optimized interface for on-the-go management

Perfect for:
• Service-based businesses
• Retailers and restaurants
• Professional services
• Any business that values customer feedback

Transform customer feedback into business growth with Welp's intuitive review management system.`,
    keywords: "business reviews, customer feedback, review management, business insights, customer service, reputation management, business analytics",
    category: "Business",
    ageRating: "4+",
    version: "1.0.0"
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">App Store Assets</h1>
        
        {/* App Icon Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">App Icon</h2>
          <div className="flex justify-center mb-6">
            <WelpAppIcon size={200} />
          </div>
          <div className="text-center text-gray-600">
            <p>1024x1024px App Store icon featuring the Welp brand</p>
            <p>Red background (#ea384c) with white text and period-topped asterisk</p>
          </div>
        </div>

        {/* Splash Screen Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Splash Screen</h2>
          <div className="flex justify-center">
            <div className="border-4 border-gray-300 rounded-3xl overflow-hidden">
              <WelpSplashScreen width={200} height={400} />
            </div>
          </div>
          <div className="text-center text-gray-600 mt-4">
            <p>Mobile splash screen with brand colors and simplified logo</p>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <AppScreenshots />
        </div>

        {/* App Store Metadata */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">App Store Metadata</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">App Name</h3>
              <p className="text-gray-700">{appStoreData.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subtitle</h3>
              <p className="text-gray-700">{appStoreData.subtitle}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Category</h3>
              <p className="text-gray-700">{appStoreData.category}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Age Rating</h3>
              <p className="text-gray-700">{appStoreData.ageRating}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Keywords</h3>
              <p className="text-gray-700 text-sm">{appStoreData.keywords}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Description</h3>
              <div className="text-gray-700 text-sm whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {appStoreData.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStoreAssets;

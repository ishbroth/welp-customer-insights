
import React from 'react';
import WelpAppIcon from '@/components/icons/WelpAppIcon';
import WelpSplashScreen from '@/components/icons/WelpSplashScreen';

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

  const screenshotFeatures = [
    {
      title: "Dashboard Overview",
      description: "Comprehensive view of all your customer reviews and insights"
    },
    {
      title: "Review Management", 
      description: "Easily read, respond to, and manage customer reviews"
    },
    {
      title: "Customer Insights",
      description: "Analytics and insights about your customer interactions"
    },
    {
      title: "Mobile Camera",
      description: "Capture and attach photos directly from your mobile device"
    },
    {
      title: "Push Notifications",
      description: "Stay informed with instant notifications for new reviews"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
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

        {/* App Store Metadata */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
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

        {/* Screenshot Features */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">Screenshot Features to Highlight</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {screenshotFeatures.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Screenshot Guidelines</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• iOS: 6.5" display (1284 x 2778 pixels) and 5.5" display (1242 x 2208 pixels)</li>
              <li>• Android: 1080 x 1920 pixels minimum</li>
              <li>• Include device frames for professional appearance</li>
              <li>• Show actual app interface with real data</li>
              <li>• Highlight key features and user benefits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStoreAssets;

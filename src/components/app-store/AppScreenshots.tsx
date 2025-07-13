
import React from 'react';

const AppScreenshots: React.FC = () => {
  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "Main review management interface with customer insights",
      url: "/api/placeholder/300/650"
    },
    {
      title: "Review Management", 
      description: "Read and respond to customer reviews efficiently",
      url: "/api/placeholder/300/650"
    },
    {
      title: "Customer Insights",
      description: "Analytics and customer data visualization",
      url: "/api/placeholder/300/650"
    },
    {
      title: "Mobile Camera",
      description: "Capture and organize photos with integrated camera",
      url: "/api/placeholder/300/650"
    },
    {
      title: "Push Notifications",
      description: "Stay updated with instant notifications",
      url: "/api/placeholder/300/650"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">App Screenshots</h2>
      <p className="text-gray-600 mb-8">
        Required screenshots for App Store submission (iPhone 6.7" display size recommended)
      </p>
      
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-3 border-2 border-dashed border-gray-300">
              <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center text-gray-500 text-sm">
                Screenshot {index + 1}
                <br />
                (300x650px)
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-1">{screenshot.title}</h3>
            <p className="text-xs text-gray-600">{screenshot.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Screenshot Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• iPhone 6.7" display: 1290 x 2796 pixels</li>
          <li>• iPhone 6.5" display: 1242 x 2688 pixels</li>
          <li>• iPhone 5.5" display: 1242 x 2208 pixels</li>
          <li>• Minimum 3 screenshots, maximum 10</li>
          <li>• Show actual app interface and key features</li>
        </ul>
      </div>
    </div>
  );
};

export default AppScreenshots;

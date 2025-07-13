
import React from 'react';

const AppScreenshots: React.FC = () => {
  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "Comprehensive view of all customer reviews and business insights",
      component: <DashboardScreenshot />
    },
    {
      title: "Review Management", 
      description: "Easy-to-use interface for reading and responding to customer reviews",
      component: <ReviewManagementScreenshot />
    },
    {
      title: "Customer Insights",
      description: "Analytics dashboard showing customer feedback trends and patterns",
      component: <CustomerInsightsScreenshot />
    },
    {
      title: "Mobile Camera",
      description: "Integrated camera functionality for capturing review-related photos",
      component: <MobileCameraScreenshot />
    },
    {
      title: "Push Notifications",
      description: "Stay informed with instant notifications about new reviews and responses",
      component: <NotificationsScreenshot />
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">App Screenshots</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Professional app screenshots showcasing key features for app store submission
        </p>
      </div>
      
      <div className="grid gap-8">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/3">
                <h3 className="text-xl font-semibold mb-2">{screenshot.title}</h3>
                <p className="text-gray-600 mb-4">{screenshot.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Optimized for App Store submission</p>
                  <p>Available in multiple device sizes</p>
                </div>
              </div>
              <div className="lg:w-2/3 flex justify-center">
                <div className="relative">
                  {screenshot.component}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock screenshot components
const DashboardScreenshot: React.FC = () => (
  <div className="w-64 h-[550px] bg-gray-900 rounded-3xl p-1 shadow-2xl">
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
      {/* Status bar */}
      <div className="h-8 bg-gray-50 flex items-center justify-between px-4 text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-red-500 text-white p-4">
        <h1 className="text-lg font-semibold">Welp Dashboard</h1>
        <p className="text-red-100 text-sm">Review Management</p>
      </div>
      
      {/* Stats cards */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">42</div>
            <div className="text-xs text-blue-800">New Reviews</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-xs text-green-800">Avg Rating</div>
          </div>
        </div>
        
        {/* Recent reviews */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Recent Reviews</h3>
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">Customer {i}</span>
                <div className="flex text-yellow-400 text-xs">★★★★★</div>
              </div>
              <p className="text-xs text-gray-600">Great service and friendly staff...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ReviewManagementScreenshot: React.FC = () => (
  <div className="w-64 h-[550px] bg-gray-900 rounded-3xl p-1 shadow-2xl">
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
      <div className="h-8 bg-gray-50 flex items-center justify-between px-4 text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
      
      <div className="bg-red-500 text-white p-4 flex items-center">
        <span className="text-white mr-3">←</span>
        <h1 className="text-lg font-semibold">Review Details</h1>
      </div>
      
      <div className="p-4">
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold">Sarah Johnson</span>
            <div className="flex text-yellow-400">★★★★★</div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Excellent service! The team was professional and the results exceeded my expectations. Highly recommend!
          </p>
          <span className="text-xs text-gray-500">2 hours ago</span>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold">Your Response</h3>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm" 
            rows={4}
            placeholder="Thank you for your wonderful review..."
            defaultValue="Thank you so much for your wonderful review, Sarah! We're thrilled to hear that our team exceeded your expectations."
          />
          <button className="w-full bg-red-500 text-white py-2 rounded-lg font-medium">
            Send Response
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CustomerInsightsScreenshot: React.FC = () => (
  <div className="w-64 h-[550px] bg-gray-900 rounded-3xl p-1 shadow-2xl">
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
      <div className="h-8 bg-gray-50 flex items-center justify-between px-4 text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
      
      <div className="bg-red-500 text-white p-4">
        <h1 className="text-lg font-semibold">Customer Insights</h1>
        <p className="text-red-100 text-sm">Analytics & Trends</p>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Review Trends</h3>
          <div className="h-20 bg-white rounded border flex items-end p-2 space-x-1">
            {[40, 60, 45, 80, 65, 90, 75].map((height, i) => (
              <div key={i} className="bg-purple-400 w-4 rounded-t" style={{height: `${height}%`}}></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">89%</div>
            <div className="text-xs text-blue-800">Positive Reviews</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-orange-600">2.1d</div>
            <div className="text-xs text-orange-800">Avg Response Time</div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Top Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {['Excellent', 'Professional', 'Fast', 'Friendly', 'Quality'].map(keyword => (
              <span key={keyword} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MobileCameraScreenshot: React.FC = () => (
  <div className="w-64 h-[550px] bg-gray-900 rounded-3xl p-1 shadow-2xl">
    <div className="w-full h-full bg-gray-900 rounded-3xl overflow-hidden">
      <div className="h-8 bg-black flex items-center justify-between px-4 text-xs text-white">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-6 h-2 bg-white rounded-sm"></div>
        </div>
      </div>
      
      <div className="relative h-full bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button className="text-white">✕</button>
          <span className="text-white font-medium">Camera</span>
          <button className="text-white">⚙</button>
        </div>
        
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-xs">Capture review photos</p>
        </div>
        
        <div className="absolute bottom-8 right-4">
          <div className="w-10 h-10 bg-white rounded-lg opacity-80"></div>
        </div>
      </div>
    </div>
  </div>
);

const NotificationsScreenshot: React.FC = () => (
  <div className="w-64 h-[550px] bg-gray-900 rounded-3xl p-1 shadow-2xl">
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
      <div className="h-8 bg-gray-50 flex items-center justify-between px-4 text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
      
      <div className="bg-red-500 text-white p-4">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <p className="text-red-100 text-sm">Stay Updated</p>
      </div>
      
      <div className="p-4 space-y-3">
        {[
          { type: 'New Review', message: 'Sarah J. left a 5-star review', time: '2m ago', color: 'green' },
          { type: 'Response Needed', message: 'Mike R. asked a question', time: '1h ago', color: 'orange' },
          { type: 'Review Update', message: 'Customer updated their review', time: '3h ago', color: 'blue' },
          { type: 'Weekly Summary', message: 'Your review summary is ready', time: '1d ago', color: 'purple' }
        ].map((notification, i) => (
          <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-2 bg-${notification.color}-500`}></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{notification.type}</span>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          </div>
        ))}
        
        <div className="mt-6">
          <h3 className="font-semibold text-sm mb-3">Notification Settings</h3>
          <div className="space-y-2">
            {['New Reviews', 'Customer Responses', 'Weekly Reports'].map(setting => (
              <div key={setting} className="flex justify-between items-center">
                <span className="text-sm">{setting}</span>
                <div className="w-10 h-6 bg-red-500 rounded-full flex items-center justify-end pr-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AppScreenshots;

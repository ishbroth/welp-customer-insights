
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppIconPreviewPage from "@/pages/AppIconPreview";
import AppStoreAssetsPage from "@/pages/AppStoreAssets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app-icon-preview" element={<AppIconPreviewPage />} />
          <Route path="/app-store-assets" element={<AppStoreAssetsPage />} />
          <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

// Simple home page component
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Welp. - Review Customers</h1>
        <p className="text-xl text-gray-600 text-center mb-12">Business Review Management Platform</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <a 
            href="/app-icon-preview" 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">App Icon Preview</h2>
            <p className="text-gray-600">View the Welp app icon design in various sizes</p>
          </a>
          
          <a 
            href="/app-store-assets" 
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">App Store Assets</h2>
            <p className="text-gray-600">Complete collection of app store submission materials</p>
          </a>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Review Management</h4>
              <p className="text-gray-600">Manage and respond to customer reviews efficiently</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Customer Insights</h4>
              <p className="text-gray-600">Gain valuable analytics about your customers</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Mobile Camera</h4>
              <p className="text-gray-600">Capture and organize photos with integrated camera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

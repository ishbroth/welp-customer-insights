
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import Index from "@/pages/Index";
import AppIconPreviewPage from "@/pages/AppIconPreview";
import AppStoreAssetsPage from "@/pages/AppStoreAssets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app-icon-preview" element={<AppIconPreviewPage />} />
            <Route path="/app-store-assets" element={<AppStoreAssetsPage />} />
            <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

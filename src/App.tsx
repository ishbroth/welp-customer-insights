
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import AppRoutes from "@/components/routing/AppRoutes";
import LoadingScreen from "@/components/LoadingScreen";

const queryClient = new QueryClient();

function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

// Separate component that uses the loading context
const AppContent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <LoadingScreenWrapper />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Separate component for loading screen to isolate context usage
const LoadingScreenWrapper = () => {
  // This will be handled by the LoadingProvider context
  return <LoadingScreen />;
};

export default App;

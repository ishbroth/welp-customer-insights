
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { useState } from "react";
import AppRoutes from "@/components/routing/AppRoutes";
import { useMobilePushNotifications } from "@/hooks/useMobilePushNotifications";

// Component that uses the push notifications hook
const AppWithPushNotifications = () => {
  useMobilePushNotifications();
  return <AppRoutes />;
};

// App component with proper provider nesting
const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppWithPushNotifications />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

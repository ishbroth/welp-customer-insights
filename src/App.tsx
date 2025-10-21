
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import AppRoutes from "@/components/routing/AppRoutes";
import MobileStatusBar from "@/components/mobile/MobileStatusBar";
import MobilePerformanceMonitor from "@/components/mobile/MobilePerformanceMonitor";
import MobileKeyboard from "@/components/mobile/MobileKeyboard";
import MobileInitializer from "@/components/mobile/MobileInitializer";

const queryClient = new QueryClient();

const QueryClientWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

function App() {
  return (
    <QueryClientWrapper>
      <Router>
        <AuthProvider>
          <LoadingProvider>
            <MobileInitializer />
            <MobileStatusBar backgroundColor="#000000" />
            <MobileKeyboard adjustViewport={true} />
            <AppRoutes />
            <Toaster />
            <HotToaster />
            <MobilePerformanceMonitor />
          </LoadingProvider>
        </AuthProvider>
      </Router>
    </QueryClientWrapper>
  );
}

export default App;

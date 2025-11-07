
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
import { useViewportReset } from "@/hooks/useViewportReset";

const queryClient = new QueryClient();

const QueryClientWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

function AppContent() {
  // Reset viewport zoom on navigation (iOS only)
  useViewportReset();

  return (
    <>
      <MobileInitializer />
      <MobileStatusBar backgroundColor="#ffffff" />
      <MobileKeyboard adjustViewport={true} />
      <AppRoutes />
      <Toaster />
      <HotToaster />
      <MobilePerformanceMonitor />
    </>
  );
}

function App() {
  return (
    <QueryClientWrapper>
      <Router>
        <AuthProvider>
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </AuthProvider>
      </Router>
    </QueryClientWrapper>
  );
}

export default App;

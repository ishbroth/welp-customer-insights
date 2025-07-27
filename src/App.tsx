
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import AppRoutes from "@/components/routing/AppRoutes";

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
            <AppRoutes />
            <Toaster />
            <HotToaster />
          </LoadingProvider>
        </AuthProvider>
      </Router>
    </QueryClientWrapper>
  );
}

export default App;

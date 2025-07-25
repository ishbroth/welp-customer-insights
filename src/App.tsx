
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { SecurityProvider } from "./components/SecurityProvider";
import { LoadingProvider } from "./contexts/LoadingContext";
import AppRoutes from "./components/routing/AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <LoadingProvider>
                <AppRoutes />
              </LoadingProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;

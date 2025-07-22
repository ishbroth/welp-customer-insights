
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { LoadingProvider } from "@/contexts/LoadingContext";
import AppRoutes from "@/components/routing/AppRoutes";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <Toaster />
          <Router>
            <AppRoutes />
          </Router>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

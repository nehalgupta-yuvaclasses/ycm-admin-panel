import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import React, { Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "./components/layout/AdminLayout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "./stores/useAuthStore";
import { adminRoutes } from "./routes";
import { RequireAdmin } from "./routes/guards";
import { getPageTitle, usePageTitle } from "@/hooks/use-page-title";
import { queryClient } from "@/lib/queryClient";

// Error Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/shared/ErrorBoundary";

const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-70" />
      <p className="text-xs font-bold text-muted-foreground animate-pulse tracking-widest uppercase ml-1">
        Yuva Classes Initializing...
      </p>
    </div>
  </div>
);

const ModuleFallback = () => (
  <div className="h-full w-full flex items-center justify-center p-20">
    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
  </div>
);

function PageTitleManager() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  usePageTitle(pageTitle);

  return null;
}

export default function App() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    // @ts-ignore - ThemeProvider type mismatch in some versions
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <PageTitleManager />
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public Entry Point */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Root Redirect */}
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                  {/* Secure Admin Portal */}
                  <Route 
                    path="/admin" 
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    
                    {adminRoutes.map((route) => (
                      <Route 
                        key={route.path}
                        path={route.path.replace('/admin/', '')}
                        element={
                          <RequireAdmin permission={route.permission}>
                            <Suspense fallback={<ModuleFallback />}>
                              <route.component />
                            </Suspense>
                          </RequireAdmin>
                        }
                      />
                    ))}
                  </Route>

                  {/* Utility Pages */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

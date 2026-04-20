import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuardProps {
  children: React.ReactNode;
  permission?: string;
}

export const RequireAdmin: React.FC<GuardProps> = ({ children, permission }) => {
  const { session, profile, loading, initialize, initialized, authError } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-70" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">
            Securing ERP Session...
          </p>
        </div>
      </div>
    );
  }

  // Strictly check for session
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authError && !profile && !loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div className="space-y-2">
              <h1 className="text-base font-semibold">Session refresh failed</h1>
              <p className="text-sm text-muted-foreground">
                {authError}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Strictly check for admin role
  // This is the primary gatekeeper for the ERP. 
  // Any role other than 'admin' is denied access.
  if (!profile && !loading) {
    return <>{children}</>;
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Check for fine-grained permission if provided
  if (permission && profile?.permissions && !profile.permissions.includes(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

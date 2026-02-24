'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrackingPage } from '@/components/tracking/TrackingPage';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [activeNav, setActiveNav] = useState('tracking');
  const [isLoading, setIsLoading] = useState(true);

  // Wait for MSAL init
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Contoso Trucking</h1>
          <p className="text-muted-foreground">
            Please sign in to access the Operations Center
          </p>
          <Button onClick={login} size="lg">
            Sign in with Microsoft
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeNav={activeNav} onNavChange={setActiveNav}>
      {activeNav === 'tracking' && <TrackingPage />}
      {activeNav !== 'tracking' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-lg">
            {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} — Coming Soon
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

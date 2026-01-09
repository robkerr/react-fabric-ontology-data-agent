'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMsal = async () => {
      setIsLoading(false);
    };

    initializeMsal();
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
          <h1 className="text-3xl font-bold">Fabric Data Agent Chat</h1>
          <p className="text-muted-foreground">
            Please sign in to start chatting with the Data Agent
          </p>
          <Button onClick={login} size="lg">
            Sign in with Microsoft
          </Button>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
}

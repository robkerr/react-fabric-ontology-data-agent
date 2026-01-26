'use client';

import { useFabricAgent } from '@/hooks/useFabricAgent';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SampleQuestions } from './SampleQuestions';

export function ChatInterface() {
  const { messages, isLoading, sendQuery, resetConversation } = useFabricAgent();

  const showSampleQuestions = messages.length === 0;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-semibold">Fabric Data Agent Chat</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-background">
        <div className="mx-auto flex h-full max-w-4xl flex-col">
          <div className="flex-1 overflow-hidden">
            {showSampleQuestions ? (
              <SampleQuestions onSelectQuestion={sendQuery} />
            ) : (
              <MessageList messages={messages} isLoading={isLoading} />
            )}
          </div>
        </div>
      </main>

      <MessageInput
        onSend={sendQuery}
        onReset={resetConversation}
        isLoading={isLoading}
      />
    </div>
  );
}

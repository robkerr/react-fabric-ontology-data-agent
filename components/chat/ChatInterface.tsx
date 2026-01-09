'use client';

import { useFabricAgent } from '@/hooks/useFabricAgent';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SampleQuestions } from './SampleQuestions';

export function ChatInterface() {
  const { messages, isLoading, sendQuery, resetConversation } = useFabricAgent();

  const showSampleQuestions = messages.length === 0;

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold">Fabric Data Agent Chat</h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {showSampleQuestions ? (
          <SampleQuestions onSelectQuestion={sendQuery} />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      <MessageInput
        onSend={sendQuery}
        onReset={resetConversation}
        isLoading={isLoading}
      />
    </div>
  );
}

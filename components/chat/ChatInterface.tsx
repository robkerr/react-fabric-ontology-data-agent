'use client';

import { useFabricAgent } from '@/hooks/useFabricAgent';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function ChatInterface({ inputRef }: ChatInterfaceProps) {
  const { messages, isLoading, sendQuery, resetConversation } = useFabricAgent();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-2 shrink-0">
        <h2 className="text-sm font-semibold">Data Agent Chat</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <MessageInput
        onSend={sendQuery}
        onReset={resetConversation}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
}

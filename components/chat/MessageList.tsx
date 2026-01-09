'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/lib/types';
import { Message } from './Message';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 px-4 py-6">
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

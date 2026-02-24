'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Terminal } from '@/components/map/AzureMap';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { queryDataAgent } from '@/lib/fabricApi';

// Dynamic import to avoid SSR issues with Azure Maps
const AzureMap = dynamic(
  () => import('@/components/map/AzureMap').then((mod) => mod.AzureMap),
  { ssr: false }
);

function parseTerminalsFromMarkdown(markdown: string): Terminal[] {
  const lines = markdown.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return [];

  // Skip header row and separator row
  const dataRows = lines.slice(2);
  const terminals: Terminal[] = [];

  for (const row of dataRows) {
    const cells = row
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cells.length >= 3) {
      const name = cells[0];
      const lat = parseFloat(cells[1]);
      const lng = parseFloat(cells[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        terminals.push({ name, latitude: lat, longitude: lng });
      }
    }
  }

  return terminals;
}

export function TrackingPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTerminals() {
      try {
        const response = await queryDataAgent(
          'Give me a list of terminals. List the name, latitude, and longitude. Return the results as a markdown table.'
        );
        if (cancelled) return;

        const content = response.answer || response.result || '';
        const parsed = parseTerminalsFromMarkdown(content);
        setTerminals(parsed);
      } catch (err) {
        console.error('Failed to load terminals:', err);
      } finally {
        if (!cancelled) {
          setIsLoadingTerminals(false);
          // Focus the chat input after terminals load
          setTimeout(() => chatInputRef.current?.focus(), 100);
        }
      }
    }

    loadTerminals();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex h-full">
      {/* Map panel - 70% */}
      <div className="w-[70%] h-full border-r">
        <AzureMap terminals={terminals} isLoading={isLoadingTerminals} />
      </div>

      {/* Chat panel - 30% */}
      <div className="w-[30%] h-full">
        <ChatInterface inputRef={chatInputRef} />
      </div>
    </div>
  );
}

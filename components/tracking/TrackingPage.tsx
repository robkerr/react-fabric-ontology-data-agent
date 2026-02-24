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

function parseTerminalsFromResponse(content: string): Terminal[] {
  // Try JSON first (may be wrapped in markdown code fences)
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const arr = JSON.parse(jsonMatch[0]);
      const results = arr
        .filter((item: Record<string, unknown>) => item.name && item.latitude != null && item.longitude != null)
        .map((item: Record<string, unknown>) => ({
          name: String(item.name),
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        }));
      if (results.length > 0) return results;
    }
  } catch { /* fall through to markdown parsing */ }

  // Fallback: parse markdown table
  const lines = content.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return [];
  const dataRows = lines.slice(2);
  const terminals: Terminal[] = [];
  for (const row of dataRows) {
    const cells = row.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
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

    async function loadTerminals(retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Loading terminals (attempt ${attempt}/${retries})...`);
          const response = await queryDataAgent(
            'Give me a list of terminals. List the name, latitude, and longitude. Return the result as a JSON array of objects, each object with the following properties: name, latitude, longitude.'
          );
          if (cancelled) return;

          console.log('Data Agent raw response:', JSON.stringify(response, null, 2));
          const content = response.answer || response.result || '';
          const parsed = parseTerminalsFromResponse(content);
          if (parsed.length > 0) {
            setTerminals(parsed);
            return;
          }
          console.warn('Parsed 0 terminals from response, retrying...');
        } catch (err) {
          console.error(`Attempt ${attempt} failed:`, err);
          if (attempt === retries) {
            console.error('All retry attempts exhausted.');
          } else {
            // Wait before retrying
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
    }

    loadTerminals().finally(() => {
      if (!cancelled) {
        setIsLoadingTerminals(false);
        setTimeout(() => chatInputRef.current?.focus(), 100);
      }
    });
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

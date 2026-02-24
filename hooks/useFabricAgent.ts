'use client';

import { useState } from 'react';
import { Message } from '@/lib/types';
import { queryDataAgent } from '@/lib/fabricApi';

export interface TruckLocation {
  label: string;
  latitude: number;
  longitude: number;
}

function parseTrucksFromMarkdown(content: string): TruckLocation[] {
  const lines = content.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return [];

  // Parse header to find column indices
  const headerCells = lines[0].split('|').map((c) => c.trim().toLowerCase()).filter((c) => c.length > 0);
  const latIdx = headerCells.findIndex((h) => h.includes('current latitude'));
  const lngIdx = headerCells.findIndex((h) => h.includes('current longitude'));
  if (latIdx === -1 || lngIdx === -1) return [];

  const dataRows = lines.slice(2);
  const trucks: TruckLocation[] = [];

  for (const row of dataRows) {
    const cells = row.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length > Math.max(latIdx, lngIdx)) {
      const lat = parseFloat(cells[latIdx]);
      const lng = parseFloat(cells[lngIdx]);
      const label = cells[0] || '';
      if (!isNaN(lat) && !isNaN(lng) && label) {
        trucks.push({ label, latitude: lat, longitude: lng });
      }
    }
  }
  return trucks;
}

interface UseFabricAgentOptions {
  onTrucksDetected?: (trucks: TruckLocation[]) => void;
}

export function useFabricAgent(options?: UseFabricAgentOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuery = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const queryWithMarkdown = `${question}\nReturn the results as a markdown table.`;
      const response = await queryDataAgent(queryWithMarkdown);

      const content = response.answer || response.result || JSON.stringify(response.data) || 'No response received';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if response contains truck location data
      const trucks = parseTrucksFromMarkdown(content);
      if (trucks.length > 0) {
        options?.onTrucksDetected?.(trucks);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendQuery,
    resetConversation,
  };
}

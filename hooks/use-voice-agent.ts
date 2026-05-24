'use client';

import { useState, useRef } from 'react';

export function useVoiceAgent({ 
  onSpeechEnd 
}: { 
  onSpeechEnd: (reply: string, action?: string, actionData?: any) => void 
}) {
  const [isActive, setIsActive] = useState(false);
  const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    setIsActive(true);
    
    // Fallback simulation: Simulates two-way audio dialogue
    console.warn("Starting Voice Agent Audio session.");
    mockTimeoutRef.current = setTimeout(() => {
      onSpeechEnd(
        "I've scheduled a sync review meeting for tomorrow at 2 PM.",
        "create_calendar_task",
        {
          title: "Sync Review Meeting",
          scheduledAt: new Date(Date.now() + 3600 * 1000 * 30).toISOString(),
          taskType: "meeting",
          color: "#06b6d4"
        }
      );
      stopSession();
    }, 5000);
  };

  const stopSession = () => {
    setIsActive(false);
    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current);
      mockTimeoutRef.current = null;
    }
  };

  return {
    isActive,
    startSession,
    stopSession
  };
}
export default useVoiceAgent;

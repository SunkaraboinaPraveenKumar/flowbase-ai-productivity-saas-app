'use client';

import { useState, useEffect, useRef } from 'react';
import ChatBubble from '@/components/ai-assistant/chat-bubble';
import ActionConfirmCard from '@/components/ai-assistant/action-confirm-card';
import VoiceAgentButton from '@/components/ai-assistant/voice-agent-button';
import useVoiceAgent from '@/hooks/use-voice-agent';
import { Send, Sparkles, MessageSquare, Plus } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: string | null;
  actionData?: any;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    // Basic initialization
    setMessages([
      { id: 'welcome', role: 'assistant', content: "Hello! I am your Spark workspace coordinator. Ask me to schedule meetings, write notes, or create custom boards." }
    ]);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Scroll chat to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Math.random().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.reply,
          action: data.action,
          actionData: data.actionData,
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Voice session callback
  const { isActive: isVoiceActive, startSession, stopSession } = useVoiceAgent({
    onSpeechEnd: (reply, action, actionData) => {
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: reply,
        action,
        actionData,
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-[80vh]">
      
      {/* Sidebar history */}
      <div className="lg:col-span-1 card p-5 space-y-4 bg-bg-card h-full flex flex-col justify-start">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            <span>Chat Logs</span>
          </h3>
          <button 
            onClick={() => setMessages([
              { id: 'welcome', role: 'assistant', content: "Hello! I am your Spark workspace coordinator. Ask me to schedule meetings, write notes, or create custom boards." }
            ])}
            className="p-1 rounded hover:bg-bg-secondary border border-border text-text-secondary hover:text-accent-rose"
            title="Clear Chat Logs"
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
        
        <div className="space-y-2 overflow-y-auto flex-1">
          <div className="p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20 text-xs font-semibold text-accent-primary flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Session</span>
          </div>
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="lg:col-span-3 card p-5 bg-bg-card h-full flex flex-col justify-between overflow-hidden relative border-accent-primary/10">
        
        {/* Messages viewport */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2 pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <ChatBubble role={msg.role} content={msg.content} />
              
              {/* If message triggers an inline confirmation workflow */}
              {msg.action && (
                <div className="ml-10">
                  <ActionConfirmCard
                    action={msg.action}
                    actionData={msg.actionData}
                    onDone={(success) => {
                      console.log("Action confirmed:", success);
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs max-w-sm mr-auto items-center animate-pulse">
              <div className="w-7 h-7 rounded-xl bg-bg-secondary border border-border flex items-center justify-center font-bold text-accent-secondary">
                🤖
              </div>
              <span className="text-text-muted font-semibold">AI is analyzing context...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Form triggers and voice controls */}
        <div className="border-t border-border/30 pt-4 bg-bg-card flex items-center gap-3">
          <form onSubmit={handleSend} className="flex-1 flex gap-2 items-center">
            <input
              type="text"
              placeholder="e.g. Schedule meeting for tomorrow at 2 PM..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 input-base text-xs py-2.5 px-4 bg-bg-secondary"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/95 transition-all shadow-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* AssemblyAI streaming agent */}
          <VoiceAgentButton
            isActive={isVoiceActive}
            onClick={isVoiceActive ? stopSession : startSession}
          />
        </div>

      </div>

    </div>
  );
}
export { AIAssistantPage };

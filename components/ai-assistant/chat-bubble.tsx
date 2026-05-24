'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex gap-3 text-xs max-w-lg items-start",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Icon */}
      <div className={cn(
        "w-7 h-7 rounded-xl flex items-center justify-center border",
        isUser 
          ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary" 
          : "bg-bg-card border-border text-accent-secondary"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble box */}
      <div className={cn(
        "p-3.5 rounded-xl border leading-relaxed",
        isUser 
          ? "bg-accent-primary text-white border-accent-primary shadow-glow" 
          : "bg-bg-card border-border text-text-primary"
      )}>
        <p className="whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}
export { ChatBubble };

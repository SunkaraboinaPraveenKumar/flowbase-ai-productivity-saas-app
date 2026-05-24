'use client';

import { Sparkles, Trash2, Sidebar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppTemplate {
  id: string;
  name: string;
  prompt: string;
  addedToSidebar: boolean;
  createdAt: string;
}

interface TemplateCardProps {
  template: AppTemplate;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleSidebar: () => void;
}

export default function TemplateCard({ template, isActive, onSelect, onDelete, onToggleSidebar }: TemplateCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-2.5 bg-bg-secondary/40 select-none",
        isActive ? "border-accent-primary bg-accent-primary/5" : "border-border hover:border-border-accent"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
          <h4 className="text-xs font-bold text-text-primary truncate max-w-[140px] font-display">
            {template.name}
          </h4>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSidebar();
            }}
            className={cn(
              "p-1 rounded hover:bg-bg-elevated",
              template.addedToSidebar ? "text-accent-primary" : "text-text-muted"
            )}
            title={template.addedToSidebar ? "Remove from sidebar shortcut" : "Pin to main sidebar nav"}
          >
            <Sidebar className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose"
            title="Delete custom App"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-text-secondary line-clamp-1 leading-relaxed">
        Prompt: "{template.prompt}"
      </p>

      <div className="flex items-center justify-between text-[8px] text-text-muted font-bold pt-1.5 border-t border-border/20">
        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-0.5 text-accent-secondary">
          <Eye className="w-3 h-3" />
          <span>Interactive</span>
        </span>
      </div>
    </div>
  );
}
export { TemplateCard };

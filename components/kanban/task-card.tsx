'use client';

import { Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label?: string;
  dueDate?: Date | string | null;
  commentCount?: number;
}

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  const getPriorityColor = (priority = 'medium') => {
    switch (priority) {
      case 'low': return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'high': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'urgent': return 'bg-accent-rose/10 text-accent-rose border-accent-rose/20';
      default: return 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20';
    }
  };

  return (
    <div
      onClick={() => onSelect(task)}
      className="card p-4 bg-bg-card hover:border-accent-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none group relative overflow-hidden space-y-3"
    >
      <div className="flex justify-between items-start gap-2">
        {task.label && (
          <span className="text-[9px] px-2 py-0.5 rounded-full border border-border bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider">
            {task.label}
          </span>
        )}
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider",
          getPriorityColor(task.priority)
        )}>
          {task.priority || 'medium'}
        </span>
      </div>

      <h4 className="text-xs font-bold text-text-primary group-hover:text-accent-primary transition-colors leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-center border-t border-border/30 pt-3 text-[10px] text-text-muted">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-text-muted" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-text-muted" />
            <span>{task.commentCount || 0}</span>
          </div>
        </div>
        
        {/* Mock Avatar */}
        <div className="w-5 h-5 rounded-full bg-accent-primary/20 border border-border flex items-center justify-center font-bold text-[8px] text-accent-primary">
          U
        </div>
      </div>
    </div>
  );
}

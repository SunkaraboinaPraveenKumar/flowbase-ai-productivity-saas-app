'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, Calendar, Kanban, MessageSquare, FolderPlus } from 'lucide-react';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { label: 'New Task', icon: <PlusCircle className="w-5 h-5" />, href: '/calendar?action=new-task', color: 'hover:border-accent-primary/50 text-accent-primary' },
    { label: 'New Note', icon: <FileText className="w-5 h-5" />, href: '/notes?action=new-note', color: 'hover:border-accent-secondary/50 text-accent-secondary' },
    { label: 'New Event', icon: <Calendar className="w-5 h-5" />, href: '/calendar?action=new-event', color: 'hover:border-accent-green/50 text-accent-green' },
    { label: 'New Board', icon: <Kanban className="w-5 h-5" />, href: '/kanban?action=new-board', color: 'hover:border-accent-amber/50 text-accent-amber' },
    { label: 'AI Chat', icon: <MessageSquare className="w-5 h-5" />, href: '/ai-assistant', color: 'hover:border-accent-rose/50 text-accent-rose' },
    { label: 'New Space', icon: <FolderPlus className="w-5 h-5" />, href: '/spaces?action=new-space', color: 'hover:border-purple-400/50 text-purple-400' },
  ];

  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={() => router.push(act.href)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-bg-secondary hover:bg-bg-elevated transition-all duration-200 gap-2 text-xs font-medium text-text-secondary hover:text-text-primary ${act.color}`}
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';

interface DraftTask {
  id: string;
  title: string;
  category?: string;
  color?: string;
}

interface DraftPanelProps {
  drafts: DraftTask[];
  onAddDraft: (title: string) => void;
  onSelectDraft: (task: DraftTask) => void;
}

export default function DraftPanel({ drafts, onAddDraft, onSelectDraft }: DraftPanelProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddDraft(newTitle);
    setNewTitle('');
  };

  return (
    <div className="card p-4 h-full flex flex-col gap-4 bg-bg-card">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <span>Draft Scratchpad</span>
          <span className="bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded text-[10px]">
            {drafts.length}
          </span>
        </h3>
      </div>

      {/* Quick Add Draft */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Quick draft..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 input-base text-xs py-1.5 px-2.5"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Draft List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[450px]">
        {drafts.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic">
            No drafts currently. Click above to add some ideas!
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              onClick={() => onSelectDraft(draft)}
              className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border hover:border-accent-primary/40 cursor-pointer group hover:-translate-x-0.5 transition-all"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: draft.color || '#7c3aed' }}
                />
                <span className="text-xs font-medium text-text-primary truncate max-w-[150px]">
                  {draft.title}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-accent-primary font-bold">Schedule</span>
                <ChevronRight className="w-3.5 h-3.5 text-accent-primary" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

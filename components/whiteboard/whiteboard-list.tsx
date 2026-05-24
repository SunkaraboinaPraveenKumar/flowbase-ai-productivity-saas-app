'use client';

import { useState } from 'react';
import { Plus, Palette, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Board {
  id: string;
  name: string;
  updatedAt: string;
}

interface WhiteboardListProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (name: string) => void;
  onDeleteBoard: (id: string) => void;
}

export default function WhiteboardList({ boards, activeBoardId, onSelectBoard, onCreateBoard, onDeleteBoard }: WhiteboardListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateBoard(name);
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="card p-4 space-y-4 bg-bg-card h-full flex flex-col justify-start">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">My Boards</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 rounded hover:bg-bg-secondary border border-border text-text-secondary hover:text-accent-primary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Board name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 input-base text-xs py-1.5 px-2 bg-bg-secondary"
            required
            autoFocus
          />
          <button type="submit" className="button-primary text-xs py-1.5 px-3">
            Add
          </button>
        </form>
      )}

      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[400px]">
        {boards.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic">
            No canvases created yet. Click + above to begin!
          </div>
        ) : (
          boards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer relative group flex justify-between items-center bg-bg-secondary/40",
                  isActive ? "border-accent-primary bg-accent-primary/5" : "border-border hover:border-border-accent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Palette className={cn("w-4 h-4", isActive ? "text-accent-primary animate-pulse" : "text-text-muted")} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text-primary truncate">{board.name}</span>
                    <span className="text-[9px] text-text-muted">{new Date(board.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBoard(board.id);
                  }}
                  className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Whiteboard"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

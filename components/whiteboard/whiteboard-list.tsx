'use client';

import { useState } from 'react';
import { Plus, Layout, Trash2, PenTool, Clock } from 'lucide-react';
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

export default function WhiteboardList({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: WhiteboardListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateBoard(name.trim());
    setName('');
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[#16161f] border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Layout className="w-3.5 h-3.5 text-accent-primary" />
          </div>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">My Boards</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
            showAddForm
              ? "bg-accent-primary text-white"
              : "bg-white/5 border border-white/10 text-text-muted hover:bg-accent-primary/20 hover:border-accent-primary/40 hover:text-accent-primary"
          )}
          title="New Board"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New board form */}
      {showAddForm && (
        <div className="px-3 pt-3 pb-1 border-b border-white/6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Board name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 transition-colors"
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Board list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {boards.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
              <PenTool className="w-5 h-5 text-text-muted/50" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted">No boards yet</p>
              <p className="text-[10px] text-text-muted/60 mt-0.5">Click + to create your first canvas</p>
            </div>
          </div>
        ) : (
          boards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 relative",
                  isActive
                    ? "bg-accent-primary/15 border border-accent-primary/30"
                    : "hover:bg-white/5 border border-transparent hover:border-white/8"
                )}
              >
                {/* Color accent bar */}
                <div className={cn(
                  "w-1 h-8 rounded-full flex-shrink-0 transition-all",
                  isActive ? "bg-accent-primary" : "bg-white/10 group-hover:bg-white/20"
                )} />

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-semibold truncate transition-colors",
                    isActive ? "text-accent-primary" : "text-text-secondary group-hover:text-text-primary"
                  )}>
                    {board.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-text-muted/50" />
                    <span className="text-[9px] text-text-muted/60">{formatDate(board.updatedAt)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-accent-rose/20 text-text-muted hover:text-accent-rose transition-all absolute right-2"
                  title="Delete board"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stat */}
      {boards.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted/40">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

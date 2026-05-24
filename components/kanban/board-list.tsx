'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Board {
  id: string;
  name: string;
  color?: string;
}

interface BoardListProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (name: string, color: string) => void;
  onDeleteBoard: (id: string) => void;
}

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];

export default function BoardList({ boards, activeBoardId, onSelectBoard, onCreateBoard, onDeleteBoard }: BoardListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7c3aed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateBoard(name, color);
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="card p-4 space-y-4 bg-bg-card h-full">
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
        <form onSubmit={handleSubmit} className="p-3 bg-bg-secondary border border-border rounded-xl space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Board Name</label>
            <input
              type="text"
              placeholder="e.g. Q3 Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input-base text-xs py-1.5 px-2"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase block">Color</label>
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    color === c ? 'scale-125 border border-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full button-primary py-1.5 text-xs font-semibold shadow-glow"
          >
            Create Board
          </button>
        </form>
      )}

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {boards.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted italic">
            No boards found. Click the + icon to create one!
          </div>
        ) : (
          boards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer relative group ${
                  isActive 
                    ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary' 
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: board.color || '#7c3aed' }} />
                  <span className="font-semibold truncate">{board.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBoard(board.id);
                  }}
                  className="p-1 text-text-muted hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-all rounded"
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

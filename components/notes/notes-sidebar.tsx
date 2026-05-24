'use client';

import { useState } from 'react';
import { Search, Plus, Pin, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content?: string;
  isPinned: boolean;
  isTrashed: boolean;
  color?: string;
  icon?: string;
  category?: string;
  updatedAt: string;
}

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onUpdateNote: (note: any) => void;
  onDeleteNotePermanent: (id: string) => void;
}

export default function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onUpdateNote,
  onDeleteNotePermanent
}: NotesSidebarProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'trash'>('all');

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
    
    if (activeTab === 'pinned') return matchesSearch && n.isPinned && !n.isTrashed;
    if (activeTab === 'trash') return matchesSearch && n.isTrashed;
    return matchesSearch && !n.isTrashed;
  });

  const getPreviewText = (contentStr?: string) => {
    if (!contentStr) return 'Empty content...';
    try {
      // Tiptap content is stored as stringified JSON
      const parsed = JSON.parse(contentStr);
      // DFS traverse JSON to extract plain text
      let text = '';
      const extractText = (node: any) => {
        if (node.text) text += node.text + ' ';
        if (node.content) node.content.forEach(extractText);
      };
      extractText(parsed);
      return text.trim() || 'Empty content...';
    } catch {
      // Fallback if content is raw string
      return contentStr || 'Empty content...';
    }
  };

  return (
    <div className="card p-4 space-y-4 bg-bg-card h-full flex flex-col justify-start">
      {/* Header and Add Action */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">My Notes</h3>
        <button
          onClick={onCreateNote}
          className="p-1 rounded hover:bg-bg-secondary border border-border text-text-secondary hover:text-accent-primary"
          title="New Note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 input-base text-xs"
        />
      </div>

      {/* Tabs list */}
      <div className="flex rounded-lg border border-border bg-bg-secondary p-0.5 text-[10px] font-bold text-text-secondary">
        {(['all', 'pinned', 'trash'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1 rounded-md uppercase tracking-wider transition-all",
              activeTab === tab ? "bg-accent-primary text-white" : "hover:text-text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[400px]">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic">
            No notes found.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-1.5 bg-bg-secondary/40",
                  isActive ? "border-accent-primary bg-accent-primary/5" : "border-border hover:border-border-accent"
                )}
                style={{ borderLeftWidth: '4px', borderLeftColor: note.color || 'var(--border)' }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary truncate">
                    <span>{note.icon || '📝'}</span>
                    <span className="truncate">{note.title || 'Untitled'}</span>
                  </div>
                  
                  {/* Pin and Trash overlay buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!note.isTrashed ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateNote({ ...note, isPinned: !note.isPinned });
                          }}
                          className={cn(
                            "p-0.5 rounded hover:bg-bg-elevated",
                            note.isPinned ? "text-accent-primary" : "text-text-muted"
                          )}
                          title={note.isPinned ? "Unpin Note" : "Pin Note"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateNote({ ...note, isTrashed: true });
                          }}
                          className="p-0.5 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose"
                          title="Trash Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateNote({ ...note, isTrashed: false });
                          }}
                          className="p-0.5 rounded hover:bg-bg-elevated text-accent-green"
                          title="Restore Note"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotePermanent(note.id);
                          }}
                          className="p-0.5 rounded hover:bg-bg-elevated text-accent-rose"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtitle / Preview text */}
                <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
                  {getPreviewText(note.content)}
                </p>

                {/* Date / Metadata details */}
                <div className="flex items-center justify-between text-[8px] text-text-muted font-bold pt-1.5 uppercase">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.category && <span>{note.category}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

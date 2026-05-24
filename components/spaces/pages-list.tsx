'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  spaceId: string;
  title: string;
  icon?: string;
}

interface PagesListProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (title: string) => void;
  onDeletePage: (id: string) => void;
}

export default function PagesList({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage
}: PagesListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreatePage(title);
    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="card p-4 space-y-4 bg-bg-card h-full flex flex-col justify-start">
      {/* Back button */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Link 
          href="/spaces" 
          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Spaces</span>
        </Link>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 rounded hover:bg-bg-secondary border border-border text-text-secondary hover:text-accent-primary"
          title="New Page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Page title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 input-base text-xs py-1.5 px-2 bg-bg-secondary"
            required
            autoFocus
          />
          <button type="submit" className="button-primary text-xs py-1.5 px-3">
            Add
          </button>
        </form>
      )}

      {/* Pages lists */}
      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[400px]">
        {pages.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic">
            No pages in space. Click + to add one!
          </div>
        ) : (
          pages.map((page) => {
            const isActive = page.id === activePageId;
            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all cursor-pointer relative group flex justify-between items-center bg-bg-secondary/40",
                  isActive ? "border-accent-primary bg-accent-primary/5" : "border-border hover:border-border-accent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm flex-shrink-0">{page.icon || '📄'}</span>
                  <span className="text-xs font-semibold text-text-primary truncate">{page.title || 'Untitled'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Page"
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
export { PagesList };

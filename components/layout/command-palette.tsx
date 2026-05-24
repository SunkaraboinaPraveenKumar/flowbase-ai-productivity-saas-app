'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Folder, FileText, CheckSquare, Settings } from 'lucide-react';

interface PaletteItem {
  icon: React.ReactNode;
  label: string;
  category: string;
  action: () => void;
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items: PaletteItem[] = [
    { icon: <Search className="w-4 h-4" />, label: 'Dashboard', category: 'Navigation', action: () => router.push('/dashboard') },
    { icon: <Search className="w-4 h-4" />, label: 'AI Assistant', category: 'Navigation', action: () => router.push('/ai-assistant') },
    { icon: <Calendar className="w-4 h-4" />, label: 'Calendar Schedule', category: 'Navigation', action: () => router.push('/calendar') },
    { icon: <CheckSquare className="w-4 h-4" />, label: 'Kanban Tasks', category: 'Navigation', action: () => router.push('/kanban') },
    { icon: <FileText className="w-4 h-4" />, label: 'Notes Workspace', category: 'Navigation', action: () => router.push('/notes') },
    { icon: <Folder className="w-4 h-4" />, label: 'Spaces & Pages', category: 'Navigation', action: () => router.push('/spaces') },
    { icon: <Settings className="w-4 h-4" />, label: 'Settings', category: 'Navigation', action: () => router.push('/settings') },
    { icon: <CheckSquare className="w-4 h-4" />, label: 'Create New Task', category: 'Quick Action', action: () => { router.push('/calendar'); onClose(); } },
    { icon: <FileText className="w-4 h-4" />, label: 'Create New Note', category: 'Quick Action', action: () => { router.push('/notes'); onClose(); } },
  ];

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, router, onClose]);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-xl bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden glass-effect animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-4 bg-transparent border-0 text-text-primary placeholder-text-muted focus:ring-0 focus:outline-none text-base"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="px-2 py-1 text-xs border border-border rounded bg-bg-secondary text-text-secondary hover:text-text-primary"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-text-muted">
              No results found for "{search}"
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left text-sm transition-all duration-100 ${
                  idx === selectedIndex 
                    ? 'bg-accent-primary/20 text-text-primary border-l-2 border-accent-primary' 
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${idx === selectedIndex ? 'text-accent-primary' : 'text-text-muted'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className="text-xs text-text-muted uppercase tracking-wider bg-bg-secondary px-2 py-0.5 rounded border border-border">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

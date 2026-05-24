'use client';

import { Trash2, Edit2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Space {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  updatedAt: string;
}

interface SpaceCardProps {
  space: Space;
  onDelete: (id: string) => void;
  onEdit: (space: Space) => void;
}

export default function SpaceCard({ space, onDelete, onEdit }: SpaceCardProps) {
  return (
    <div 
      className="card p-5 flex flex-col justify-between hover:border-accent-primary/30 transition-all duration-300 relative group overflow-hidden bg-bg-card"
      style={{ borderLeftWidth: '5px', borderLeftColor: space.color || 'var(--border)' }}
    >
      <div className="space-y-4">
        {/* Top Icons */}
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-bg-secondary border border-border flex items-center justify-center text-lg shadow-sm">
            {space.icon || '📁'}
          </div>
          
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(space)}
              className="p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all"
              title="Edit Space details"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(space.id)}
              className="p-1.5 rounded hover:bg-bg-secondary text-text-muted hover:text-accent-rose transition-all"
              title="Delete Space"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-text-primary leading-tight font-display">
            {space.name}
          </h4>
          {space.description && (
            <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
              {space.description}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border/30 pt-3 mt-4 flex items-center justify-between">
        <span className="text-[9px] text-text-muted font-bold uppercase">
          Updated {new Date(space.updatedAt).toLocaleDateString()}
        </span>
        <Link 
          href={`/spaces/${space.id}`}
          className="text-[10px] font-bold text-accent-primary flex items-center gap-1 hover:underline"
        >
          <span>Open Folder</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
export { SpaceCard };

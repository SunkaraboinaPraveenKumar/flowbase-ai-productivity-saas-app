'use client';

import { useState, useEffect } from 'react';
import { Folder, Plus, X } from 'lucide-react';
import SpaceCard from '@/components/spaces/space-card';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
const ICONS = ['📁', '💼', '🚀', '🎨', '📚', '🛠️', '🧠', '⚙️'];

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7c3aed');
  const [icon, setIcon] = useState('📁');

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        const data = await res.json();
        setSpaces(data.spaces || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleOpenDialog = (space: any = null) => {
    if (space) {
      setEditingSpace(space);
      setName(space.name || '');
      setDescription(space.description || '');
      setColor(space.color || '#7c3aed');
      setIcon(space.icon || '📁');
    } else {
      setEditingSpace(null);
      setName('');
      setDescription('');
      setColor('#7c3aed');
      setIcon('📁');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const method = editingSpace ? 'PUT' : 'POST';
    const body = editingSpace 
      ? { id: editingSpace.id, name, description, color, icon }
      : { name, description, color, icon };

    try {
      const res = await fetch('/api/spaces', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        fetchSpaces();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/spaces?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSpaces();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header toolbar */}
      <div className="flex justify-between items-center bg-bg-card border border-border p-4 rounded-xl flex-wrap gap-y-2">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-accent-primary animate-pulse" />
          <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">All Spaces</h3>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>New Space</span>
        </button>
      </div>

      {/* Grid of folder cards */}
      {spaces.length === 0 ? (
        <div className="card p-12 text-center space-y-4 max-w-xl mx-auto bg-bg-card">
          <Folder className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-text-primary">Create Your First Space</h3>
          <p className="text-text-secondary text-xs leading-relaxed">
            Spaces represent folders or projects where you can create nested collaborative pages, product guides, or brainstorming boards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((sp) => (
            <SpaceCard
              key={sp.id}
              space={sp}
              onDelete={handleDelete}
              onEdit={handleOpenDialog}
            />
          ))}
        </div>
      )}

      {/* New/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden glass-effect animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-5 py-4 border-b border-border">
              <h3 className="font-bold text-text-primary">
                {editingSpace ? 'Edit Space Details' : 'Create New Space'}
              </h3>
              <button onClick={() => setIsDialogOpen(false)} className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Space Name</label>
                <input
                  type="text"
                  placeholder="e.g. Design Guides"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-base text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Description</label>
                <textarea
                  placeholder="Describe folder focus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full input-base text-xs h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Color swatches */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Color Theme</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Folder Icon</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={`w-5 h-5 flex items-center justify-center text-sm transition-all rounded hover:bg-bg-secondary ${
                          icon === i ? 'bg-accent-primary/20 scale-110 font-bold' : ''
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="button-ghost py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary py-2 px-5 text-xs shadow-glow"
                >
                  {editingSpace ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export { SpacesPage };

'use client';

import { useState, useEffect } from 'react';
import NotesSidebar from '@/components/notes/notes-sidebar';
import RichEditor from '@/components/notes/rich-editor';
import AIRefineToolbar from '@/components/notes/ai-toolbar';
import { FileText } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        if (data.notes?.length > 0 && !activeNoteId) {
          setActiveNoteId(data.notes[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    setSelectedText('');
  };

  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Note',
          content: '{"type":"doc","content":[{"type":"paragraph","content":[]}]}',
          color: '#16161f',
          icon: '📝',
          category: 'General',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchNotes();
        if (data.note) {
          setActiveNoteId(data.note.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNote = async (updatedNote: any) => {
    // Optimistic UI update
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));

    try {
      await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
      // Silent refresh to fetch timestamps/changes
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePermanent = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeNoteId === id) {
          setActiveNoteId(null);
        }
        fetchNotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-full">
      {/* Left List sidebar */}
      <div className="lg:col-span-1">
        <NotesSidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNotePermanent={handleDeletePermanent}
        />
      </div>

      {/* Editor & Refine sidebars */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {activeNote ? (
          <>
            <div className="md:col-span-2">
              <RichEditor
                note={activeNote}
                onSave={(fields) => handleUpdateNote({ id: activeNote.id, ...fields })}
                onSelectionChange={setSelectedText}
              />
            </div>
            <div className="md:col-span-1">
              <AIRefineToolbar
                selectedText={selectedText}
                onRefined={(newText) => {
                  // Direct note updates on refined results
                  handleUpdateNote({
                    id: activeNote.id,
                    content: JSON.stringify({
                      type: 'doc',
                      content: [{ type: 'paragraph', content: [{ type: 'text', text: newText }] }]
                    })
                  });
                }}
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-3 card p-12 text-center space-y-4 max-w-xl mx-auto mt-12 bg-bg-card">
            <FileText className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">No Note Active</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Create a note or select one from the list. Use speak to note voice transcribing or AI text refiners to compose documents easily.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export { NotesPage };

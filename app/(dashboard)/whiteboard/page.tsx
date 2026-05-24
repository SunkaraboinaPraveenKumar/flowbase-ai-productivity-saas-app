'use client';

import { useState, useEffect, useRef } from 'react';
import WhiteboardList from '@/components/whiteboard/whiteboard-list';
import ExcalidrawWrapper from '@/components/whiteboard/excalidraw-wrapper';
import AIDiagramPrompt from '@/components/whiteboard/ai-diagram-prompt';
import { Palette } from 'lucide-react';

export default function WhiteboardPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const excalidrawAPIRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/whiteboard');
      if (res.ok) {
        const data = await res.json();
        setBoards(data.whiteboards || []);
        if (data.whiteboards?.length > 0 && !activeBoardId) {
          setActiveBoardId(data.whiteboards[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleSelectBoard = (id: string) => {
    setActiveBoardId(id);
    excalidrawAPIRef.current = null;
  };

  const handleCreateBoard = async (name: string) => {
    try {
      const res = await fetch('/api/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: '[]' }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchBoards();
        if (data.whiteboard) {
          setActiveBoardId(data.whiteboard.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/whiteboard?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeBoardId === id) {
          setActiveBoardId(null);
        }
        fetchBoards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCanvasChange = (elements: any[]) => {
    if (!activeBoardId) return;
    
    // Debounce database saving
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const activeBoard = boards.find(b => b.id === activeBoardId);
        if (!activeBoard) return;

        await fetch('/api/whiteboard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activeBoardId,
            name: activeBoard.name,
            data: JSON.stringify(elements),
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }, 2000);
  };

  const handleGenerateDiagram = (elements: any[]) => {
    if (excalidrawAPIRef.current) {
      // Use Excalidraw API to dynamically insert shapes at center
      excalidrawAPIRef.current.updateScene({
        elements: [...excalidrawAPIRef.current.getSceneElements(), ...elements]
      });
    }
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-full">
      {/* Left List sidebar */}
      <div className="lg:col-span-1">
        <WhiteboardList
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      </div>

      {/* Excalidraw canvas & AI prompt */}
      <div className="lg:col-span-3 space-y-4">
        {activeBoard ? (
          <>
            <div className="flex justify-between items-center bg-bg-card border border-border p-4 rounded-xl flex-wrap gap-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent-primary animate-pulse" />
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">{activeBoard.name}</h3>
              </div>
              
              <AIDiagramPrompt onGenerate={handleGenerateDiagram} />
            </div>

            <ExcalidrawWrapper
              board={activeBoard}
              onChange={handleCanvasChange}
              refCallback={(api) => {
                excalidrawAPIRef.current = api;
              }}
            />
          </>
        ) : (
          <div className="card p-12 text-center space-y-4 max-w-xl mx-auto mt-12 bg-bg-card">
            <Palette className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">No Active Canvas</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Create a whiteboard board or select one from the sidebar list. Draw freely using brushes, boxes, arrows, or inject vectors live using our diagram prompt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export { WhiteboardPage };

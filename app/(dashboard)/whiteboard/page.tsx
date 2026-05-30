'use client';

import { useState, useEffect, useRef } from 'react';
import WhiteboardList from '@/components/whiteboard/whiteboard-list';
import ExcalidrawWrapper from '@/components/whiteboard/excalidraw-wrapper';
import AIDiagramPrompt from '@/components/whiteboard/ai-diagram-prompt';
import { PenTool, Download, Maximize2, Clock, Edit2, Check, X } from 'lucide-react';

export default function WhiteboardPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const excalidrawAPIRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/whiteboard');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.error('API returned non-JSON response');
          return;
        }
        const data = await res.json();
        setBoards(data.whiteboards || []);
        if (data.whiteboards?.length > 0 && !activeBoardId) {
          setActiveBoardId(data.whiteboards[0].id);
        }
      }
    } catch (e) {
      console.error('Fetch boards error:', e);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

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
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.error('API returned non-JSON response');
          return;
        }
        const data = await res.json();
        fetchBoards();
        if (data.whiteboard) setActiveBoardId(data.whiteboard.id);
      } else {
        console.error('Failed to create board:', res.status);
      }
    } catch (e) { 
      console.error('Create board error:', e); 
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/whiteboard?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeBoardId === id) setActiveBoardId(null);
        fetchBoards();
      }
    } catch (e) { console.error('Delete board error:', e); }
  };

  const handleEditTitle = (currentName: string) => {
    setEditingTitle(true);
    setEditingTitleValue(currentName);
  };

  const handleSaveTitle = async () => {
    if (!activeBoardId || !editingTitleValue.trim()) {
      setEditingTitle(false);
      return;
    }

    try {
      const activeBoard = boards.find(b => b.id === activeBoardId);
      if (!activeBoard) return;

      const res = await fetch('/api/whiteboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: activeBoardId, 
          name: editingTitleValue.trim(), 
          data: activeBoard.data 
        }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          await res.json();
        }
        fetchBoards();
        setEditingTitle(false);
      } else {
        console.error('Failed to save title:', res.status);
      }
    } catch (e) {
      console.error('Save title error:', e);
    }
  };

  const handleCancelEditTitle = () => {
    setEditingTitle(false);
    setEditingTitleValue('');
  };

  const handleCanvasChange = (elements: any[]) => {
    if (!activeBoardId) return;
    
    const safeElements = Array.isArray(elements) ? elements : [];
    // Capture these NOW — they must not be stale inside the setTimeout closure
    const boardId = activeBoardId;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        // Re-read boards from the functional updater to avoid stale closure
        let boardName = '';
        setBoards(prev => {
          const b = prev.find(x => x.id === boardId);
          boardName = b?.name ?? '';
          return prev; // no-op update just to read current state
        });

        if (!boardName) {
          // fallback: read from DOM state if setter trick fails
          setSaving(false);
          return;
        }

        const serialized = JSON.stringify(safeElements);
        const res = await fetch('/api/whiteboard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: boardId, name: boardName, data: serialized }),
        });

        if (res.ok) {
          // ── KEY FIX: update local boards state so switching boards & coming back
          // shows the latest saved data, without needing a full re-fetch every save ──
          setBoards(prev => prev.map(b =>
            b.id === boardId ? { ...b, data: serialized } : b
          ));
        } else {
          console.error('Failed to save canvas:', res.status);
        }
      } catch (e) { 
        console.error('Canvas save error:', e); 
      } finally { 
        setSaving(false); 
      }
    }, 1500);
  };

  // Standalone save helper — used by handleGenerateDiagram to persist immediately
  // without relying on onChange (which Excalidraw may not fire for programmatic updateScene calls)
  const saveElementsNow = async (boardId: string, elements: any[]) => {
    try {
      const serialized = JSON.stringify(elements);
      // Read latest board name without stale closure
      let boardName = '';
      setBoards(prev => {
        const b = prev.find(x => x.id === boardId);
        boardName = b?.name ?? '';
        return prev;
      });
      if (!boardName) return;

      const res = await fetch('/api/whiteboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: boardId, name: boardName, data: serialized }),
      });

      if (res.ok) {
        setBoards(prev => prev.map(b =>
          b.id === boardId ? { ...b, data: serialized } : b
        ));
        console.log('[saveElementsNow] Saved', elements.length, 'elements for board', boardId);
      } else {
        console.error('[saveElementsNow] Save failed:', res.status);
      }
    } catch (err) {
      console.error('[saveElementsNow] Error:', err);
    }
  };

  const normalizeElement = (el: any) => {
    const isArrow = el.type === 'arrow' || el.type === 'line';
    const isText = el.type === 'text';

    // Arrow/line elements MUST have a valid points array — Excalidraw crashes otherwise
    const defaultPoints = [[0, 0], [Number(el.width) || 100, 0]];
    const rawPoints = el.points;
    const safePoints = Array.isArray(rawPoints) && rawPoints.length >= 2
      ? rawPoints.map((p: any) => [Number(p[0]) || 0, Number(p[1]) || 0])
      : isArrow ? defaultPoints : undefined;

    const base: any = {
      id: el.id || `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: el.type || 'rectangle',
      x: Number(el.x) || 0,
      y: Number(el.y) || 0,
      width: Number(el.width) || (isText ? 120 : 140),
      height: Number(el.height) || (isText ? 25 : 60),
      angle: el.angle || 0,
      strokeColor: el.strokeColor || '#1e3a8a',
      backgroundColor: el.backgroundColor || 'transparent',
      fillStyle: el.fillStyle || 'solid',
      strokeWidth: el.strokeWidth || 2,
      roughness: el.roughness ?? 1,
      opacity: el.opacity ?? 100,
      // ── Required Excalidraw internal fields ──
      // These MUST be present and correct types — Excalidraw reads .length on them internally
      groupIds: Array.isArray(el.groupIds) ? el.groupIds : [],
      boundElements: Array.isArray(el.boundElements) ? el.boundElements : null,
      updated: el.updated || Date.now(),
      isDeleted: false,
      version: el.version || 1,
      versionNonce: el.versionNonce || Math.floor(Math.random() * 1_000_000),
      roundness: el.roundness ?? null,
      link: el.link ?? null,
      locked: el.locked ?? false,
      frameId: el.frameId ?? null,
    };

    if (isText) {
      return {
        ...base,
        text: el.text || '',
        fontSize: el.fontSize || 16,
        fontFamily: el.fontFamily || 1,
        textAlign: el.textAlign || 'left',
        verticalAlign: el.verticalAlign || 'top',
        containerId: el.containerId ?? null,
        originalText: el.text || '',
        lineHeight: el.lineHeight || 1.25,
        autoResize: el.autoResize ?? true,
        // Always force dark text — AI sometimes ignores the system prompt and returns light colors
        strokeColor: '#1a1a2e',
        backgroundColor: 'transparent',
      };
    }

    if (isArrow) {
      return {
        ...base,
        points: safePoints,
        lastCommittedPoint: el.lastCommittedPoint ?? null,
        startBinding: el.startBinding ?? null,
        endBinding: el.endBinding ?? null,
        startArrowhead: el.startArrowhead ?? null,
        endArrowhead: el.endArrowhead ?? 'arrow',
        elbowed: el.elbowed ?? false,
      };
    }

    return base;
  };

  const handleGenerateDiagram = (elements: any[]) => {
    console.log('handleGenerateDiagram called with elements:', elements);
    if (!elements || !Array.isArray(elements) || elements.length === 0) return;
    
    // Capture boardId NOW — by the time async retries run, activeBoardId may change
    const boardId = activeBoardId;
    if (!boardId) return;

    const attemptUpdate = (retries = 0) => {
      const api = excalidrawAPIRef.current;
      
      if (api && typeof api.updateScene === 'function') {
        try {
          console.log('Excalidraw API available, updating scene');
          const currentElements = api.getSceneElements?.() || [];
          
          const normalizedNewElements = (Array.isArray(elements) ? elements : [])
            .filter((el) => el && typeof el === 'object')
            .map((el) => normalizeElement(el));
          
          if (!Array.isArray(normalizedNewElements) || normalizedNewElements.length === 0) {
            console.warn('No valid elements after normalization');
            return;
          }

          const newElements = [...(Array.isArray(currentElements) ? currentElements : []), ...normalizedNewElements];
          
          // Update Excalidraw canvas
          api.updateScene({
            elements: newElements,
            appState: {
              selectedElementIds: {},
              selectedGroupIds: {},
            },
            commitToHistory: true,
          });
          
          // ── CRITICAL FIX ──
          // Excalidraw's programmatic updateScene does NOT reliably trigger onChange.
          // We MUST save directly here — do NOT rely on handleCanvasChange for AI-generated diagrams.
          saveElementsNow(boardId, newElements);
          
          // Auto-fit content to view
          if (api.scrollToContent && newElements.length > 0) {
            try {
              api.scrollToContent(normalizedNewElements, { animate: true });
            } catch (scrollErr) {
              console.warn('Could not auto-scroll:', scrollErr);
            }
          }
          console.log('Scene updated and saved with', normalizedNewElements.length, 'new elements');
        } catch (err) {
          console.error('Failed to update scene:', err);
          if (retries < 5) {
            console.warn(`Retrying after error... (${retries + 1}/5)`);
            setTimeout(() => attemptUpdate(retries + 1), 100);
          }
        }
      } else if (retries < 15) {
        console.warn(`Excalidraw API not ready, retrying... (${retries + 1}/15)`);
        setTimeout(() => attemptUpdate(retries + 1), 100);
      } else {
        console.error('Excalidraw API failed to initialize after 15 retries');
      }
    };
    
    attemptUpdate();
  };


  const handleExport = () => {
    if (excalidrawAPIRef.current) {
      const { exportToBlob } = require('@excalidraw/excalidraw');
      exportToBlob({
        elements: excalidrawAPIRef.current.getSceneElements(),
        appState: excalidrawAPIRef.current.getAppState(),
        mimeType: 'image/png',
      }).then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeBoard?.name || 'whiteboard'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  return (
    <div className="flex gap-4 overflow-hidden" style={{ height: 'calc(100vh - 112px)' }}>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <WhiteboardList
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      </div>

      {/* ── Main canvas area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-0 min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-[#0a0a0f]">

        {activeBoard ? (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-[#16161f]/80 backdrop-blur-sm flex-shrink-0">
              {/* Left: toggle + title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
                  title="Toggle sidebar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-white/10" />

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                    <PenTool className="w-3 h-3 text-accent-primary" />
                  </div>
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitleValue}
                        onChange={(e) => setEditingTitleValue(e.target.value)}
                        className="bg-white/10 border border-accent-primary/40 rounded-lg px-2 py-1 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/70 max-w-[150px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEditTitle();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="w-5 h-5 rounded flex items-center justify-center bg-accent-primary/20 hover:bg-accent-primary/40 text-accent-primary transition-colors"
                        title="Save title"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelEditTitle}
                        className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                        {activeBoard.name}
                      </h2>
                      <button
                        onClick={() => handleEditTitle(activeBoard.name)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-text-muted hover:text-accent-primary transition-all"
                        title="Edit title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-save indicator */}
                <div className={`flex items-center gap-1.5 text-[10px] transition-opacity duration-500 ${saving ? 'opacity-100' : 'opacity-0'}`}>
                  <Clock className="w-3 h-3 text-accent-amber animate-spin" />
                  <span className="text-accent-amber font-medium">Saving...</span>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2">
                <AIDiagramPrompt onGenerate={handleGenerateDiagram} />

                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:text-text-primary hover:bg-white/10 hover:border-white/20 transition-all text-xs font-medium"
                  title="Export as PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Canvas — fills remaining height */}
            <div className="flex-1 overflow-hidden">
              {/*
                key={activeBoard?.id} is the CRITICAL fix for board isolation.
                It must be on ExcalidrawWrapper (not on ExcalidrawWithCSS inside it)
                so that the entire component — including useState — resets first.
                The useEffect that reads board.data then runs on a fresh component
                and sets initialData BEFORE ExcalidrawWithCSS ever mounts.
                Putting the key inside (on ExcalidrawWithCSS) causes a race condition
                where Excalidraw mounts with stale initialData from the previous board.
              */}
              <ExcalidrawWrapper
                key={activeBoard?.id}
                board={activeBoard}
                onChange={handleCanvasChange}
                refCallback={(api) => { 
                  excalidrawAPIRef.current = api;
                }}
              />
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-5 max-w-sm mx-auto px-6">
              {/* Animated icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-accent-primary/20 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 border border-accent-primary/30 flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-accent-primary" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No Canvas Selected</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Create or select a whiteboard from the sidebar to start drawing. Use the AI diagram generator to scaffold flows instantly.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['Free Draw', 'Shapes', 'Arrows', 'Text', 'AI Diagrams'].map((f) => (
                  <span key={f} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-text-muted font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export { WhiteboardPage };

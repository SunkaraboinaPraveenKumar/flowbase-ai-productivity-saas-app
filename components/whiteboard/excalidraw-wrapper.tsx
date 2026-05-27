'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import '@excalidraw/excalidraw/index.css';

// Excalidraw component with no SSR
const ExcalidrawWithCSS = dynamic(
  async () => {
    const { Excalidraw } = await import('@excalidraw/excalidraw');
    return Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-primary/60" />
          <span className="text-xs text-text-muted">Loading canvas...</span>
        </div>
      </div>
    ),
  }
);

interface ExcalidrawWrapperProps {
  board: any;
  onChange: (elements: any[]) => void;
  refCallback: (api: any) => void;
}

export default function ExcalidrawWrapper({ board, onChange, refCallback }: ExcalidrawWrapperProps) {
  const [initialData, setInitialData] = useState<any>(null);

  // Single effect — runs when this component mounts (key on parent means a fresh mount per board).
  // Parses board.data and sets initialData so ExcalidrawWithCSS only mounts with the correct elements.
  useEffect(() => {
    if (!board) return;

    try {
      const parsed = board.data ? JSON.parse(board.data) : [];
      const elements = Array.isArray(parsed) ? parsed : [];
      setInitialData({
        elements,
        appState: {
          viewBackgroundColor: '#ffffff',
          gridSize: null,
          selectedElementIds: {},
          selectedGroupIds: {},
        },
      });
    } catch (err) {
      console.error('[ExcalidrawWrapper] Error parsing board data:', err);
      setInitialData({
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
          selectedElementIds: {},
          selectedGroupIds: {},
        },
      });
    }
  // board?.id intentionally not used here — this component is remounted fresh per board
  // via key={activeBoard?.id} on the parent in page.tsx, so we only ever need to run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't render Excalidraw until initialData is ready — it treats initialData as mount-only.
  // If we render before the effect sets data, Excalidraw would mount with an empty canvas.
  if (!initialData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-primary/60" />
          <span className="text-xs text-text-muted">Loading canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ExcalidrawWithCSS
        excalidrawAPI={(api) => {
          refCallback(api);
        }}
        initialData={initialData}
        onChange={(elements, _appState, _files) => {
          // Excalidraw can pass undefined elements on first render — guard against it
          if (!elements) return;
          const safeElements = Array.isArray(elements) ? elements : [];
          onChange(safeElements);
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: true,
            loadScene: true,
            toggleTheme: false,
          },
        }}
        viewModeEnabled={false}
      />
    </div>
  );
}
export { ExcalidrawWrapper };

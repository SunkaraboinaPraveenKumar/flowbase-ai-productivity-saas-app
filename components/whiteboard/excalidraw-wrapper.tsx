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
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
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

  useEffect(() => {
    if (board) {
      try {
        const parsed = board.data ? JSON.parse(board.data) : [];
        const elements = Array.isArray(parsed) ? parsed : [];
        setInitialData({
          elements: elements,
          appState: {
            viewBackgroundColor: '#0a0a0f',
            theme: 'dark',
            gridSize: null,
          },
          scrollToContent: elements.length > 0,
        });
      } catch {
        setInitialData({
          elements: [],
          appState: { viewBackgroundColor: '#0a0a0f', theme: 'dark' },
        });
      }
    }
  }, [board?.id]);

  if (!initialData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
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
        excalidrawAPI={refCallback}
        initialData={initialData}
        onChange={(elements) => onChange(elements && elements.length > 0 ? elements : [])}
        theme="dark"
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

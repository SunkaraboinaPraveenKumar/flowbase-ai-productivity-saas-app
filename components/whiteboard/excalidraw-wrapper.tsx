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
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-primary/60" />
          <span className="text-xs text-slate-500">Loading canvas...</span>
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
    if (!board) {
      setInitialData(null);
      return;
    }

    try {
      const defaultAppState = {
        viewBackgroundColor: '#ffffff',
        theme: 'light',
        gridSize: 20,
        zoom: { value: 1 },
      };

      let parsed: any = [];
      if (typeof board.data === 'string' && board.data.trim()) {
        try {
          parsed = JSON.parse(board.data);
        } catch (err) {
          console.error('Error parsing board data:', err);
          parsed = [];
        }
      }

      const elements = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.elements) ? parsed.elements : [];
      const appState = parsed?.appState && typeof parsed.appState === 'object' ? parsed.appState : {};

      setInitialData({
        elements,
        appState: {
          ...defaultAppState,
          ...appState,
          viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
          theme: appState.theme || 'light',
          zoom: appState.zoom || { value: 1 },
        },
      });
    } catch (err) {
      console.error('Error preparing board data:', err);
      setInitialData({
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
          theme: 'light',
          zoom: { value: 1 },
        },
      });
    }
  }, [board?.id]);

  if (!initialData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-primary/60" />
          <span className="text-xs text-slate-500">Loading canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ExcalidrawWithCSS
        excalidrawAPI={refCallback}
        initialData={initialData}
        onChange={(elements) => onChange(Array.isArray(elements) ? [...elements] : [])}
        theme="light"
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

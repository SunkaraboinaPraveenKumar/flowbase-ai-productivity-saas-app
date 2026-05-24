'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw');
    return module.Excalidraw;
  },
  { ssr: false }
);

interface ExcalidrawWrapperProps {
  board: any;
  onChange: (elements: any[]) => void;
  refCallback: (api: any) => void;
}

export default function ExcalidrawWrapper({ board, onChange, refCallback }: ExcalidrawWrapperProps) {
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (board && board.data) {
      try {
        const parsed = JSON.parse(board.data);
        setInitialData({
          elements: parsed,
          appState: { viewBackgroundColor: '#0a0a0f', theme: 'dark' },
          scrollToContent: true,
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
      <div className="h-full flex items-center justify-center text-text-muted text-xs italic bg-bg-primary">
        Loading canvas...
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-border rounded-xl overflow-hidden bg-bg-primary relative">
      <Excalidraw
        excalidrawAPI={refCallback}
        initialData={initialData}
        onChange={(elements) => onChange([...elements])}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: true,
            export: {
              saveFileToDisk: true,
            },
            loadScene: true,
            toggleTheme: false,
          },
        }}
      />
    </div>
  );
}
export { ExcalidrawWrapper };

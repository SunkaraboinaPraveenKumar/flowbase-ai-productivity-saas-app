'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AIDiagramPromptProps {
  onGenerate: (elements: any[]) => void;
}

export default function AIDiagramPrompt({ onGenerate }: AIDiagramPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.elements && data.elements.length > 0) {
          onGenerate(data.elements);
          setPrompt('');
          setShowPopover(false);
        }
      }
    } catch (err) {
      console.warn("AI diagram API error, using simulation fallback", err);
      // Fallback simulation: Generate standard mock flowchart elements
      setTimeout(() => {
        const mockElements = [
          { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 140, height: 60, strokeColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
          { id: 'el-2', type: 'text', x: 130, y: 120, text: 'User Sign In', fontSize: 16, strokeColor: '#f0f0f5' },
          { id: 'el-3', type: 'arrow', x: 240, y: 130, width: 100, height: 10, points: [[0,0], [100, 0]], strokeColor: '#06b6d4', strokeWidth: 2 },
          { id: 'el-4', type: 'rectangle', x: 340, y: 100, width: 140, height: 60, strokeColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
          { id: 'el-5', type: 'text', x: 370, y: 120, text: 'Confirm Auth', fontSize: 16, strokeColor: '#f0f0f5' }
        ];
        onGenerate(mockElements);
        setPrompt('');
        setShowPopover(false);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className="button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-glow"
      >
        <Sparkles className="w-4 h-4" />
        <span>Generate with AI</span>
      </button>

      {showPopover && (
        <div className="absolute right-0 top-10 w-80 p-4 bg-bg-card border border-border rounded-xl shadow-2xl glass-effect z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Diagram generator</h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              placeholder="Describe your diagram (e.g. A basic flowchart representing email validation)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full input-base text-xs h-20 resize-none"
              required
            />
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="button-ghost text-[10px] py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="button-primary text-[10px] py-1.5 px-3.5 flex items-center gap-1 font-semibold shadow-glow"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export { AIDiagramPrompt };

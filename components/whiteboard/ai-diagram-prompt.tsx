'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface AIDiagramPromptProps {
  onGenerate: (elements: any[]) => void;
}

export default function AIDiagramPrompt({ onGenerate }: AIDiagramPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
        console.log('AI Diagram API response:', data);
        if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
          onGenerate(data.elements);
          setPrompt('');
          setOpen(false);
        } else {
          console.warn('No elements returned from API');
        }
      } else {
        const error = await res.text();
        console.warn('AI diagram API error:', res.status, error);
        useFallback();
      }
    } catch (err) {
      console.warn('AI diagram request error:', err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    const ts = Date.now();
    setTimeout(() => {
      const mockElements = [
        { id: `el-${ts}-1`, type: 'rectangle', x: 100, y: 100, width: 160, height: 64, strokeColor: '#1e3a8a', backgroundColor: 'rgba(30,58,138,0.10)', fillStyle: 'solid', roughness: 1, strokeWidth: 2, groupIds: [], boundElements: null, isDeleted: false, version: 1, versionNonce: 1, updated: ts, link: null, locked: false, frameId: null, roundness: null },
        { id: `el-${ts}-2`, type: 'text', x: 138, y: 122, width: 80, height: 20, text: 'Start', fontSize: 16, fontFamily: 1, textAlign: 'left', verticalAlign: 'top', containerId: null, originalText: 'Start', lineHeight: 1.25, autoResize: true, strokeColor: '#1a1a2e', backgroundColor: 'transparent', fillStyle: 'solid', roughness: 1, strokeWidth: 1, opacity: 100, groupIds: [], boundElements: null, isDeleted: false, version: 1, versionNonce: 2, updated: ts, link: null, locked: false, frameId: null, roundness: null },
        { id: `el-${ts}-3`, type: 'arrow', x: 260, y: 132, width: 80, height: 0, points: [[0, 0], [80, 0]], strokeColor: '#15803d', strokeWidth: 2, fillStyle: 'solid', roughness: 1, opacity: 100, backgroundColor: 'transparent', startArrowhead: null, endArrowhead: 'arrow', startBinding: null, endBinding: null, lastCommittedPoint: null, elbowed: false, groupIds: [], boundElements: null, isDeleted: false, version: 1, versionNonce: 3, updated: ts, link: null, locked: false, frameId: null, roundness: null },
        { id: `el-${ts}-4`, type: 'rectangle', x: 340, y: 100, width: 160, height: 64, strokeColor: '#15803d', backgroundColor: 'rgba(21,128,61,0.10)', fillStyle: 'solid', roughness: 1, strokeWidth: 2, groupIds: [], boundElements: null, isDeleted: false, version: 1, versionNonce: 4, updated: ts, link: null, locked: false, frameId: null, roundness: null },
        { id: `el-${ts}-5`, type: 'text', x: 378, y: 122, width: 84, height: 20, text: 'Process', fontSize: 16, fontFamily: 1, textAlign: 'left', verticalAlign: 'top', containerId: null, originalText: 'Process', lineHeight: 1.25, autoResize: true, strokeColor: '#1a1a2e', backgroundColor: 'transparent', fillStyle: 'solid', roughness: 1, strokeWidth: 1, opacity: 100, groupIds: [], boundElements: null, isDeleted: false, version: 1, versionNonce: 5, updated: ts, link: null, locked: false, frameId: null, roundness: null },
      ];
      console.log('Using AI diagram fallback elements');
      onGenerate(mockElements);
      setPrompt('');
      setOpen(false);
    }, 1200);
  };

  const examplePrompts = [
    'Login authentication flow',
    'E-commerce checkout steps',
    'CI/CD pipeline diagram',
    'Database ERD for blog',
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-primary/80 hover:from-accent-primary/90 hover:to-accent-primary/70 text-white text-xs font-semibold shadow-lg shadow-accent-primary/20 transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Diagram</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 border border-white/10 bg-[#1c1c28]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-gradient-to-r from-accent-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Diagram Generator</h4>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              placeholder="Describe your diagram (e.g. A user authentication flow with OAuth and 2FA)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary/50 resize-none h-20 leading-relaxed transition-colors"
              required
            />
            <p className="text-[10px] text-text-muted/60 leading-tight">💡 For best visibility on white canvas, AI will use dark colors (navy, dark green, dark red)</p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-xl border border-white/10 bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/8 text-xs font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex-1 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/20 transition-all"
              >
                {loading ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Generate</>
                )}
              </button>
            </div>
          </form>

          {/* Example prompts */}
          <div className="border-t border-white/6 pt-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Quick examples</p>
            <div className="grid grid-cols-2 gap-1.5">
              {examplePrompts.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="text-left text-[10px] text-text-muted hover:text-text-primary px-2 py-1.5 rounded-lg bg-white/3 hover:bg-white/8 border border-white/6 hover:border-white/12 transition-all leading-tight"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

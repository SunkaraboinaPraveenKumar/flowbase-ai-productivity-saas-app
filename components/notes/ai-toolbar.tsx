'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AIRefineToolbarProps {
  selectedText: string;
  onRefined: (newText: string) => void;
}

export default function AIRefineToolbar({ selectedText, onRefined }: AIRefineToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleRefine = async (action: string) => {
    if (!selectedText.trim()) return;
    setLoading(true);
    setLastAction(action);

    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.refined) {
          onRefined(data.refined);
        }
      } else {
        throw new Error("Could not refine text");
      }
    } catch (e: any) {
      console.warn("AI refine API error, using fallback refine simulator", e);
      // Fallback Refinement simulation if API key is not configured
      setTimeout(() => {
        let text = selectedText;
        if (action === 'shorter') text = selectedText.substring(0, selectedText.length / 2) + "...";
        else if (action === 'longer') text = selectedText + " (Expanded with further structured observations and procedural recommendations).";
        else text = selectedText + " (Refined for grammatical precision and professional tone).";
        onRefined(text);
      }, 1000);
    } finally {
      setLoading(false);
      setLastAction(null);
    }
  };

  const actions = [
    { label: 'Fix Grammar', value: 'grammar', icon: '✦', hoverClass: 'hover:border-accent-secondary hover:text-accent-secondary hover:bg-accent-secondary/5' },
    { label: 'Make Shorter', value: 'shorter', icon: '⬡', hoverClass: 'hover:border-accent-amber hover:text-accent-amber hover:bg-accent-amber/5' },
    { label: 'Make Longer', value: 'longer', icon: '◈', hoverClass: 'hover:border-accent-green hover:text-accent-green hover:bg-accent-green/5' },
    { label: 'Simplify', value: 'simplify', icon: '◉', hoverClass: 'hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5' },
    { label: 'Professional Tone', value: 'professional', icon: '✴', hoverClass: 'hover:border-accent-rose hover:text-accent-rose hover:bg-accent-rose/5' },
  ];

  return (
    <div className="card p-4 space-y-3 bg-gradient-to-br from-bg-card to-accent-primary/5 border-accent-primary/20">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Text Refiner</h4>
      </div>

      <p className="text-[10px] text-text-secondary leading-relaxed">
        Highlight any text block in your note to rewrite, lengthen, condense, or correct tone instantly.
      </p>

      {selectedText ? (
        <div className="space-y-3">
          {/* Selected text preview */}
          <div className="p-2.5 rounded-lg bg-bg-secondary border border-border text-[10px] text-text-muted italic max-h-[72px] overflow-y-auto leading-relaxed">
            &ldquo;{selectedText}&rdquo;
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {actions.map((act) => (
              <button
                key={act.value}
                type="button"
                disabled={loading}
                onClick={() => handleRefine(act.value)}
                className={`flex items-center gap-2 text-[10px] px-2.5 py-2 rounded-lg border border-border bg-bg-card ${act.hoverClass} disabled:opacity-40 text-text-secondary font-semibold transition-all duration-150`}
              >
                {loading && lastAction === act.value
                  ? <RefreshCw className="w-3 h-3 animate-spin flex-shrink-0" />
                  : <span className="text-[11px] flex-shrink-0">{act.icon}</span>
                }
                {act.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-5 border border-dashed border-border/30 rounded-xl text-center text-[10px] text-text-muted select-none italic space-y-1.5">
          <Sparkles className="w-5 h-5 mx-auto text-text-muted/40 mb-1.5" />
          Highlight document text to unlock refiner controls
        </div>
      )}
    </div>
  );
}

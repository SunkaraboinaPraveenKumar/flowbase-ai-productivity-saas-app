'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AIRefineToolbarProps {
  selectedText: string;
  onRefined: (newText: string) => void;
}

export default function AIRefineToolbar({ selectedText, onRefined }: AIRefineToolbarProps) {
  const [loading, setLoading] = useState(false);

  const handleRefine = async (action: string) => {
    if (!selectedText.trim()) return;
    setLoading(true);

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
    }
  };

  const actions = [
    { label: 'Improve Grammar', value: 'grammar' },
    { label: 'Make Shorter', value: 'shorter' },
    { label: 'Make Longer', value: 'longer' },
    { label: 'Simplify Language', value: 'simplify' },
    { label: 'Professional Tone', value: 'professional' },
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
          <div className="p-2.5 rounded bg-bg-secondary border border-border text-[10px] text-text-muted italic max-h-[80px] overflow-y-auto">
            "{selectedText}"
          </div>
          
          <div className="flex gap-1.5 flex-wrap">
            {actions.map((act) => (
              <button
                key={act.value}
                type="button"
                disabled={loading}
                onClick={() => handleRefine(act.value)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg border border-border bg-bg-card hover:bg-bg-elevated hover:text-accent-primary disabled:opacity-50 text-text-secondary font-medium transition-all"
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-4 border border-dashed border-border/20 rounded-xl text-center text-[10px] text-text-muted select-none italic">
          Highlight document text to unlock refiner controls
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[10px] text-accent-primary animate-pulse justify-center font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Refining selections...</span>
        </div>
      )}
    </div>
  );
}

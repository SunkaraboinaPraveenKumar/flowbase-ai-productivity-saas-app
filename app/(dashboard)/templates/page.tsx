'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Layers } from 'lucide-react';
import TemplateCard from '@/components/templates/template-card';
import MiniAppRenderer from '@/components/templates/mini-app-renderer';

export default function TemplatesPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        if (data.templates?.length > 0 && !activeTemplateId) {
          setActiveTemplateId(data.templates[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      // 1. Ask Gemini to generate schema JSON
      const genRes = await fetch('/api/ai/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!genRes.ok) throw new Error("Generation failed");
      const appSchema = await genRes.json();

      // 2. Save generated app to DB
      const saveRes = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: appSchema.name,
          prompt,
          generatedSchema: JSON.stringify(appSchema.schema),
          generatedUi: JSON.stringify(appSchema.ui),
        }),
      });
      if (saveRes.ok) {
        const data = await saveRes.json();
        setPrompt('');
        fetchTemplates();
        if (data.template) {
          setActiveTemplateId(data.template.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateState = async (updatedState: any[]) => {
    if (!activeTemplateId) return;
    try {
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeTemplateId,
          appState: JSON.stringify(updatedState),
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSidebar = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          addedToSidebar: !currentStatus,
        }),
      });
      fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeTemplateId === id) {
          setActiveTemplateId(null);
        }
        fetchTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId);
  
  // Clean parse helpers
  const parseJson = (str: string) => {
    try { return JSON.parse(str); } catch { return { fields: [] }; }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-full">
      
      {/* Left panel prompt form & list */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-5 space-y-4 bg-bg-card border border-border">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">AI App Builder</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <textarea
              placeholder="Describe app (e.g. Habit Tracker)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full input-base text-xs h-20 resize-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full button-primary py-2 text-xs font-semibold flex items-center gap-1.5 justify-center shadow-glow animate-shimmer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate App</span>
            </button>
          </form>
        </div>

        {/* Existing Custom Apps */}
        <div className="card p-5 space-y-4 bg-bg-card">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Layers className="w-4 h-4 text-accent-secondary" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">My Custom Apps</h3>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted italic">
                No custom apps generated yet. Describe one above!
              </div>
            ) : (
              templates.map((temp) => (
                <TemplateCard
                  key={temp.id}
                  template={temp}
                  isActive={temp.id === activeTemplateId}
                  onSelect={() => setActiveTemplateId(temp.id)}
                  onDelete={() => handleDelete(temp.id)}
                  onToggleSidebar={() => handleToggleSidebar(temp.id, temp.addedToSidebar)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel renderer preview */}
      <div className="lg:col-span-3">
        {activeTemplate ? (
          <MiniAppRenderer
            appName={activeTemplate.name}
            description={`AI generated mini-app. Prompt: "${activeTemplate.prompt}"`}
            schema={parseJson(activeTemplate.generatedSchema)}
            ui={parseJson(activeTemplate.generatedUi)}
            initialState={activeTemplate.appState}
            onStateChange={handleUpdateState}
          />
        ) : (
          <div className="card p-12 text-center space-y-4 max-w-xl mx-auto mt-12 bg-bg-card">
            <Layers className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">No Active Mini App</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Define interactive widgets, fitness logs, or checklists using simple english descriptors. We will write fields, buttons, and storage schemas instantly.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
export { TemplatesPage };

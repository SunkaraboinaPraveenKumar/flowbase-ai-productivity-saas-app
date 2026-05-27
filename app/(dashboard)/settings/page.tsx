'use client';

import { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Tag, 
  Cpu, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'categories' | 'ai'>('profile');
  
  // Custom Category States
  const [categories, setCategories] = useState([
    { id: '1', name: 'Work', color: '#7c3aed', scope: 'calendar' },
    { id: '2', name: 'Personal', color: '#f59e0b', scope: 'calendar' },
    { id: '3', name: 'Design', color: '#06b6d4', scope: 'kanban' }
  ]);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#7c3aed');
  const [catScope, setCatScope] = useState('calendar');

  // AI settings state
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [aiTone, setAiTone] = useState('concise');
  const [enableRefine, setEnableRefine] = useState(true);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCategories([...categories, {
      id: Math.random().toString(),
      name: catName,
      color: catColor,
      scope: catScope
    }]);
    setCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User className="w-4 h-4" /> },
    { id: 'billing', label: 'Subscription & Quotas', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'categories', label: 'Custom Categories', icon: <Tag className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Configurations', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      
      {/* Left Settings Sidebar */}
      <div className="md:col-span-1 card p-3 space-y-1.5 bg-bg-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200",
              activeTab === tab.id 
                ? "bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Right Tab Content Viewer */}
      <div className="md:col-span-3 space-y-6">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="card p-6 bg-bg-card space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Profile Settings</h3>
            
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full input-base text-xs py-1.5 px-3"
                  defaultValue="FlowBase Guest User"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Email Address</label>
                <input
                  type="email"
                  className="w-full input-base text-xs py-1.5 px-3 bg-bg-secondary/50 text-text-muted cursor-not-allowed"
                  defaultValue="guest@flowbase.ai"
                  disabled
                />
              </div>
              <button className="button-primary text-xs py-2 px-5 shadow-glow">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="card p-6 bg-bg-card space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Subscription & Quotas</h3>
              <span className="bg-accent-primary/20 text-accent-primary border border-accent-primary/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Free Plan
              </span>
            </div>

            {/* Quotas checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Calendar Items</span>
                  <span className="text-text-primary font-bold">2 / 25</span>
                </div>
                <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-accent-primary h-full" style={{ width: '8%' }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Kanban Boards</span>
                  <span className="text-text-primary font-bold">1 / 3</span>
                </div>
                <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-accent-secondary h-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Notes</span>
                  <span className="text-text-primary font-bold">4 / 10</span>
                </div>
                <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-accent-green h-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">AI Commands Daily Usage</span>
                  <span className="text-text-primary font-bold">0 / 5</span>
                </div>
                <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-accent-rose h-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Upgrade Card details */}
            <div className="border border-accent-primary/20 bg-accent-primary/5 rounded-xl p-5 mt-6 flex justify-between items-center flex-wrap gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent-primary animate-bounce" />
                  <h4 className="text-xs font-bold text-text-primary font-display uppercase tracking-wider">Unlock Pro Plan</h4>
                </div>
                <p className="text-[10px] text-text-secondary">Get unlimited tasks, boards, notes, and direct voice transcribing services.</p>
              </div>
              <button className="button-primary text-xs py-2 px-6 shadow-glow">
                Upgrade for $12/mo
              </button>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="card p-6 bg-bg-card space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Custom Categories</h3>
            
            {/* Quick category add form */}
            <form onSubmit={handleAddCategory} className="flex gap-4 items-end flex-wrap bg-bg-secondary/40 p-4 border border-border rounded-xl">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-text-muted uppercase">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Design"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="input-base text-xs py-1.5 px-3 bg-bg-primary w-40"
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-text-muted uppercase block">Color</label>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-text-muted uppercase">Scope</label>
                <Select value={catScope} onValueChange={setCatScope}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                className="button-primary text-xs py-2 px-5 flex items-center gap-1 font-semibold shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scope</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {categories.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/40 border border-border hover:border-border-accent text-xs">
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-bold text-text-primary">{c.name}</span>
                    <span className="text-[8px] bg-bg-secondary px-2 py-0.5 rounded border border-border text-text-muted uppercase tracking-wider">{c.scope}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI CONFIGS TAB */}
        {activeTab === 'ai' && (
          <div className="card p-6 bg-bg-card space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">AI Configurations</h3>

            <div className="space-y-4 max-w-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Default Model</label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">AI Writing Tone</label>
                <Select value={aiTone} onValueChange={setAiTone}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise & Direct</SelectItem>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Formal & Professional</SelectItem>
                    <SelectItem value="creative">Creative & Verbose</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary">Enable AI Select-Refine</span>
                  <p className="text-[9px] text-text-secondary">Shows floating selector above highlighted text blocks.</p>
                </div>
                <button
                  onClick={() => setEnableRefine(!enableRefine)}
                  className={`w-10 h-6 rounded-full border transition-all flex items-center p-0.5 ${
                    enableRefine ? 'bg-accent-primary border-accent-primary justify-end' : 'bg-bg-secondary border-border justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export { SettingsPage };

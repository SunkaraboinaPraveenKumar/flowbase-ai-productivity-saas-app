'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface SchemaField {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'date';
}

interface UIComponent {
  type: 'input' | 'button' | 'list';
  fieldId?: string;
  label?: string;
  action?: string;
  title?: string;
  fieldIds?: string[];
  placeholder?: string;
}

interface MiniAppRendererProps {
  appName: string;
  description: string;
  schema: { fields: SchemaField[] };
  ui: { components: UIComponent[] };
  initialState: string | null;
  onStateChange: (state: any[]) => void;
}

export default function MiniAppRenderer({
  appName,
  description,
  schema,
  ui,
  initialState,
  onStateChange
}: MiniAppRendererProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialState) {
      try {
        setRecords(JSON.parse(initialState));
      } catch {
        setRecords([]);
      }
    } else {
      setRecords([]);
    }
    
    // Setup blank form schema
    const initialForm: Record<string, any> = {};
    schema.fields.forEach(f => {
      if (f.type === 'boolean') initialForm[f.id] = false;
      else initialForm[f.id] = '';
    });
    setFormData(initialForm);
  }, [appName, initialState]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleAction = (action?: string) => {
    if (action === 'addRecord') {
      const newRecord = { id: Math.random().toString(), ...formData };
      const updated = [...records, newRecord];
      setRecords(updated);
      onStateChange(updated);

      // Reset form
      const resetForm: Record<string, any> = {};
      schema.fields.forEach(f => {
        if (f.type === 'boolean') resetForm[f.id] = false;
        else resetForm[f.id] = '';
      });
      setFormData(resetForm);
    }
  };

  const toggleBoolean = (recordId: string, fieldId: string) => {
    const updated = records.map(r => 
      r.id === recordId ? { ...r, [fieldId]: !r[fieldId] } : r
    );
    setRecords(updated);
    onStateChange(updated);
  };

  const deleteRecord = (recordId: string) => {
    const updated = records.filter(r => r.id !== recordId);
    setRecords(updated);
    onStateChange(updated);
  };

  return (
    <div className="card p-6 bg-gradient-to-br from-bg-card to-bg-secondary/40 space-y-6">
      
      {/* Title block */}
      <div className="border-b border-border pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-secondary" />
          <h3 className="text-base font-bold text-text-primary font-display">{appName}</h3>
        </div>
        <p className="text-[10px] text-text-secondary">{description}</p>
      </div>

      {/* Dynamic Input Form */}
      <div className="space-y-4 max-w-sm">
        {ui.components.filter(c => c.type === 'input').map((comp, idx) => {
          const field = schema.fields.find(f => f.id === comp.fieldId);
          if (!field) return null;

          return (
            <div key={idx} className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">{field.label}</label>
              {field.type === 'boolean' ? (
                <button
                  type="button"
                  onClick={() => handleInputChange(field.id, !formData[field.id])}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  {formData[field.id] ? <CheckCircle2 className="w-4 h-4 text-accent-green" /> : <Circle className="w-4 h-4" />}
                  <span>Toggle Default</span>
                </button>
              ) : (
                <input
                  type={field.type === 'date' ? 'date' : 'text'}
                  placeholder={comp.placeholder || `Enter ${field.label}...`}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full input-base text-xs py-1.5 px-3"
                />
              )}
            </div>
          );
        })}

        {/* Dynamic Buttons */}
        {ui.components.filter(c => c.type === 'button').map((comp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAction(comp.action)}
            className="w-full button-primary text-xs py-2 shadow-glow font-semibold"
          >
            {comp.label || 'Submit'}
          </button>
        ))}
      </div>

      {/* Dynamic Records List Grid */}
      <div className="space-y-4">
        {ui.components.filter(c => c.type === 'list').map((comp, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">{comp.title || 'Logged items'}</h4>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted italic border-2 border-dashed border-border/20 rounded-xl">
                  No records stored. Fill inputs above to log streaks!
                </div>
              ) : (
                records.map((rec) => (
                  <div key={rec.id} className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary border border-border hover:border-border-accent transition-all text-xs">
                    <div className="flex gap-4 items-center flex-wrap">
                      {comp.fieldIds?.map((fId) => {
                        const field = schema.fields.find(f => f.id === fId);
                        if (!field) return null;

                        if (field.type === 'boolean') {
                          return (
                            <button
                              key={fId}
                              type="button"
                              onClick={() => toggleBoolean(rec.id, fId)}
                              className="flex items-center gap-1 hover:text-accent-primary"
                            >
                              {rec[fId] ? <CheckCircle2 className="w-4 h-4 text-accent-green" /> : <Circle className="w-4 h-4 text-text-muted" />}
                              <span className="text-[10px] text-text-secondary">{field.label}</span>
                            </button>
                          );
                        }

                        return (
                          <div key={fId} className="flex flex-col gap-0.5">
                            <span className="text-[9px] text-text-muted uppercase font-bold">{field.label}</span>
                            <span className="text-text-primary font-medium">{rec[fId] || '-'}</span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => deleteRecord(rec.id)}
                      className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-rose transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
export { MiniAppRenderer };

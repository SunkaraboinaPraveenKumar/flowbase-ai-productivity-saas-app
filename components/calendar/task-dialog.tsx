'use client';

import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  onDelete?: (id: string) => void;
  task?: any; // If editing
  defaultDate?: Date;
}

const CATEGORIES = ['Work', 'Personal', 'Design', 'Development', 'Marketing', 'General'];
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
const TYPES = ['task', 'reminder', 'meeting', 'event'];

export default function TaskDialog({ isOpen, onClose, onSave, onDelete, task, defaultDate }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [taskType, setTaskType] = useState('task');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#7c3aed');
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      
      if (task.scheduledAt) {
        const d = new Date(task.scheduledAt);
        setDate(format(d, 'yyyy-MM-dd'));
        setTime(format(d, 'HH:mm'));
      } else {
        setDate('');
        setTime('');
      }
      
      setTaskType(task.taskType || 'task');
      setCategory(task.category || 'General');
      setColor(task.color || '#7c3aed');
      setIsDraft(task.isDraft || false);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '');
      setTime('');
      setTaskType('task');
      setCategory('General');
      setColor('#7c3aed');
      setIsDraft(false);
    }
  }, [task, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, draftMode = false) => {
    e.preventDefault();
    if (!title.trim()) return;

    let scheduledAt = null;
    if (date) {
      scheduledAt = time ? new Date(`${date}T${time}`) : new Date(date);
    }

    onSave({
      id: task?.id,
      title,
      description,
      scheduledAt: draftMode ? null : scheduledAt?.toISOString(),
      isDraft: draftMode,
      taskType,
      category,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden glass-effect animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
          <h3 className="font-bold text-text-primary">
            {task ? 'Edit Schedule Item' : 'New Schedule Item'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, isDraft)} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Title</label>
            <input
              type="text"
              placeholder="e.g. Design review meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-base"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Description</label>
            <textarea
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full input-base h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 !text-accent-primary flex-shrink-0" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full input-base text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 !text-accent-secondary flex-shrink-0" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full input-base text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Type</label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase block">Color Badge</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    color === c ? 'border-text-primary scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-accent-rose bg-accent-rose/10 hover:bg-accent-rose/20 transition-all border border-accent-rose/25"
              >
                Delete
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all"
              >
                Save as Draft
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="button-ghost py-2 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary py-2 px-5 text-xs shadow-glow"
              >
                Schedule
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

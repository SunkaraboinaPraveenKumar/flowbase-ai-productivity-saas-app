'use client';

import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Send } from 'lucide-react';
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
  task?: any;
  columns: any[];
}

export default function TaskDialog({ isOpen, onClose, onSave, onDelete, task, columns }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [label, setLabel] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [columnId, setColumnId] = useState('');
  
  // Custom mock comment state for visual presentation
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setLabel(task.label || '');
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      setColumnId(task.columnId || '');
      
      // Default mock comments
      setComments([
        { id: '1', author: 'Clerk User', text: 'Working on getting this implemented by tomorrow morning.', time: '2 hours ago' },
        { id: '2', author: 'Spark Bot', text: 'Synced to calendar tracker.', time: '1 hour ago' }
      ]);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setLabel('');
      setDueDate('');
      setColumnId(columns[0]?.id || '');
      setComments([]);
    }
  }, [task, isOpen, columns]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: task?.id,
      title,
      description,
      priority,
      label,
      dueDate: dueDate || null,
      columnId,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([...comments, {
      id: Math.random().toString(),
      author: 'You',
      text: newComment,
      time: 'Just now'
    }]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-bg-card border border-border rounded-xl shadow-2xl glass-effect animate-in fade-in zoom-in-95 duration-150 grid grid-cols-1 md:grid-cols-5 h-[80vh] md:h-auto md:max-h-[85vh]">
        
        {/* Form Details Area */}
        <form onSubmit={handleSubmit} className="md:col-span-3 p-5 border-r border-border flex flex-col gap-4 overflow-x-hidden overflow-y-auto relative">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h3 className="font-bold text-text-primary">
              {task ? 'Edit Card details' : 'New Board Card'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 md:hidden rounded-md text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Card Title</label>
            <input
              type="text"
              placeholder="e.g. Design review mockups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-base"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Description</label>
            <textarea
              placeholder="Add task outline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full input-base h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Column</label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Category Label</label>
              <input
                type="text"
                placeholder="e.g. Marketing"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full input-base text-xs py-1.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full input-base text-xs py-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 mt-2 pb-2">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-accent-rose bg-accent-rose/10 hover:bg-accent-rose/20 transition-all border border-accent-rose/25"
              >
                Delete Card
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="button-ghost py-2 px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="button-primary py-2 px-5 text-xs shadow-glow">
                Save Card
              </button>
            </div>
          </div>
        </form>

        {/* Comment Thread Area */}
        <div className="md:col-span-2 bg-bg-secondary/40 flex flex-col justify-between h-full md:max-h-[85vh] relative overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-bg-secondary">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Comments Thread</span>
            <button type="button" onClick={onClose} className="hidden md:block p-1 rounded-md text-text-secondary hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comment list */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {comments.map((comm) => (
              <div key={comm.id} className="space-y-1 text-[11px] border-b border-border/30 pb-2 last:border-0">
                <div className="flex justify-between font-semibold text-text-primary">
                  <span>{comm.author}</span>
                  <span className="text-[9px] text-text-muted font-normal">{comm.time}</span>
                </div>
                <p className="text-text-secondary leading-relaxed">{comm.text}</p>
              </div>
            ))}
          </div>

          {/* Comment form */}
          <form onSubmit={handleAddComment} className="p-3 border-t border-border bg-bg-secondary flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="Write comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 input-base text-[11px] py-1.5 px-2 bg-bg-primary"
            />
            <button type="submit" className="p-2 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/95 transition-all">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

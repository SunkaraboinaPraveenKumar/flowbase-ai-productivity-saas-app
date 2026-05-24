'use client';

import { Plus, MoreHorizontal } from 'lucide-react';
import TaskCard, { Task } from './task-card';

interface KanbanColumnProps {
  id: string;
  name: string;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onSelectTask: (task: Task) => void;
  onDeleteColumn: (id: string) => void;
}

export default function KanbanColumn({ id, name, tasks, onAddTask, onSelectTask, onDeleteColumn }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-bg-secondary/40 border border-border rounded-xl flex flex-col max-h-[70vh] shadow-inner">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-bg-secondary/20">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">{name}</h4>
          <span className="bg-bg-secondary border border-border text-text-muted text-[10px] px-2 py-0.5 rounded-full font-bold">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddTask(id)}
            className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary"
            title="Add Task to Column"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteColumn(id)}
            className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-accent-rose"
            title="Delete Column"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-border/20 rounded-xl flex flex-col items-center justify-center text-[10px] text-text-muted select-none">
            No cards in column
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))
        )}
      </div>
    </div>
  );
}

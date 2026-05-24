'use client';

import { useState, useEffect } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarGrid from '@/components/calendar/calendar-grid';
import WeekView from '@/components/calendar/week-view';
import DraftPanel from '@/components/calendar/draft-panel';
import TaskDialog from '@/components/calendar/task-dialog';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePrev = () => {
    setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSaveTask = async (taskData: any) => {
    const method = taskData.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/calendar', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDraft = async (title: string) => {
    await handleSaveTask({
      title,
      isDraft: true,
      taskType: 'reminder',
      category: 'General',
      color: '#f59e0b',
    });
  };

  const drafts = tasks.filter(t => t.isDraft);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Calendar Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <button onClick={handlePrev} className="p-2 border border-border hover:bg-bg-secondary rounded-lg text-text-secondary hover:text-text-primary transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-text-primary min-w-[140px] text-center">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
            </h2>
            <button onClick={handleNext} className="p-2 border border-border hover:bg-bg-secondary rounded-lg text-text-secondary hover:text-text-primary transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 border border-border hover:bg-bg-secondary text-xs font-semibold rounded-lg transition-all ml-2">
              Today
            </button>
          </div>

          <div className="flex items-center gap-3 justify-end">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border bg-bg-secondary p-0.5 text-xs font-semibold text-text-secondary">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'month' ? 'bg-accent-primary text-white' : 'hover:text-text-primary'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'week' ? 'bg-accent-primary text-white' : 'hover:text-text-primary'
                }`}
              >
                Week
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedTask(null);
                setDefaultDate(new Date());
                setIsDialogOpen(true);
              }}
              className="button-primary py-1.5 px-4 text-xs flex items-center gap-1.5 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* View Grid */}
        {viewMode === 'month' ? (
          <CalendarGrid
            currentDate={currentDate}
            tasks={tasks}
            onSelectDay={(day) => {
              setDefaultDate(day);
              setSelectedTask(null);
              setIsDialogOpen(true);
            }}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsDialogOpen(true);
            }}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            tasks={tasks}
            onSelectTimeSlot={(day, hour) => {
              const d = new Date(day);
              d.setHours(hour);
              setDefaultDate(d);
              setSelectedTask(null);
              setIsDialogOpen(true);
            }}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsDialogOpen(true);
            }}
          />
        )}
      </div>

      {/* Side Draft Panel */}
      <div className="lg:col-span-1">
        <DraftPanel
          drafts={drafts}
          onAddDraft={handleAddDraft}
          onSelectDraft={(draft) => {
            setSelectedTask(draft);
            setIsDialogOpen(true);
          }}
        />
      </div>

      {/* Add/Edit Dialog */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        defaultDate={defaultDate}
      />
    </div>
  );
}

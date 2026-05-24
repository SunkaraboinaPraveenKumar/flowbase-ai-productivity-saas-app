'use client';

import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  tasks: any[];
  onSelectTimeSlot: (date: Date, hour: number) => void;
  onSelectTask: (task: any) => void;
}

export default function WeekView({ currentDate, tasks, onSelectTimeSlot, onSelectTask }: WeekViewProps) {
  const start = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  return (
    <div className="card bg-bg-card overflow-hidden">
      {/* Header columns */}
      <div className="grid grid-cols-8 border-b border-border bg-bg-secondary/50 text-center items-center">
        <div className="py-3 border-r border-border text-[9px] font-bold text-text-muted uppercase">Time</div>
        {days.map((day, idx) => {
          const isDayToday = isToday(day);
          return (
            <div 
              key={idx} 
              className={cn(
                "py-3 flex flex-col items-center gap-0.5",
                isDayToday && "bg-accent-primary/5 text-accent-primary"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{format(day, 'EEE')}</span>
              <span className={cn(
                "text-sm font-black flex items-center justify-center w-6 h-6 rounded-full text-text-primary",
                isDayToday && "bg-accent-primary text-white"
              )}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const timeLabel = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;

          return (
            <div key={hour} className="grid grid-cols-8 border-b border-border/40 min-h-[50px] divide-x divide-border/30">
              {/* Hour Column */}
              <div className="flex items-center justify-center text-[9px] font-semibold text-text-muted bg-bg-secondary/20">
                {timeLabel}
              </div>

              {/* Day Columns */}
              {days.map((day, dIdx) => {
                // Find tasks scheduled during this specific hour slot
                const slotTasks = tasks.filter((t) => {
                  if (!t.scheduledAt || t.isDraft) return false;
                  const tDate = new Date(t.scheduledAt);
                  return isSameDay(tDate, day) && tDate.getHours() === hour;
                });

                return (
                  <div
                    key={dIdx}
                    onClick={() => onSelectTimeSlot(day, hour)}
                    className="p-1 hover:bg-bg-secondary/20 cursor-pointer flex flex-col gap-1 transition-all select-none relative"
                  >
                    {slotTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className="text-[9px] p-1 rounded font-semibold text-white truncate hover:brightness-105 transition-all shadow"
                        style={{ backgroundColor: task.color || '#7c3aed' }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  tasks: any[];
  onSelectDay: (date: Date) => void;
  onSelectTask: (task: any) => void;
}

export default function CalendarGrid({ currentDate, tasks, onSelectDay, onSelectTask }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card bg-bg-card overflow-hidden">
      {/* Week Day Header */}
      <div className="grid grid-cols-7 border-b border-border bg-bg-secondary/50">
        {weekDays.map((wd) => (
          <div key={wd} className="py-2.5 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {wd}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const dayTasks = tasks.filter((t) => t.scheduledAt && isSameDay(new Date(t.scheduledAt), day) && !t.isDraft);

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-[100px] p-2 flex flex-col gap-1 cursor-pointer transition-all hover:bg-bg-secondary/40 select-none",
                !isCurrentMonth && "opacity-30",
                isDayToday && "bg-accent-primary/5"
              )}
            >
              {/* Day Indicator */}
              <div className="flex justify-between items-center">
                <span 
                  className={cn(
                    "text-xs font-semibold flex items-center justify-center w-6 h-6 rounded-full text-text-secondary",
                    isDayToday && "bg-accent-primary text-white font-bold"
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[9px] font-bold text-text-muted">
                    {dayTasks.length} tasks
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded font-medium text-white truncate shadow-sm hover:brightness-105 transition-all"
                    style={{ backgroundColor: task.color || '#7c3aed' }}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[8px] text-text-muted text-center font-bold">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

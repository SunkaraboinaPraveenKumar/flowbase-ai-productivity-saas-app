'use client';

import { addDays, format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CalendarTask {
  id: string;
  title: string;
  scheduledAt: Date | string | null;
  color?: string;
}

export default function UpcomingCalendarStrip({ tasks = [] }: { tasks?: CalendarTask[] }) {
  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-accent-primary" />
          <span>Upcoming Schedule</span>
        </h3>
        <Link href="/calendar" className="text-xs text-accent-primary hover:underline flex items-center gap-0.5">
          <span>Full Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day, idx) => {
          const dayTasks = tasks.filter(t => t.scheduledAt && isSameDay(new Date(t.scheduledAt), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx}
              className={`flex-shrink-0 w-28 rounded-xl border p-3 flex flex-col items-center gap-2 select-none transition-all ${
                isToday 
                  ? 'bg-accent-primary/10 border-accent-primary' 
                  : 'bg-bg-secondary border-border hover:border-border-accent'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-accent-primary' : 'text-text-muted'}`}>
                {format(day, 'EEE')}
              </span>
              <span className="text-2xl font-black text-text-primary">
                {format(day, 'd')}
              </span>
              <div className="w-full flex flex-col gap-1 min-h-[40px] justify-center">
                {dayTasks.length === 0 ? (
                  <span className="text-[10px] text-text-muted text-center italic">Free</span>
                ) : (
                  dayTasks.slice(0, 2).map((t) => (
                    <div 
                      key={t.id} 
                      className="text-[9px] px-1.5 py-0.5 rounded truncate text-white"
                      style={{ backgroundColor: t.color || '#7c3aed' }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))
                )}
                {dayTasks.length > 2 && (
                  <span className="text-[8px] text-text-muted text-center font-bold">
                    +{dayTasks.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

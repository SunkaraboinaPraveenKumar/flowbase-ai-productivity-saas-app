'use client';

import { useState, useEffect } from 'react';
import { Calendar, Kanban, FileText, FolderPlus } from 'lucide-react';
import StatsCard from '@/components/dashboard/stats-card';
import QuickActions from '@/components/dashboard/quick-actions';
import UpcomingCalendarStrip from '@/components/dashboard/upcoming-calendar-strip';
import RecentActivity from '@/components/dashboard/recent-activity';
import AIInsightPanel from '@/components/dashboard/ai-insight-panel';

export default function Dashboard() {
  const [data, setData] = useState({
    calendarCount: 0,
    kanbanCount: 0,
    notesCount: 0,
    spacesCount: 0,
    upcomingTasks: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic fetching of workspace summary
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const body = await res.json();
          setData(body);
        }
      } catch (err) {
        console.warn("Failed fetching dashboard stats, using mock summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-bg-card border border-border rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-bg-card border border-border rounded-xl" />
            <div className="h-48 bg-bg-card border border-border rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-bg-card border border-border rounded-xl" />
            <div className="h-64 bg-bg-card border border-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={<Calendar className="w-5 h-5" />} 
          title="Scheduled Items" 
          value={data.calendarCount} 
          trend="Upcoming"
          colorClass="text-accent-primary"
        />
        <StatsCard 
          icon={<Kanban className="w-5 h-5" />} 
          title="Kanban Boards" 
          value={data.kanbanCount} 
          trend="Active"
          colorClass="text-accent-secondary"
        />
        <StatsCard 
          icon={<FileText className="w-5 h-5" />} 
          title="Total Notes" 
          value={data.notesCount} 
          trend="Pinned available"
          colorClass="text-accent-green"
        />
        <StatsCard 
          icon={<FolderPlus className="w-5 h-5" />} 
          title="Spaces & Folders" 
          value={data.spacesCount} 
          trend="Shared"
          colorClass="text-purple-400"
        />
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left widgets */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingCalendarStrip tasks={data.upcomingTasks} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActions />
            <AIInsightPanel />
          </div>
        </div>

        {/* Right widgets */}
        <div className="space-y-6">
          <RecentActivity activities={data.activities} />
        </div>
      </div>
    </div>
  );
}

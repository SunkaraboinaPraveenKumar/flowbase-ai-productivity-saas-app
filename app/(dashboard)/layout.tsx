'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync user with DB on mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/auth/sync', {
        method: 'POST',
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error('Failed to sync user with DB:', data.error);
          }
        })
        .catch((err) => console.error('Error syncing user:', err));
    }
  }, [isSignedIn, user]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isCollapsed ? "pl-[68px]" : "pl-[260px]"
        )}
      >
        {/* Topbar */}
        <Topbar 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

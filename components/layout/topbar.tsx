'use client';

import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import CommandPalette from './command-palette';
import NotificationPanel from './notification-panel';

export default function Topbar({ 
  onToggleSidebar 
}: { 
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Derive page title from pathname
  const getPageTitle = () => {
    if (!pathname) return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    
    // Capitalize and format
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-bg-secondary/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Trigger */}
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-bg-card text-text-muted hover:text-text-secondary transition-all text-sm w-44 md:w-64"
          >
            <Search className="w-4 h-4 text-text-muted" />
            <span className="flex-1 text-left hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-bg-secondary px-1.5 font-mono text-[10px] font-medium text-text-muted">
              <span>⌘</span>K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <NotificationPanel />

          {/* Auth Section */}
          {isLoaded && isSignedIn && user ? (
            <div className="pl-2 border-l border-border h-8 flex items-center gap-2">
              <span className="text-sm text-text-secondary hidden sm:inline">
                {user.firstName || user.emailAddresses?.[0]?.emailAddress}
              </span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-lg border border-border',
                  }
                }}
              />
            </div>
          ) : (
            <div className="pl-2 border-l border-border h-8 flex items-center">
              <span className="text-sm text-text-muted">Loading...</span>
            </div>
          )}
        </div>
      </header>

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
      />
    </>
  );
}

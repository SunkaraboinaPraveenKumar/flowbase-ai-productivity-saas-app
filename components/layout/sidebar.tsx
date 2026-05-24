'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Bot, 
  Calendar as CalendarIcon, 
  Kanban, 
  FileText, 
  Palette, 
  FolderHeart, 
  Flame, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const NAV_GROUPS: SidebarGroup[] = [
  {
    label: 'WORKSPACE',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Bot, label: 'AI Assistant', href: '/ai-assistant' },
    ],
  },
  {
    label: 'PRODUCTIVITY',
    items: [
      { icon: CalendarIcon, label: 'Calendar', href: '/calendar' },
      { icon: Kanban, label: 'Kanban Board', href: '/kanban' },
      { icon: FileText, label: 'Notes', href: '/notes' },
    ],
  },
  {
    label: 'CREATIVE',
    items: [
      { icon: Palette, label: 'Whiteboard', href: '/whiteboard' },
      { icon: FolderHeart, label: 'Spaces & Pages', href: '/spaces' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { icon: Flame, label: 'AI Templates', href: '/templates' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];

export default function Sidebar({ 
  isCollapsed, 
  onToggle 
}: { 
  isCollapsed: boolean; 
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border transition-all duration-300 flex flex-col z-40 select-none",
        isCollapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 border-b border-border px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-text-gradient font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            <span>FlowBase</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="mx-auto text-accent-primary">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </Link>
        )}
        <button 
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-bg-card border border-transparent hover:border-border text-text-secondary hover:text-text-primary hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {group.label}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm relative",
                      isActive 
                        ? "bg-accent-primary/10 text-text-primary border-l-2 border-accent-primary font-medium" 
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive ? "text-accent-primary" : "text-text-muted group-hover:text-text-secondary"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-[76px] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-bg-elevated border border-border text-text-primary text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Plan Display */}
      <div className="p-4 border-t border-border bg-bg-card/50 space-y-3">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Plan: <b className="text-accent-primary">Free</b></span>
              <span className="text-text-muted">0 / 5 actions</span>
            </div>
            <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden border border-border">
              <div className="bg-accent-primary h-full rounded-full" style={{ width: '0%' }}></div>
            </div>
            <Link 
              href="/settings"
              className="w-full py-2 px-3 text-xs text-center block rounded-xl font-medium border border-accent-primary/30 hover:border-accent-primary bg-accent-primary/5 hover:bg-accent-primary/20 text-accent-primary hover:text-text-primary transition-all duration-200"
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : (
          <Link 
            href="/settings"
            className="flex-center w-8 h-8 rounded-xl border border-accent-primary/20 hover:border-accent-primary bg-accent-primary/5 hover:bg-accent-primary/20 text-accent-primary hover:text-text-primary transition-all duration-200 mx-auto"
            title="Upgrade to Pro"
          >
            👑
          </Link>
        )}
      </div>
    </aside>
  );
}

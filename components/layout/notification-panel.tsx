'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock, AlertTriangle, Calendar, Zap, Loader2 } from 'lucide-react';

type NotifType = 'activity' | 'reminder' | 'overdue';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  icon: string;
  color: string;
  time: string;
  read: boolean;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}

function timeFuture(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 60) return `in ${m}m`;
  if (h < 24) return `in ${h}h`;
  return `in ${d}d`;
}

const typeConfig: Record<NotifType, { icon: React.ElementType; label: string; pill: string }> = {
  activity: { icon: Zap,           label: 'Activity', pill: 'bg-violet-500/15 text-violet-300' },
  reminder: { icon: Calendar,      label: 'Reminder', pill: 'bg-sky-500/15 text-sky-300' },
  overdue:  { icon: AlertTriangle, label: 'Overdue',  pill: 'bg-red-500/15 text-red-400' },
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<NotifType | 'all'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => setNotifications(data.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const filtered = notifications.filter(n =>
    activeFilter === 'all' ? true : n.type === activeFilter
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell trigger ── */}
      <button
        id="notifications-bell"
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all relative"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-all ${open ? 'text-accent-primary' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-primary text-white text-[10px] font-bold ring-2 ring-bg-secondary animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification panel ── */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[380px] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-50"
          style={{ background: 'linear-gradient(145deg, #16161f 0%, #1c1c2a 100%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-accent-primary" />
              </div>
              <span className="text-sm font-bold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>All read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-2">
            {(['all', 'reminder', 'overdue', 'activity'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'All' : typeConfig[f].label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px] px-2 pb-3 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12 text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin text-accent-primary/60" />
                <span className="text-xs">Loading notifications…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-text-muted">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-text-muted/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text-secondary">All caught up!</p>
                  <p className="text-xs text-text-muted mt-0.5">No notifications here yet.</p>
                </div>
              </div>
            ) : (
              filtered.map(n => {
                const isRead = readIds.has(n.id);
                const isFuture = new Date(n.time).getTime() > Date.now();
                const TypeIcon = typeConfig[n.type].icon;

                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition-all group ${
                      isRead
                        ? 'opacity-50 hover:opacity-70 hover:bg-white/3'
                        : 'bg-white/4 hover:bg-white/7 border border-white/5'
                    }`}
                  >
                    {/* Emoji icon with color ring */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg mt-0.5"
                      style={{ background: `${n.color}22`, border: `1px solid ${n.color}44` }}
                    >
                      {n.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight truncate ${isRead ? 'text-text-muted' : 'text-text-primary'}`}>
                          {n.title}
                        </p>
                        {!isRead && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent-primary mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${typeConfig[n.type].pill}`}>
                          <TypeIcon className="w-2.5 h-2.5" />
                          {typeConfig[n.type].label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <Clock className="w-2.5 h-2.5" />
                          {isFuture ? timeFuture(n.time) : timeAgo(n.time)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="border-t border-white/8 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-text-muted">{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
              <button
                onClick={markAllRead}
                className="text-[11px] text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { Activity, Clock, Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export interface ActivityEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityName?: string;
  createdAt: Date | string;
}

export default function RecentActivity({ activities = [] }: { activities?: ActivityEntry[] }) {
  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('add')) return <Plus className="w-3.5 h-3.5 text-accent-green" />;
    if (act.includes('complete')) return <Check className="w-3.5 h-3.5 text-accent-primary" />;
    if (act.includes('delete') || act.includes('remove')) return <Trash2 className="w-3.5 h-3.5 text-accent-rose" />;
    return <Edit2 className="w-3.5 h-3.5 text-accent-secondary" />;
  };

  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-4 h-4 text-accent-secondary" />
        <span>Recent Activity</span>
      </h3>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted italic">
            No recent activity logged yet.
          </div>
        ) : (
          activities.slice(0, 10).map((act) => (
            <div key={act.id} className="flex gap-3 items-start text-xs border-b border-border/30 pb-3 last:border-0 last:pb-0">
              <div className="p-1.5 bg-bg-secondary border border-border rounded-lg mt-0.5">
                {getActionIcon(act.action)}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-text-primary font-medium">
                  {act.action}{' '}
                  {act.entityName && (
                    <span className="text-text-secondary font-semibold">
                      "{act.entityName}"
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(act.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

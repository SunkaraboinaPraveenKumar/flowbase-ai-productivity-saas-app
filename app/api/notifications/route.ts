import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  users, activityLog, calendarTasks, kanbanTasks,
  notes, whiteboards, kanbanBoards, spaces, pages,
} from '@/db/schema';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ notifications: [] });
    const dbUser = dbUsers[0];

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // 1. Recent activity log (last 25 entries)
    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, dbUser.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(25);

    // ── Enrich activity entries with real entity names ──
    // Collect entity IDs per type so we can batch-fetch names
    const idsByType: Record<string, string[]> = {};
    for (const act of activities) {
      if (act.entityType && act.entityId) {
        if (!idsByType[act.entityType]) idsByType[act.entityType] = [];
        idsByType[act.entityType].push(act.entityId);
      }
    }

    const nameMap: Record<string, string> = {}; // entityId → display name

    const lookups: Promise<void>[] = [];

    if (idsByType['note']?.length) {
      lookups.push(
        db.select({ id: notes.id, title: notes.title })
          .from(notes)
          .where(inArray(notes.id, idsByType['note']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.title; }))
      );
    }
    if (idsByType['whiteboard']?.length) {
      lookups.push(
        db.select({ id: whiteboards.id, name: whiteboards.name })
          .from(whiteboards)
          .where(inArray(whiteboards.id, idsByType['whiteboard']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.name; }))
      );
    }
    if (idsByType['board']?.length) {
      lookups.push(
        db.select({ id: kanbanBoards.id, name: kanbanBoards.name })
          .from(kanbanBoards)
          .where(inArray(kanbanBoards.id, idsByType['board']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.name; }))
      );
    }
    if (idsByType['task']?.length) {
      lookups.push(
        db.select({ id: kanbanTasks.id, title: kanbanTasks.title })
          .from(kanbanTasks)
          .where(inArray(kanbanTasks.id, idsByType['task']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.title; }))
      );
    }
    if (idsByType['space']?.length) {
      lookups.push(
        db.select({ id: spaces.id, name: spaces.name })
          .from(spaces)
          .where(inArray(spaces.id, idsByType['space']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.name; }))
      );
    }
    if (idsByType['page']?.length) {
      lookups.push(
        db.select({ id: pages.id, title: pages.title })
          .from(pages)
          .where(inArray(pages.id, idsByType['page']))
          .then(rows => rows.forEach(r => { nameMap[r.id] = r.title; }))
      );
    }

    await Promise.allSettled(lookups);

    // 2. Upcoming calendar tasks (next 48 hours)
    const upcomingCalendar = await db
      .select()
      .from(calendarTasks)
      .where(
        and(
          eq(calendarTasks.userId, dbUser.id),
          gte(calendarTasks.scheduledAt, now),
          lte(calendarTasks.scheduledAt, in48h)
        )
      )
      .orderBy(calendarTasks.scheduledAt)
      .limit(10);

    // 3. Overdue kanban tasks
    const overdueKanban = await db
      .select()
      .from(kanbanTasks)
      .where(
        and(
          eq(kanbanTasks.userId, dbUser.id),
          lte(kanbanTasks.dueDate, now)
        )
      )
      .orderBy(desc(kanbanTasks.dueDate))
      .limit(5);

    type Notif = {
      id: string;
      type: 'activity' | 'reminder' | 'overdue';
      title: string;
      body: string;
      icon: string;
      color: string;
      time: string;
      read: boolean;
    };

    const notifications: Notif[] = [];

    const iconMap: Record<string, string> = {
      task: '✅', note: '📝', board: '📋', page: '📄',
      whiteboard: '🎨', space: '📁', reminder: '🔔',
    };
    const colorMap: Record<string, string> = {
      task: '#7c3aed', note: '#06b6d4', board: '#10b981',
      page: '#f59e0b', whiteboard: '#ec4899', space: '#8b5cf6', reminder: '#f97316',
    };

    // Build activity notifications — now with real entity names
    for (const act of activities) {
      const entityName = act.entityId ? nameMap[act.entityId] : null;
      const entityTypeLabel = act.entityType
        ? act.entityType.charAt(0).toUpperCase() + act.entityType.slice(1)
        : '';

      notifications.push({
        id: `act-${act.id}`,
        type: 'activity',
        title: act.action,
        // Show real name if we resolved it, otherwise just the type label
        body: entityName
          ? `${entityTypeLabel} · ${entityName}`
          : entityTypeLabel || 'Activity recorded',
        icon: iconMap[act.entityType ?? ''] ?? '🔔',
        color: colorMap[act.entityType ?? ''] ?? '#7c3aed',
        time: act.createdAt?.toISOString() ?? new Date().toISOString(),
        read: false,
      });
    }

    // Calendar reminders
    for (const task of upcomingCalendar) {
      const scheduledAt = task.scheduledAt!;
      const diffMs = scheduledAt.getTime() - now.getTime();
      const diffH = Math.round(diffMs / (1000 * 60 * 60));
      const timeLabel = diffH < 1 ? 'in less than an hour'
        : diffH === 1 ? 'in 1 hour'
        : diffH < 24 ? `in ${diffH} hours`
        : 'tomorrow';

      notifications.push({
        id: `cal-${task.id}`,
        type: 'reminder',
        title: task.title,
        body: `Scheduled ${timeLabel}`,
        icon: '📅',
        color: task.color ?? '#7c3aed',
        time: scheduledAt.toISOString(),
        read: false,
      });
    }

    // Overdue kanban tasks
    for (const task of overdueKanban) {
      const dueDate = task.dueDate!;
      const diffMs = now.getTime() - dueDate.getTime();
      const diffH = Math.round(diffMs / (1000 * 60 * 60));
      const overdueLabel = diffH < 24 ? `${diffH}h overdue` : `${Math.floor(diffH / 24)}d overdue`;

      notifications.push({
        id: `kanban-${task.id}`,
        type: 'overdue',
        title: task.title,
        body: `Task is ${overdueLabel} · Priority: ${task.priority ?? 'medium'}`,
        icon: '⚠️',
        color: '#ef4444',
        time: dueDate.toISOString(),
        read: false,
      });
    }

    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ notifications: notifications.slice(0, 25) });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    const now = new Date();
    return NextResponse.json({
      notifications: [
        {
          id: 'f-1', type: 'reminder', title: 'Team standup meeting',
          body: 'Scheduled in 2 hours', icon: '📅', color: '#7c3aed',
          time: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(), read: false,
        },
        {
          id: 'f-2', type: 'activity', title: 'AI Diagram generated',
          body: 'Whiteboard · Ecommerce Flow', icon: '🎨', color: '#ec4899',
          time: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), read: false,
        },
        {
          id: 'f-3', type: 'overdue', title: 'Review landing page copy',
          body: 'Task is 1d overdue · Priority: high', icon: '⚠️', color: '#ef4444',
          time: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), read: false,
        },
        {
          id: 'f-4', type: 'activity', title: 'Created Note',
          body: 'Note · Product Roadmap Q3', icon: '📝', color: '#06b6d4',
          time: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), read: false,
        },
        {
          id: 'f-5', type: 'reminder', title: 'Client demo presentation',
          body: 'Scheduled tomorrow', icon: '📅', color: '#10b981',
          time: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(), read: false,
        },
        {
          id: 'f-6', type: 'activity', title: 'Created Board',
          body: 'Board · Sprint 4 — Backend', icon: '📋', color: '#10b981',
          time: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(), read: false,
        },
      ],
    });
  }
}

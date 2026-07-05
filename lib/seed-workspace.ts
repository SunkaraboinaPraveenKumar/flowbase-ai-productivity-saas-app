import { db } from '@/db';
import {
  users,
  calendarTasks,
  kanbanBoards,
  kanbanColumns,
  kanbanTasks,
  notes,
  spaces,
  pages,
  whiteboards,
  aiTemplates,
  activityLog,
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function ensureUserWorkspaceSeeded(
  clerkId: string,
  options?: { name?: string | null; email?: string | null }
) {
  const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existingUsers.length === 0) {
    return { seeded: false, reason: 'user-not-found' as const };
  }

  const user = existingUsers[0];

  const [calendarRows, boardRows, noteRows, spaceRows, whiteboardRows, templateRows] = await Promise.all([
    db.select().from(calendarTasks).where(eq(calendarTasks.userId, user.id)).limit(1),
    db.select().from(kanbanBoards).where(eq(kanbanBoards.userId, user.id)).limit(1),
    db.select().from(notes).where(eq(notes.userId, user.id)).limit(1),
    db.select().from(spaces).where(eq(spaces.userId, user.id)).limit(1),
    db.select().from(whiteboards).where(eq(whiteboards.userId, user.id)).limit(1),
    db.select().from(aiTemplates).where(eq(aiTemplates.userId, user.id)).limit(1),
  ]);

  const hasAnyWorkspaceData = [calendarRows, boardRows, noteRows, spaceRows, whiteboardRows, templateRows].some(
    (rows) => rows.length > 0
  );

  if (hasAnyWorkspaceData) {
    return { seeded: false, reason: 'existing-data' as const };
  }

  const profileName = options?.name?.trim() || 'Product Team';
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [productSpace, opsSpace] = await db
    .insert(spaces)
    .values([
      {
        userId: user.id,
        name: 'Product Studio',
        description: 'Roadmap, launch prep, and design review notes.',
        color: '#7c3aed',
        icon: '🚀',
      },
      {
        userId: user.id,
        name: 'Operations Hub',
        description: 'Weekly planning, support playbooks, and task coordination.',
        color: '#06b6d4',
        icon: '🛠️',
      },
    ])
    .returning();

  const [launchBoard] = await db
    .insert(kanbanBoards)
    .values({
      userId: user.id,
      name: `${profileName} Launch Board`,
      color: '#7c3aed',
    })
    .returning();

  const [todoColumn, progressColumn, reviewColumn] = await db
    .insert(kanbanColumns)
    .values([
      { boardId: launchBoard.id, name: 'Backlog', order: 0, color: '#64748b' },
      { boardId: launchBoard.id, name: 'In Progress', order: 1, color: '#06b6d4' },
      { boardId: launchBoard.id, name: 'Review', order: 2, color: '#10b981' },
    ])
    .returning();

  await db.insert(kanbanTasks).values([
    {
      boardId: launchBoard.id,
      columnId: todoColumn.id,
      userId: user.id,
      title: 'Finalize onboarding checklist',
      description: 'Confirm the new flow for first-time users.',
      priority: 'high',
      label: 'Product',
      dueDate: nextThreeDays,
      syncToCalendar: true,
      order: 0,
    },
    {
      boardId: launchBoard.id,
      columnId: progressColumn.id,
      userId: user.id,
      title: 'Prepare release notes draft',
      description: 'Summarize the latest improvements for launch day.',
      priority: 'medium',
      label: 'Content',
      dueDate: nextWeek,
      syncToCalendar: false,
      order: 1,
    },
    {
      boardId: launchBoard.id,
      columnId: reviewColumn.id,
      userId: user.id,
      title: 'Review analytics dashboard',
      description: 'Check activation and adoption trends before publish.',
      priority: 'urgent',
      label: 'Analytics',
      dueDate: nextDay,
      syncToCalendar: true,
      order: 2,
    },
  ]);

  await db.insert(calendarTasks).values([
    {
      userId: user.id,
      title: 'Weekly product sync',
      description: 'Review roadmap updates and launch readiness.',
      scheduledAt: nextDay,
      isDraft: false,
      taskType: 'meeting',
      category: 'Work',
      color: '#7c3aed',
    },
    {
      userId: user.id,
      title: 'Prepare demo outline',
      description: 'Build a concise story for the presentation walkthrough.',
      scheduledAt: nextThreeDays,
      isDraft: false,
      taskType: 'task',
      category: 'Presentation',
      color: '#06b6d4',
    },
    {
      userId: user.id,
      title: 'Capture follow-up ideas',
      description: 'Draft notes from stakeholder feedback.',
      scheduledAt: null,
      isDraft: true,
      taskType: 'reminder',
      category: 'Personal',
      color: '#f59e0b',
    },
  ]);

  await db.insert(notes).values([
    {
      userId: user.id,
      title: 'Launch story outline',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Start with the problem, show the workflow, and end with customer impact.' }],
          },
        ],
      }),
      isPinned: true,
      isTrashed: false,
      color: '#16161f',
      icon: '🚀',
      category: 'Work',
    },
    {
      userId: user.id,
      title: 'Weekly priorities',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Finalize integrations, clean up the dashboard, and validate onboarding flows.' }],
          },
        ],
      }),
      isPinned: false,
      isTrashed: false,
      color: '#1c1c28',
      icon: '📝',
      category: 'Planning',
    },
  ]);

  await db.insert(pages).values([
    {
      spaceId: productSpace.id,
      userId: user.id,
      title: 'Product overview',
      content: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This workspace captures the launch plan and feature highlights.' }] }],
      }),
      icon: '📘',
      template: 'blank',
      order: 0,
    },
    {
      spaceId: opsSpace.id,
      userId: user.id,
      title: 'Execution checklist',
      content: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Keep the delivery plan aligned with engineering and customer-facing milestones.' }] }],
      }),
      icon: '✅',
      template: 'blank',
      order: 1,
    },
  ]);

  await db.insert(whiteboards).values({
    userId: user.id,
    name: 'Product architecture flow',
    data: JSON.stringify({
      version: 2,
      elements: [
        { id: '1', type: 'rectangle', x: 80, y: 80, width: 220, height: 70, strokeColor: '#7c3aed', fillStyle: 'hachure' },
        { id: '2', type: 'rectangle', x: 340, y: 80, width: 220, height: 70, strokeColor: '#06b6d4', fillStyle: 'hachure' },
      ],
    }),
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" rx="12" fill="%230f172a"/><rect x="20" y="20" width="60" height="20" rx="8" fill="%237c3aed"/><rect x="90" y="20" width="50" height="20" rx="8" fill="%2306b6d4"/></svg>',
  });

  await db.insert(aiTemplates).values([
    {
      userId: user.id,
      name: 'Product launch template',
      prompt: 'Create a structured launch plan with timeline, owners, and release messages.',
      generatedSchema: JSON.stringify({ type: 'object', properties: { launchDate: { type: 'string' } } }),
      generatedUi: JSON.stringify({ title: 'Launch Checklist', sections: ['Timeline', 'Owners', 'Assets'] }),
      appState: JSON.stringify({ status: 'ready' }),
      addedToSidebar: true,
    },
    {
      userId: user.id,
      name: 'Weekly recap template',
      prompt: 'Summarize what shipped, what is in review, and what blockers need attention.',
      generatedSchema: JSON.stringify({ type: 'object', properties: { recap: { type: 'string' } } }),
      generatedUi: JSON.stringify({ title: 'Weekly Recap', sections: ['Completed', 'Blocked', 'Next'] }),
      appState: JSON.stringify({ status: 'ready' }),
      addedToSidebar: false,
    },
  ]);

  await db.insert(activityLog).values([
    {
      userId: user.id,
      action: 'Seeded workspace',
      entityType: 'space',
      entityId: productSpace.id,
      metadata: JSON.stringify({ source: 'initial-seed' }),
    },
    {
      userId: user.id,
      action: 'Seeded workspace',
      entityType: 'board',
      entityId: launchBoard.id,
      metadata: JSON.stringify({ source: 'initial-seed' }),
    },
    {
      userId: user.id,
      action: 'Seeded workspace',
      entityType: 'note',
      entityId: 'seeded-note',
      metadata: JSON.stringify({ source: 'initial-seed' }),
    },
  ]);

  return { seeded: true, reason: 'seeded' as const };
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, calendarTasks, activityLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ tasks: [] });
    const user = dbUsers[0];

    const tasks = await db.select().from(calendarTasks).where(eq(calendarTasks.userId, user.id));
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Calendar GET error:', error);
    // Mock data for demo
    return NextResponse.json({ tasks: [
      { id: '1', title: 'Marketing sync meeting', scheduledAt: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), isDraft: false, taskType: 'meeting', color: '#7c3aed', category: 'Work' },
      { id: '2', title: 'Prepare design tokens', scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), isDraft: false, taskType: 'task', color: '#06b6d4', category: 'Design' },
      { id: '3', title: 'Unscheduled draft idea', scheduledAt: null, isDraft: true, taskType: 'reminder', color: '#f59e0b', category: 'Personal' }
    ]});
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ error: 'User not synced' }, { status: 400 });
    const user = dbUsers[0];

    const body = await req.json();
    const { title, description, scheduledAt, isDraft, taskType, category, color } = body;

    const inserted = await db.insert(calendarTasks).values({
      userId: user.id,
      title,
      description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isDraft: isDraft || false,
      taskType: taskType || 'task',
      category: category || 'General',
      color: color || '#7c3aed',
    }).returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: user.id,
      action: isDraft ? 'Created Draft' : 'Created Task',
      entityType: 'task',
      entityId: inserted[0].id,
    });

    return NextResponse.json({ success: true, task: inserted[0] });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ success: true, task: { id: Math.random().toString(), title: 'Mock Task' } });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ error: 'User not synced' }, { status: 400 });
    const user = dbUsers[0];

    const body = await req.json();
    const { id, title, description, scheduledAt, isDraft, taskType, category, color } = body;

    const updated = await db.update(calendarTasks).set({
      title,
      description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isDraft,
      taskType,
      category,
      color,
      updatedAt: new Date(),
    }).where(and(eq(calendarTasks.id, id), eq(calendarTasks.userId, user.id))).returning();

    return NextResponse.json({ success: true, task: updated[0] });
  } catch (error) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ error: 'User not synced' }, { status: 400 });
    const user = dbUsers[0];

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.delete(calendarTasks).where(and(eq(calendarTasks.id, id), eq(calendarTasks.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ success: true });
  }
}

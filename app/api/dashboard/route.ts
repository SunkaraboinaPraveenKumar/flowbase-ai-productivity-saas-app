import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, calendarTasks, kanbanBoards, notes, spaces, activityLog } from '@/db/schema';
import { eq, gte, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve db user
    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) {
      // Mock sync fallback or empty response if not synced yet
      return NextResponse.json({
        calendarCount: 0,
        kanbanCount: 0,
        notesCount: 0,
        spacesCount: 0,
        upcomingTasks: [],
        activities: []
      });
    }
    const dbUser = dbUsers[0];

    // Counts
    const calendarItems = await db.select().from(calendarTasks).where(eq(calendarTasks.userId, dbUser.id));
    const boards = await db.select().from(kanbanBoards).where(eq(kanbanBoards.userId, dbUser.id));
    const notesList = await db.select().from(notes).where(eq(notes.userId, dbUser.id));
    const spacesList = await db.select().from(spaces).where(eq(spaces.userId, dbUser.id));

    // Upcoming tasks (scheduled for now or in future)
    const upcoming = await db
      .select()
      .from(calendarTasks)
      .where(
        and(
          eq(calendarTasks.userId, dbUser.id),
          gte(calendarTasks.scheduledAt, new Date())
        )
      )
      .limit(10);

    // Recent activity log — latest first
    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, dbUser.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(10);

    return NextResponse.json({
      calendarCount: calendarItems.length,
      kanbanCount: boards.length,
      notesCount: notesList.length,
      spacesCount: spacesList.length,
      upcomingTasks: upcoming,
      activities: activities
    });
  } catch (error) {
    console.error('Dashboard telemetry fetch error:', error);
    return NextResponse.json({
      calendarCount: 0,
      kanbanCount: 0,
      notesCount: 0,
      spacesCount: 0,
      upcomingTasks: [],
      activities: []
    });
  }
}

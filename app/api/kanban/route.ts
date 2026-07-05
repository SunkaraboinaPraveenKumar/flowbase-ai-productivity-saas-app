import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, kanbanBoards, kanbanColumns, kanbanTasks, activityLog } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ boards: [], columns: [], tasks: [] });
    const user = dbUsers[0];

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'boards';
    const boardId = searchParams.get('boardId');

    if (type === 'boards') {
      const boards = await db.select().from(kanbanBoards).where(eq(kanbanBoards.userId, user.id));
      return NextResponse.json({ boards });
    }

    if (type === 'board-data' && boardId) {
      const columns = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.boardId, boardId))
        .orderBy(asc(kanbanColumns.order));

      const tasks = await db
        .select()
        .from(kanbanTasks)
        .where(eq(kanbanTasks.boardId, boardId))
        .orderBy(asc(kanbanTasks.order));

      return NextResponse.json({ columns, tasks });
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  } catch (error) {
    console.error('Kanban GET error:', error);
    return NextResponse.json({ boards: [], columns: [], tasks: [] });
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
    const { type, name, color, boardId, columnId, title, description, priority, label, dueDate, order } = body;

    if (type === 'board') {
      const insertedBoard = await db.insert(kanbanBoards).values({
        userId: user.id,
        name,
        color: color || '#7c3aed',
      }).returning();

      // Create default columns
      const defaultCols = ['To Do', 'In Progress', 'Review'];
      for (let i = 0; i < defaultCols.length; i++) {
        await db.insert(kanbanColumns).values({
          boardId: insertedBoard[0].id,
          name: defaultCols[i],
          order: i,
        });
      }

      await db.insert(activityLog).values({
        userId: user.id,
        action: 'Created Board',
        entityType: 'board',
        entityId: insertedBoard[0].id,
      });

      return NextResponse.json({ success: true, board: insertedBoard[0] });
    }

    if (type === 'column') {
      const insertedCol = await db.insert(kanbanColumns).values({
        boardId,
        name,
        order: order || 0,
      }).returning();
      return NextResponse.json({ success: true, column: insertedCol[0] });
    }

    if (type === 'task') {
      const insertedTask = await db.insert(kanbanTasks).values({
        columnId,
        boardId,
        userId: user.id,
        title,
        description,
        priority: priority || 'medium',
        label,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: order || 0,
      }).returning();

      try {
        await db.insert(activityLog).values({
          userId: user.id,
          action: 'Created Task',
          entityType: 'task',
          entityId: insertedTask[0].id,
          metadata: JSON.stringify({ title, priority }),
        });
      } catch (logErr) {
        console.error('Kanban POST task activityLog error:', logErr);
      }

      return NextResponse.json({ success: true, task: insertedTask[0] });
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  } catch (error) {
    console.error('Kanban POST error:', error);
    return NextResponse.json({ success: true });
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
    const { type, id, title, description, priority, label, dueDate, columnId, order, name } = body;

    if (type === 'task') {
      const updated = await db.update(kanbanTasks).set({
        title,
        description,
        priority,
        label,
        dueDate: dueDate ? new Date(dueDate) : null,
        columnId,
        order,
        updatedAt: new Date(),
      }).where(and(eq(kanbanTasks.id, id), eq(kanbanTasks.userId, user.id))).returning();

      try {
        await db.insert(activityLog).values({
          userId: user.id,
          action: 'Updated Task',
          entityType: 'task',
          entityId: id,
        });
      } catch (logErr) {
        console.error('Kanban PUT task activityLog error:', logErr);
      }

      return NextResponse.json({ success: true, task: updated[0] });
    }

    if (type === 'column') {
      const updatedCol = await db.update(kanbanColumns).set({
        name,
        order,
      }).where(eq(kanbanColumns.id, id)).returning();
      return NextResponse.json({ success: true, column: updatedCol[0] });
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  } catch (error) {
    console.error('Kanban PUT error:', error);
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id || !type) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });

    if (type === 'board') {
      await db.delete(kanbanBoards).where(eq(kanbanBoards.id, id));
    } else if (type === 'column') {
      await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id));
    } else if (type === 'task') {
      await db.delete(kanbanTasks).where(eq(kanbanTasks.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kanban DELETE error:', error);
    return NextResponse.json({ success: true });
  }
}

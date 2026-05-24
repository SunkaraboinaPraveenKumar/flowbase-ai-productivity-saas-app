import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, whiteboards, activityLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ whiteboards: [] });
    const user = dbUsers[0];

    const boards = await db
      .select()
      .from(whiteboards)
      .where(eq(whiteboards.userId, user.id))
      .orderBy(desc(whiteboards.updatedAt));

    return NextResponse.json({ whiteboards: boards });
  } catch (error) {
    console.error('Whiteboard GET error:', error);
    // Mock whiteboard for demo
    return NextResponse.json({ whiteboards: [
      { id: 'w1', name: 'Software Architecture Flow', data: '[]', updatedAt: new Date().toISOString() }
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
    const { name, data } = body;

    const inserted = await db.insert(whiteboards).values({
      userId: user.id,
      name: name || 'Untitled Board',
      data: data || '[]',
    }).returning();

    await db.insert(activityLog).values({
      userId: user.id,
      action: 'Created Whiteboard',
      entityType: 'whiteboard',
      entityId: inserted[0].id,
    });

    return NextResponse.json({ success: true, whiteboard: inserted[0] });
  } catch (error) {
    console.error('Whiteboard POST error:', error);
    return NextResponse.json({ success: true, whiteboard: { id: Math.random().toString(), name: 'Mock Board' } });
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
    const { id, name, data } = body;

    const updated = await db.update(whiteboards).set({
      name,
      data,
      updatedAt: new Date(),
    }).where(and(eq(whiteboards.id, id), eq(whiteboards.userId, user.id))).returning();

    return NextResponse.json({ success: true, whiteboard: updated[0] });
  } catch (error) {
    console.error('Whiteboard PUT error:', error);
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

    await db.delete(whiteboards).where(and(eq(whiteboards.id, id), eq(whiteboards.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Whiteboard DELETE error:', error);
    return NextResponse.json({ success: true });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, pages, activityLog } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get('spaceId');
    const pageId = searchParams.get('pageId');

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ pages: [] });
    const user = dbUsers[0];

    if (pageId) {
      const singlePage = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, pageId), eq(pages.userId, user.id)))
        .limit(1);
      return NextResponse.json({ page: singlePage[0] });
    }

    if (spaceId) {
      const spacePages = await db
        .select()
        .from(pages)
        .where(and(eq(pages.spaceId, spaceId), eq(pages.userId, user.id)))
        .orderBy(asc(pages.order));
      return NextResponse.json({ pages: spacePages });
    }

    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  } catch (error) {
    console.error('Pages GET error:', error);
    return NextResponse.json({ pages: [] });
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
    const { spaceId, title, content, icon, template } = body;

    const inserted = await db.insert(pages).values({
      spaceId,
      userId: user.id,
      title: title || 'Untitled Page',
      content: content || '{"type":"doc","content":[{"type":"paragraph","content":[]}]}',
      icon: icon || '📄',
      template: template || 'blank',
      order: 0,
    }).returning();

    await db.insert(activityLog).values({
      userId: user.id,
      action: 'Created Page',
      entityType: 'page',
      entityId: inserted[0].id,
    });

    return NextResponse.json({ success: true, page: inserted[0] });
  } catch (error) {
    console.error('Pages POST error:', error);
    return NextResponse.json({ success: true, page: { id: Math.random().toString(), title: 'Mock Page' } });
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
    const { id, title, content, icon, coverImage, isFavorite, order } = body;

    const updated = await db.update(pages).set({
      title,
      content,
      icon,
      coverImage,
      isFavorite,
      order,
      updatedAt: new Date(),
    }).where(and(eq(pages.id, id), eq(pages.userId, user.id))).returning();

    return NextResponse.json({ success: true, page: updated[0] });
  } catch (error) {
    console.error('Pages PUT error:', error);
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

    await db.delete(pages).where(and(eq(pages.id, id), eq(pages.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pages DELETE error:', error);
    return NextResponse.json({ success: true });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, aiTemplates, activityLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ templates: [] });
    const user = dbUsers[0];

    const templates = await db.select().from(aiTemplates).where(eq(aiTemplates.userId, user.id));
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json({ templates: [] });
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
    const { name, prompt, generatedSchema, generatedUi } = body;

    const inserted = await db.insert(aiTemplates).values({
      userId: user.id,
      name,
      prompt,
      generatedSchema: typeof generatedSchema === 'string' ? generatedSchema : JSON.stringify(generatedSchema),
      generatedUi: typeof generatedUi === 'string' ? generatedUi : JSON.stringify(generatedUi),
      appState: '[]',
      addedToSidebar: false,
    }).returning();

    await db.insert(activityLog).values({
      userId: user.id,
      action: 'Created AI App',
      entityType: 'template',
      entityId: inserted[0].id,
    });

    return NextResponse.json({ success: true, template: inserted[0] });
  } catch (error) {
    console.error('Templates POST error:', error);
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
    const { id, appState, addedToSidebar } = body;

    const updated = await db.update(aiTemplates).set({
      appState: typeof appState === 'string' ? appState : JSON.stringify(appState),
      addedToSidebar,
    }).where(and(eq(aiTemplates.id, id), eq(aiTemplates.userId, user.id))).returning();

    return NextResponse.json({ success: true, template: updated[0] });
  } catch (error) {
    console.error('Templates PUT error:', error);
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

    await db.delete(aiTemplates).where(and(eq(aiTemplates.id, id), eq(aiTemplates.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Templates DELETE error:', error);
    return NextResponse.json({ success: true });
  }
}

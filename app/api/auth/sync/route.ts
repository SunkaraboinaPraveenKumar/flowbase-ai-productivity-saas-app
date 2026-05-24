import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0].emailAddress;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const avatar = user.imageUrl;

    // Upsert user into database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          clerkId: user.id,
          name,
          avatar,
        })
        .where(eq(users.email, email));
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId: user.id,
        email,
        name,
        avatar,
        plan: 'free',
      });
    }

    return NextResponse.json(
      { success: true, email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

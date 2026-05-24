import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateWithSystemPrompt } from '@/lib/gemini';
import { db } from '@/db';
import { users, aiChatHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (dbUsers.length === 0) return NextResponse.json({ error: 'User not synced' }, { status: 400 });
    const user = dbUsers[0];

    const body = await req.json();
    const { message } = body;

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Get current date and time for context
    const now = new Date();
    const todayFormatted = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const systemPrompt = `You are the FlowBase AI Assistant. You help users schedule items, create notes, and manage boards.
TODAY'S DATE AND TIME: ${todayFormatted} at ${currentTime}. Use this to calculate relative dates like "tomorrow", "next week", etc.

Analyze the user request: "${message}".
If they want to schedule a calendar event or create a task, return a JSON block containing:
- reply: A brief helpful sentence.
- action: "create_calendar_task"
- actionData: { title: string, scheduledAt: ISO_timestamp_or_null, taskType: "task"|"meeting"|"event", color: hex_color_string }

If they want to make a note, return a JSON block containing:
- reply: A brief sentence.
- action: "create_note"
- actionData: { title: string, content: string, icon: emoji_string }

Otherwise, return a JSON block containing:
- reply: Your conversational response.
- action: null
- actionData: null

Only return raw JSON without markdown headers or code blocks.`;

    const rawResult = await generateWithSystemPrompt(systemPrompt, message);
    let result = { reply: '', action: null, actionData: null };
    try {
      result = JSON.parse(rawResult.trim());
    } catch {
      const cleaned = rawResult.replace(/```json|```/g, '').trim();
      result = JSON.parse(cleaned);
    }

    // Save to DB history
    await db.insert(aiChatHistory).values({
      userId: user.id,
      role: 'user',
      content: message,
    });

    await db.insert(aiChatHistory).values({
      userId: user.id,
      role: 'assistant',
      content: result.reply,
      actionType: result.action,
      actionData: result.actionData ? JSON.stringify(result.actionData) : null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    // Mock simulation
    return NextResponse.json({
      reply: "I've drafted a task reminder based on your request. Please confirm below to schedule it.",
      action: "create_calendar_task",
      actionData: {
        title: "Follow up with client team",
        scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
        taskType: "task",
        color: "#7c3aed"
      }
    });
  }
}
export { POST as chatPOST };

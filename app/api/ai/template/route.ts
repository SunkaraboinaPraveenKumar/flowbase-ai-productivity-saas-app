import { NextResponse } from 'next/server';
import { generateWithSystemPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const systemPrompt = `You are a professional mini-app builder. Based on the user prompt: "${prompt}", generate a complete interactive JSON schema for a mini-app.
Your output must be a single raw JSON object containing these keys:
- name: string
- description: string
- schema: { fields: Array<{ id: string, label: string, type: "text" | "boolean" | "date" }> }
- ui: { components: Array<{ type: "input" | "button" | "list", fieldId?: string, label?: string, action?: string, title?: string, fieldIds?: string[] }> }

Do not return markdown headers or code block formatting. Only return the JSON.`;

    const rawResult = await generateWithSystemPrompt(systemPrompt, prompt);
    let appSchema = {};
    try {
      appSchema = JSON.parse(rawResult.trim());
    } catch {
      const cleaned = rawResult.replace(/```json|```/g, '').trim();
      appSchema = JSON.parse(cleaned);
    }

    return NextResponse.json(appSchema);
  } catch (error) {
    console.error('Template builder AI error:', error);
    // Dynamic mock fallback based on keywords or default to Habit Tracker
    return NextResponse.json({
      name: "Habit Tracker",
      description: "Track your habits and log progress.",
      schema: {
        fields: [
          { id: "habit", label: "Habit Name", type: "text" },
          { id: "completed", label: "Completed Today", type: "boolean" },
          { id: "date", label: "Log Date", type: "date" }
        ]
      },
      ui: {
        components: [
          { type: "input", fieldId: "habit", placeholder: "Enter habit (e.g. Read 10 pages)" },
          { type: "button", label: "Log Streak Item", action: "addRecord" },
          { type: "list", title: "Daily Streak Logs", fieldIds: ["habit", "completed", "date"] }
        ]
      }
    });
  }
}

import { NextResponse } from 'next/server';
import { generateWithSystemPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, action } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const systemPrompt = `You are a professional text refining assistant. Your task is to edit, format, or transform the user's provided text based on the requested instruction: ${action}.
Instructions definitions:
- grammar: Correct all spelling, grammar, and syntax errors, keeping the text concise.
- shorter: Condense the text substantially, keeping only key ideas.
- longer: Expand with more detailed structure and examples, maintaining context.
- simplify: Explain in plain english, keeping terms accessible.
- professional: Rephrase using standard corporate, business-friendly terminology.

Return ONLY the rewritten, refined text. Do not add intro greetings, citations, quotes, or conversational explanations.`;

    const refined = await generateWithSystemPrompt(systemPrompt, text);

    return NextResponse.json({ refined: refined.trim() });
  } catch (error) {
    console.error('Text refine API error:', error);
    // Mock simulation
    return NextResponse.json({ 
      refined: "[Simulated Refinement] The workspace outline was updated for technical clarity and polished grammar."
    });
  }
}

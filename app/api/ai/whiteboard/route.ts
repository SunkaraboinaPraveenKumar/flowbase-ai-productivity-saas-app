import { NextResponse } from 'next/server';
import { generateWithSystemPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const systemPrompt = `You are a professional diagram assistant that creates vector flows. Generate an array of Excalidraw-compatible JSON elements representing the user description: ${prompt}.
Support types: rectangle, text, arrow.
Output format must be a raw JSON array of elements without markdown headers or code block tags.
Each element must contain coordinate fields (x, y, width, height, type). Set roughness to 1, strokeWidth to 2, and use distinct stroke colors like #7c3aed or #06b6d4.`;

    const rawResult = await generateWithSystemPrompt(systemPrompt, prompt);
    let elements = [];
    try {
      elements = JSON.parse(rawResult.trim());
    } catch {
      // Regex parsing fallback if output has code blocks
      const cleaned = rawResult.replace(/```json|```/g, '').trim();
      elements = JSON.parse(cleaned);
    }

    return NextResponse.json({ elements });
  } catch (error) {
    console.error('Whiteboard diagram generator error:', error);
    // Mock simulation fallback
    return NextResponse.json({
      elements: [
        { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 140, height: 60, strokeColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-2', type: 'text', x: 135, y: 120, text: 'User Request', fontSize: 16, strokeColor: '#f0f0f5' },
        { id: 'el-3', type: 'arrow', x: 240, y: 130, width: 100, height: 10, points: [[0,0], [100, 0]], strokeColor: '#06b6d4', strokeWidth: 2 },
        { id: 'el-4', type: 'rectangle', x: 340, y: 100, width: 140, height: 60, strokeColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-5', type: 'text', x: 375, y: 120, text: 'AI Response', fontSize: 16, strokeColor: '#f0f0f5' }
      ]
    });
  }
}

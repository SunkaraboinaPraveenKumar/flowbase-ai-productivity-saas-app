import { NextResponse } from 'next/server';
import { generateWithSystemPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const systemPrompt = `You are a professional diagram assistant that creates vector flows. Generate an array of Excalidraw-compatible JSON elements representing: ${prompt}.
Support types: rectangle, text, arrow.
Output format must be a raw JSON array of elements without markdown headers or code block tags.
Each element must contain coordinate fields (x, y, width, height, type). Set roughness to 1, strokeWidth to 2.
IMPORTANT: Use DARK colors for visibility on white canvas: #1e3a8a (dark blue), #15803d (dark green), #7c2d12 (dark red/brown), #1e40af (navy), #064e3b (dark teal).
For text, use dark colors like #1a1a2e or #0f172a for contrast.
Alternate between 2-3 dark colors for visual distinction.`;

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
    // Mock simulation fallback with dark colors for white background
    return NextResponse.json({
      elements: [
        { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 140, height: 60, strokeColor: '#1e3a8a', backgroundColor: 'rgba(30, 58, 138, 0.08)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-2', type: 'text', x: 125, y: 120, text: 'User Request', fontSize: 16, strokeColor: '#1a1a2e' },
        { id: 'el-3', type: 'arrow', x: 240, y: 130, width: 100, height: 10, points: [[0,0], [100, 0]], strokeColor: '#15803d', strokeWidth: 2 },
        { id: 'el-4', type: 'rectangle', x: 340, y: 100, width: 140, height: 60, strokeColor: '#15803d', backgroundColor: 'rgba(21, 128, 61, 0.08)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-5', type: 'text', x: 365, y: 120, text: 'AI Response', fontSize: 16, strokeColor: '#1a1a2e' }
      ]
    });
  }
}

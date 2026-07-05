import { NextResponse } from 'next/server';
import { generateWithSystemPrompt } from '@/lib/gemini';

const normalizeGeneratedElements = (elements: any[]) => {
  return (Array.isArray(elements) ? elements : []).map((el: any, index: number) => {
    const safeId = el?.id || `el-${Date.now()}-${index}`;
    const type = el?.type === 'text' ? 'text' : el?.type === 'arrow' ? 'arrow' : 'rectangle';

    if (type === 'text') {
      return {
        id: safeId,
        type,
        x: Number(el?.x) || 0,
        y: Number(el?.y) || 0,
        width: Number(el?.width) || 140,
        height: Number(el?.height) || 30,
        strokeColor: el?.strokeColor || '#111827',
        backgroundColor: 'transparent',
        fillStyle: el?.fillStyle || 'solid',
        strokeWidth: Number(el?.strokeWidth) || 1,
        roughness: Number(el?.roughness) || 1,
        opacity: Number(el?.opacity) || 100,
        text: el?.text || 'Text',
        fontSize: Number(el?.fontSize) || 18,
        fontFamily: Number(el?.fontFamily) || 1,
        textAlign: el?.textAlign || 'left',
        verticalAlign: el?.verticalAlign || 'top',
      };
    }

    if (type === 'arrow') {
      return {
        id: safeId,
        type,
        x: Number(el?.x) || 0,
        y: Number(el?.y) || 0,
        width: Number(el?.width) || 140,
        height: Number(el?.height) || 20,
        points: Array.isArray(el?.points) && el.points.length >= 2 ? el.points : [[0, 0], [100, 0]],
        strokeColor: el?.strokeColor || '#374151',
        strokeWidth: Number(el?.strokeWidth) || 2,
        fillStyle: el?.fillStyle || 'solid',
        roughness: Number(el?.roughness) || 1,
        opacity: Number(el?.opacity) || 100,
      };
    }

    return {
      id: safeId,
      type,
      x: Number(el?.x) || 0,
      y: Number(el?.y) || 0,
      width: Number(el?.width) || 140,
      height: Number(el?.height) || 70,
      strokeColor: el?.strokeColor || '#1e3a8a',
      backgroundColor: el?.backgroundColor || 'rgba(30, 58, 138, 0.12)',
      fillStyle: el?.fillStyle || 'solid',
      strokeWidth: Number(el?.strokeWidth) || 2,
      roughness: Number(el?.roughness) || 1,
      opacity: Number(el?.opacity) || 100,
      angle: Number(el?.angle) || 0,
    };
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const systemPrompt = `You are a professional diagram assistant. Generate a JSON array of Excalidraw-compatible elements for: ${prompt}.

Supported types: rectangle, text, arrow.
Output ONLY a raw JSON array. No markdown, no code fences, no explanation text — just the array.

Required fields per element: id (unique string), type, x (number), y (number), width (number), height (number).
Optional but recommended: strokeColor, backgroundColor, fillStyle, strokeWidth, roughness, opacity.
Arrow elements MUST include: points (array of [x,y] pairs, minimum 2 points, e.g. [[0,0],[100,0]]).
Text elements MUST include: text (string), fontSize (number, e.g. 16).

CRITICAL COLOR RULES — the canvas background is WHITE, so you MUST use dark colors:
- Shapes strokeColor: use #1e3a8a (dark blue), #15803d (dark green), #7c2d12 (dark red), #1e40af (navy), #6d28d9 (purple)
- Shapes backgroundColor: use rgba versions like rgba(30,58,138,0.12) or rgba(21,128,61,0.12)
- Text strokeColor: ALWAYS use #111827 or #1e293b (very dark, near-black) for text labels
- Arrow strokeColor: use #374151 (dark gray) or match nearby shape color
- NEVER use white, light gray, or any color starting with #f or #e for strokeColor`;


    const rawResult = await generateWithSystemPrompt(systemPrompt, prompt);
    let elements = [];
    try {
      elements = JSON.parse(rawResult.trim());
    } catch {
      const cleaned = rawResult.replace(/```json|```/g, '').trim();
      elements = JSON.parse(cleaned);
    }

    return NextResponse.json({ elements: normalizeGeneratedElements(elements) });
  } catch (error) {
    console.error('Whiteboard diagram generator error:', error);
    // Mock simulation fallback with dark colors for white background
    return NextResponse.json({
      elements: normalizeGeneratedElements([
        { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 140, height: 60, strokeColor: '#1e3a8a', backgroundColor: 'rgba(30, 58, 138, 0.08)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-2', type: 'text', x: 125, y: 120, text: 'User Request', fontSize: 16, strokeColor: '#111827' },
        { id: 'el-3', type: 'arrow', x: 240, y: 130, width: 100, height: 10, points: [[0,0], [100, 0]], strokeColor: '#15803d', strokeWidth: 2 },
        { id: 'el-4', type: 'rectangle', x: 340, y: 100, width: 140, height: 60, strokeColor: '#15803d', backgroundColor: 'rgba(21, 128, 61, 0.08)', fillStyle: 'solid', roughness: 1, strokeWidth: 2 },
        { id: 'el-5', type: 'text', x: 365, y: 120, text: 'AI Response', fontSize: 16, strokeColor: '#111827' }
      ])
    });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ mock: true }, { status: 200 });
    }

    // AssemblyAI v3 streaming token endpoint — GET request with query param
    const response = await fetch(
      'https://streaming.assemblyai.com/v3/token?expires_in_seconds=300',
      {
        method: 'GET',
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI token error:', response.status, errorText);
      return NextResponse.json({ mock: true });
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token, mock: false });
  } catch (error: any) {
    console.error('AssemblyAI token fetch error:', error.message || error);
    return NextResponse.json({ mock: true });
  }
}

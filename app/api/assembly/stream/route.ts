import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      // Return a flag indicating that simulation mode should run
      return NextResponse.json({ mock: true }, { status: 200 });
    }

    // Call AssemblyAI token endpoint
    const response = await axios.post(
      'https://api.assemblyai.com/v2/realtime/token',
      { expires_in: 3600 },
      { headers: { Authorization: apiKey } }
    );

    return NextResponse.json({ token: response.data.token, mock: false });
  } catch (error: any) {
    console.error('AssemblyAI token fetch error:', error.message || error);
    // Fall back to mock
    return NextResponse.json({ mock: true });
  }
}

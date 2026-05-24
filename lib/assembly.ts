import { AssemblyAI } from 'assemblyai';

const getClient = () => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY is not set');
  }
  return new AssemblyAI({ apiKey });
};

export const getAssemblyAIClient = () => getClient();

export const transcribeAudio = async (audioUrl: string) => {
  const client = getClient();
  const transcript = await client.transcripts.transcribe({
    audio_url: audioUrl,
  });
  return transcript;
};

export default {
  getAssemblyAIClient,
  transcribeAudio,
};

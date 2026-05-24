import { GoogleGenerativeAI } from '@google/generative-ai';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = () => {
  return getClient().getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  });
};

export const generateContent = async (prompt: string) => {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateWithSystemPrompt = async (
  systemPrompt: string,
  userPrompt: string
) => {
  const model = getGeminiModel();
  const result = await model.generateContent([systemPrompt, userPrompt]);
  return result.response.text();
};

export default {
  getGeminiModel,
  generateContent,
  generateWithSystemPrompt,
};

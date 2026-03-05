import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

const genai = new GoogleGenerativeAI(config.geminiApiKey);

export async function embedText(text: string): Promise<number[]> {
  const model = genai.getGenerativeModel({ model: config.rag.embeddingModel });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(embedText));
}

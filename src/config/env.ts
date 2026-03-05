import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  botToken: requireEnv('BOT_TOKEN'),
  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    database: process.env.POSTGRES_DB ?? 'bot_rag',
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  },
  rag: {
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-004',
    generationModel: process.env.GENERATION_MODEL ?? 'gemini-2.0-flash',
    topK: parseInt(process.env.TOP_K_RESULTS ?? '3', 10),
    maxHistory: parseInt(process.env.MAX_HISTORY_MESSAGES ?? '10', 10),
  },
} as const;

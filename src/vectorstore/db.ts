import { Pool, PoolClient } from 'pg';
import { config } from '../config/env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(config.postgres);
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  const client: PoolClient = await getPool().connect();
  try {
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Documents table: stores text chunks and their embeddings
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id        SERIAL PRIMARY KEY,
        content   TEXT NOT NULL,
        metadata  JSONB DEFAULT '{}',
        embedding vector(768),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Index for fast cosine similarity search
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx
      ON documents USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    // Chat history table: stores conversation per session (chat_id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id       SERIAL PRIMARY KEY,
        chat_id  BIGINT NOT NULL,
        role     TEXT NOT NULL CHECK (role IN ('user', 'model')),
        content  TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(
      'CREATE INDEX IF NOT EXISTS chat_history_chat_id_idx ON chat_history (chat_id, created_at DESC)'
    );

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

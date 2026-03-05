import { getPool } from '../vectorstore/db';
import { embedText } from './embeddings';
import { config } from '../config/env';

export interface RetrievedChunk {
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function retrieveRelevantChunks(query: string): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query);
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const result = await getPool().query<{
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
  }>(
    `
    SELECT
      content,
      metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [embeddingStr, config.rag.topK]
  );

  return result.rows;
}

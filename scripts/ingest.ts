/**
 * Ingest script: reads markdown files from docs/corpus/ and stores
 * their content with embeddings in the pgvector database.
 *
 * Usage:
 *   npm run ingest
 */
import 'dotenv/config';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { initDatabase, getPool } from '../src/vectorstore/db';
import { embedText } from '../src/agent/embeddings';

const CORPUS_DIR = join(__dirname, '..', 'docs', 'corpus');
const CHUNK_SIZE = 500; // characters per chunk

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    const chunk = text.slice(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 50) chunks.push(chunk);
  }
  return chunks;
}

async function ingestFile(filePath: string, fileName: string): Promise<number> {
  const content = await readFile(filePath, 'utf-8');
  const chunks = chunkText(content);

  let count = 0;
  for (const chunk of chunks) {
    const embedding = await embedText(chunk);
    const embeddingStr = `[${embedding.join(',')}]`;

    await getPool().query(
      `INSERT INTO documents (content, metadata, embedding)
       VALUES ($1, $2, $3::vector)`,
      [chunk, JSON.stringify({ source: fileName }), embeddingStr]
    );
    count++;
  }
  return count;
}

async function main(): Promise<void> {
  await initDatabase();
  console.log(`Reading corpus from: ${CORPUS_DIR}`);

  const files = (await readdir(CORPUS_DIR)).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
  if (files.length === 0) {
    console.log('No files found in corpus/. Add .md or .txt files and run again.');
    process.exit(0);
  }

  for (const file of files) {
    const filePath = join(CORPUS_DIR, file);
    console.log(`Ingesting: ${file}`);
    const count = await ingestFile(filePath, file);
    console.log(`  -> ${count} chunks embedded`);
  }

  console.log('Ingest complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Ingest error:', err);
  process.exit(1);
});

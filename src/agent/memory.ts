import { getPool } from '../vectorstore/db';
import { config } from '../config/env';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function saveMessage(chatId: number, role: 'user' | 'model', content: string): Promise<void> {
  await getPool().query(
    'INSERT INTO chat_history (chat_id, role, content) VALUES ($1, $2, $3)',
    [chatId, role, content]
  );
}

export async function getHistory(chatId: number): Promise<ChatMessage[]> {
  const result = await getPool().query<ChatMessage & { created_at: Date }>(
    `SELECT role, content
     FROM chat_history
     WHERE chat_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [chatId, config.rag.maxHistory]
  );
  // Return in chronological order (oldest first)
  return result.rows.reverse();
}

export async function clearHistory(chatId: number): Promise<void> {
  await getPool().query('DELETE FROM chat_history WHERE chat_id = $1', [chatId]);
}

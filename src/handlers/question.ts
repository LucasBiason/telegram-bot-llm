import { Context } from 'grammy';
import { runRagChain } from '../agent/chain';
import { clearHistory } from '../agent/memory';

export async function questionHandler(ctx: Context): Promise<void> {
  const text = ctx.message?.text;
  const chatId = ctx.chat?.id;

  if (!text || !chatId) return;
  if (text.startsWith('/')) return;

  // Show typing indicator while processing
  await ctx.replyWithChatAction('typing');

  try {
    const answer = await runRagChain(chatId, text);
    await ctx.reply(answer, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('RAG chain error:', err);
    await ctx.reply('Sorry, I encountered an error while processing your question. Please try again.');
  }
}

export async function clearCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;
  await clearHistory(chatId);
  await ctx.reply('Conversation history cleared.');
}

import { Bot } from 'grammy';
import { config } from './config/env';
import { initDatabase } from './vectorstore/db';
import { loggerMiddleware } from './middleware/logger';
import { questionHandler, clearCommand } from './handlers/question';

const bot = new Bot(config.botToken);

bot.use(loggerMiddleware);

bot.command('start', (ctx) =>
  ctx.reply(
    'Hello! I am an AI assistant powered by Gemini.\n\n' +
    'Ask me any question and I will answer based on my knowledge base.\n\n' +
    'Commands:\n/clear - Clear conversation history'
  )
);

bot.command('clear', clearCommand);
bot.on('message:text', questionHandler);

bot.catch((err) => {
  console.error(`Update ${err.ctx.update.update_id} error:`, err.error);
});

async function main(): Promise<void> {
  await initDatabase();
  console.log('Starting bot in long-polling mode...');
  await bot.start({
    onStart: (info) => console.log(`Bot @${info.username} is running`),
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

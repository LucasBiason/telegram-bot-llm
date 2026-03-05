import { Context, NextFunction } from 'grammy';

export async function loggerMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const start = Date.now();
  const user = ctx.from?.username ?? ctx.from?.id ?? 'unknown';
  const text = ctx.message?.text ?? '[no text]';
  console.log(`[IN]  user=${user} text="${text.slice(0, 80)}"`);
  await next();
  console.log(`[OUT] user=${user} ${Date.now() - start}ms`);
}

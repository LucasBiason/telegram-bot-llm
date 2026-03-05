import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { config } from '../config/env';
import { retrieveRelevantChunks } from './retriever';
import { getHistory, saveMessage } from './memory';

const genai = new GoogleGenerativeAI(config.geminiApiKey);

const SYSTEM_INSTRUCTION = `You are a helpful assistant. Answer questions based on the provided context.
If the context does not contain enough information to answer the question, say so clearly.
Be concise and accurate. Do not make up information.`;

export async function runRagChain(chatId: number, userMessage: string): Promise<string> {
  // 1. Retrieve relevant document chunks
  const chunks = await retrieveRelevantChunks(userMessage);
  const contextText = chunks.length > 0
    ? chunks.map((c, i) => `[Source ${i + 1}]\n${c.content}`).join('\n\n')
    : 'No relevant context found in the knowledge base.';

  // 2. Load conversation history
  const history = await getHistory(chatId);

  // 3. Build Gemini chat history format
  const geminiHistory: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  // 4. Build the augmented prompt with context
  const augmentedPrompt = `Context from knowledge base:\n${contextText}\n\nUser question: ${userMessage}`;

  // 5. Start chat session with history and system instruction
  const model = genai.getGenerativeModel({
    model: config.rag.generationModel,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history: geminiHistory });

  // 6. Generate response
  const result = await chat.sendMessage(augmentedPrompt);
  const response = result.response.text();

  // 7. Persist both messages to history
  await saveMessage(chatId, 'user', userMessage);
  await saveMessage(chatId, 'model', response);

  return response;
}

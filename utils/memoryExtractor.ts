import type { Memory, MemoryResponse } from './memoryStore';
import { createMemoryStore } from './memoryStore';

export const extractMemories = async (chat_history: string): Promise<MemoryResponse> => {
  if (!chat_history?.trim()) {
    return { reasoning: 'No chat history available', memories: null };
  }

  try {
    console.log('Processing chat history for memory extraction:\n', chat_history);

    // Get existing memories before making the API call
    const memoryStore = createMemoryStore();
    const existingMemories = memoryStore.getAllMemoriesText();

    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatHistory: chat_history,
        existingMemories: existingMemories
      }),
    });

    const memoryResponse = await response.json() as MemoryResponse;

    // Only add memories if they exist and are valid
    if (memoryResponse.memories?.length) {
      const memoryStore = createMemoryStore();
      await memoryStore.addMemories(memoryResponse.memories);
    }

    return memoryResponse;
  } catch (error) {
    console.error('Error extracting memories:', error);
    return { reasoning: 'Error during memory extraction', memories: null };
  }
};

export const formatMemoriesForPrompt = (memories: Memory[]) => {
  return memories
    .map(m => m.content)
    .join('\n');
};
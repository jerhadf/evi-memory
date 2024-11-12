import type { Memory, MemoryResponse } from './memoryStore';
import { createMemoryStore } from './memoryStore';

export const extractMemories = async (chat_history: string) => {
  try {
    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatHistory: chat_history }),
    });

    const memoryResponse = await response.json() as MemoryResponse;

    // Only add memories if they exist
    if (memoryResponse.memories) {
      const memoryStore = createMemoryStore();
      memoryStore.addMemories(memoryResponse.memories);
    }

    return memoryResponse;
  } catch (error) {
    console.error('Error extracting memories:', error);
    return { reasoning: '', memories: null };
  }
};

export const formatMemoriesForPrompt = (memories: Memory[]) => {
  return memories
    .map(m => m.content)
    .join('\n');
};
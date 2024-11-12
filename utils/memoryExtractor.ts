import type { Memory } from './memoryStore';
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

    const { memories } = await response.json();

    // Save to memory store
    const memoryStore = createMemoryStore();
    memories.forEach((memory: Memory) => {
      memoryStore.addMemory(memory.content);
    });

    return memories;
  } catch (error) {
    console.error('Error extracting memories:', error);
    return [];
  }
};

export const formatMemoriesForPrompt = (memories: Memory[]) => {
  return memories
    .map(m => m.content)
    .join('\n');
};
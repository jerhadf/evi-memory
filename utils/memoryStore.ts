export interface Memory {
  timestamp: string;
  content: string;
}

export interface MemoryResponse {
  reasoning: string;
  memories: string[] | null;
}

interface MemoryStore {
  memories: Memory[];
  addMemories: (newMemories: string[]) => void;
  getMemories: () => Memory[];
  getAllMemoriesText: () => string;
  clearMemories: () => void;
}

// Initialize with the contents of memories.json
const initialMemories = require('../data/memories.json');
let instance: MemoryStore | null = null;

export const createMemoryStore = () => {
  if (!instance) {
    instance = {
      memories: initialMemories,
      addMemories: (newMemories: string[]) => {
        const timestamp = new Date().toISOString()
          .replace(/[-:]/g, '')
          .replace('T', '_')
          .split('.')[0];

        const newMemoryObjects = newMemories.map(content => ({
          timestamp,
          content
        }));

        instance!.memories = [...instance!.memories, ...newMemoryObjects];
      },
      getMemories: () => instance!.memories,
      getAllMemoriesText: () => instance!.memories
        .map(m => `- ${m.content}`)
        .join('\n'),
      clearMemories: () => {
        instance!.memories = [];
      }
    };
  }

  return instance;
};
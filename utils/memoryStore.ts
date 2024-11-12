export interface Memory {
  content: string;
}

interface MemoryStore {
  memories: Memory[];
  addMemory: (content: string) => void;
  getMemories: () => Memory[];
  getAllMemoriesText: () => string;
}

export const createMemoryStore = (): MemoryStore => {
  const memories: Memory[] = [];

  return {
    memories,
    addMemory: (content) => {
      memories.push({ content });
    },
    getMemories: () => memories,
    getAllMemoriesText: () => memories.map(m => m.content).join('\n')
  };
};
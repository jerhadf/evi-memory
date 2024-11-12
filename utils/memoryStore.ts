export interface Memory {
  // a memory is just a string of content - there is NO timestamp
  content: string;
}

interface MemoryStore {
  memories: Memory[];
  addMemory: (content: string) => void;
  getMemories: () => Memory[];
  getAllMemoriesText: () => string;
}

let instance: MemoryStore | null = null;

export const createMemoryStore = (): MemoryStore => {
  if (instance) {
    return instance;
  }

  const memories: Memory[] = [];

  instance = {
    memories,
    addMemory: (content) => {
      memories.push({ content });
    },
    getMemories: () => memories,
    getAllMemoriesText: () => memories.map(m => m.content).join('\n')
  };

  return instance;
};
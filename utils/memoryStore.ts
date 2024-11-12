export interface Memory {
  // a memory is just a string of content - there is NO timestamp
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
}

let instance: MemoryStore | null = null;

export const createMemoryStore = (): MemoryStore => {
  if (instance) {
    return instance;
  }

  const memories: Memory[] = [];

  instance = {
    memories,
    addMemories: (newMemories) => {
      // Filter out any null/undefined/empty strings
      const validMemories = newMemories.filter(content =>
        content && content.trim().length > 0 && content !== 'None'
      );

      // Add each memory as a new Memory object
      validMemories.forEach(content => {
        memories.push({ content });
      });
    },
    getMemories: () => memories,
    getAllMemoriesText: () => memories.map(m => m.content).join('\n')
  };

  return instance;
};
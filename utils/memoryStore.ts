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
      addMemories: async (newMemories: string[]) => {
        // Get latest memories from Redis first
        const response = await fetch('/api/memory-store');
        const currentMemories = await response.json();

        const now = new Date();
        const baseTimestamp = now.toISOString()
          .slice(0, 16)
          .replace('T', '_');

        const newMemoryObjects = newMemories.map((content, index) => ({
          timestamp: `${baseTimestamp}_${index.toString().padStart(2, '0')}`,
          content
        }));

        // Merge with latest state
        const mergedMemories = [...currentMemories, ...newMemoryObjects];

        // Save merged state
        await fetch('/api/memory-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mergedMemories),
        });

        // Update local state only after successful save
        instance!.memories = mergedMemories;

        // Dispatch event after successful update
        window.dispatchEvent(new Event('memoriesUpdated'));
      },
      getMemories: () => instance!.memories,
      getAllMemoriesText: () => instance!.memories
        .map(m => `- ${m.content}`)
        .join('\n'),
      clearMemories: () => {
        console.log('clearing all memories');
        instance!.memories = [];
        fetch('/api/memory-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([]),
        });
      }
    };
  }

  return instance;
};
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
        // Format: YYYY-MM-DD_HH:mm_XX
        const now = new Date();
        const baseTimestamp = now.toISOString()
          .slice(0, 16) // Get YYYY-MM-DDTHH:mm
          .replace('T', '_'); // Replace T with underscore

        const newMemoryObjects = newMemories.map((content, index) => ({
          timestamp: `${baseTimestamp}_${index.toString().padStart(2, '0')}`,
          content
        }));

        instance!.memories = [...instance!.memories, ...newMemoryObjects];

        console.log('adding new memories to storage:\n', newMemories);
        // Save to file via API
        fetch('/api/memory-store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(instance!.memories),
        });

        // Dispatch event to update UI
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
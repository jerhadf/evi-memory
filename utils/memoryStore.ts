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

let instance: MemoryStore | null = null;

export const createMemoryStore = (): MemoryStore => {
  if (instance) {
    return instance;
  }

  const memories: Memory[] = [];

  // Load initial memories from server
  if (typeof window !== 'undefined') {
    console.log('Fetching initial memories from server...');
    fetch('/api/memory-store')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded memories from server:', data);
        memories.length = 0;
        memories.push(...data);
        window.dispatchEvent(new Event('memoriesUpdated'));
      })
      .catch(error => {
        console.error('Error loading memories:', error);
      });
  }

  const generateUniqueTimestamp = (baseTime: Date, index: number) => {
    // Format: YYYY-MM-DD_HH:mm_XX where XX is the sequence number
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${baseTime.getFullYear()}-${pad(baseTime.getMonth() + 1)}-${pad(baseTime.getDate())}_${pad(baseTime.getHours())}:${pad(baseTime.getMinutes())}_${pad(index + 1)}`;
  };

  instance = {
    memories,
    addMemories: async (newMemories) => {
      const validMemories = newMemories
        .filter(content => content && content.trim().length > 0 && content !== 'None')
        .map((content, index) => ({
          timestamp: generateUniqueTimestamp(new Date(), index),
          content: content.trim()
        }));

      if (validMemories.length === 0) return;

      try {
        const response = await fetch('/api/memory-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memories: validMemories })
        });

        const updatedMemories = await response.json();
        memories.length = 0;
        memories.push(...updatedMemories);
        window.dispatchEvent(new Event('memoriesUpdated'));
      } catch (error) {
        console.error('Error saving memories:', error);
      }
    },
    getMemories: () => memories,
    getAllMemoriesText: () => memories.map(m => m.content).join('\n'),
    clearMemories: async () => {
      try {
        await fetch('/api/memory-store', { method: 'DELETE' });
        memories.length = 0;
        window.dispatchEvent(new Event('memoriesUpdated'));
      } catch (error) {
        console.error('Error clearing memories:', error);
      }
    }
  };

  return instance;
};
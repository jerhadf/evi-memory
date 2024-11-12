"use client";

import { motion } from "framer-motion";
import { createMemoryStore } from "@/utils/memoryStore";

// Use the same singleton instance
const memoryStore = createMemoryStore();

export default function MemoryPanel() {
  const memories = memoryStore.getMemories();

  return (
    <motion.div
      className="fixed right-0 top-14 w-64 bg-card border-l border-border h-[calc(100vh-3.5rem)] p-4 overflow-y-auto"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
    >
      <h3 className="font-medium mb-4">Memories</h3>
      <div className="space-y-2">
        {memories.map((memory, i) => (
          <div key={i} className="text-sm p-2 bg-muted rounded">
            {memory.content}
          </div>
        ))}
        {memories.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No memories stored yet
          </div>
        )}
      </div>
    </motion.div>
  );
}

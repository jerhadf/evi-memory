"use client";

import { motion } from "framer-motion";
import { createMemoryStore } from "@/utils/memoryStore";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

const memoryStore = createMemoryStore();

export default function MemoryPanel() {
  const [memories, setMemories] = useState(memoryStore.getMemories());

  // Update memories when the store changes
  useEffect(() => {
    const updateMemories = () => setMemories(memoryStore.getMemories());

    // Listen for custom event when memories are updated
    window.addEventListener("memoriesUpdated", updateMemories);

    return () => {
      window.removeEventListener("memoriesUpdated", updateMemories);
    };
  }, []);

  return (
    <motion.div
      className="fixed right-0 top-14 w-64 bg-background border-l border-border h-[calc(100vh-3.5rem)] p-4 overflow-y-auto"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5" />
        <h3 className="font-medium">Memories</h3>
      </div>
      <div className="space-y-2">
        {memories.map((memory, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm p-2 bg-muted rounded"
          >
            {memory.content}
          </motion.div>
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

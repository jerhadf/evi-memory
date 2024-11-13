"use client";

import { motion } from "framer-motion";
import { createMemoryStore } from "@/utils/memoryStore";
import { Brain, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import type { Memory } from "@/utils/memoryStore";

const memoryStore = createMemoryStore();

export default function MemoryPanel() {
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    // Initial load
    const loadInitialMemories = async () => {
      try {
        const response = await fetch("/api/memory-store");
        const initialMemories = await response.json();
        console.log("Initial memories loaded:", initialMemories);
        setMemories(initialMemories);
      } catch (error) {
        console.error("Error loading initial memories:", error);
      }
    };

    loadInitialMemories();

    // Update on changes
    const updateMemories = () => {
      const currentMemories = memoryStore.getMemories();
      console.log("Memory update event received:", currentMemories);
      setMemories([...currentMemories]);
    };

    window.addEventListener("memoriesUpdated", updateMemories);
    return () => window.removeEventListener("memoriesUpdated", updateMemories);
  }, []);

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear all memories?")) {
      await memoryStore.clearMemories();
      setMemories([]); // Immediately update UI
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Convert YYYY-MM-DD_HH:mm_XX to readable format
    const [date, time] = timestamp.split("_");
    const [hours, minutes] = time.split(":");
    return new Date(date).toLocaleDateString() + " " + `${hours}:${minutes}`;
  };

  return (
    <motion.div
      className="fixed right-0 top-14 w-64 bg-background border-l border-border h-[calc(100vh-3.5rem)] p-4 overflow-y-auto"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-medium">Memories</h3>
        </div>
        {memories.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {memories
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .map((memory) => (
            <motion.div
              key={memory.timestamp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm p-2 bg-muted rounded"
            >
              <div>{memory.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(memory.timestamp)}
              </div>
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

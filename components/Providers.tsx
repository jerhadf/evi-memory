"use client";

import { createContext, useState, useContext } from "react";

export const MemoryContext = createContext({
  isMemoryEnabled: true,
  setIsMemoryEnabled: (value: boolean) => {},
});

export const useMemoryEnabled = () => useContext(MemoryContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);

  return (
    <MemoryContext.Provider value={{ isMemoryEnabled, setIsMemoryEnabled }}>
      {children}
    </MemoryContext.Provider>
  );
}

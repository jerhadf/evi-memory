"use client";

import { createContext, useState, useContext } from "react";

interface MemoryContextType {
  isMemoryEnabled: boolean;
  setIsMemoryEnabled: (enabled: boolean) => void;
  isResumeEnabled: boolean;
  setIsResumeEnabled: (enabled: boolean) => void;
}

export const MemoryContext = createContext<MemoryContextType>({
  isMemoryEnabled: true,
  setIsMemoryEnabled: () => {},
  isResumeEnabled: true,
  setIsResumeEnabled: () => {},
});

export const useMemoryEnabled = () => useContext(MemoryContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);
  const [isResumeEnabled, setIsResumeEnabled] = useState(true);

  return (
    <MemoryContext.Provider
      value={{
        isMemoryEnabled,
        setIsMemoryEnabled,
        isResumeEnabled,
        setIsResumeEnabled,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
}

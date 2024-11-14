"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef, useCallback, useState, useEffect } from "react";
import { getChatHistory } from "@/utils/getChatHistory";
import { extractMemories } from "@/utils/memoryExtractor";
import { createMemoryStore } from "@/utils/memoryStore";
import { useMemoryEnabled } from "./MemoryPanel";

// permanent chat group id for this conversation thread
const PERMANENT_CHAT_GROUP_ID = "73e564d9-9391-425f-a1f2-faa895c45216";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [memories, setMemories] = useState<string>("");

  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];

  const { isMemoryEnabled } = useMemoryEnabled();

  // Initialize memories when component mounts
  useEffect(() => {
    const memoryStore = createMemoryStore();
    const currentMemories = memoryStore.getMemories();
    const formattedMemories = currentMemories
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .map((m) => `- ${m.content}`)
      .join("\n");

    setMemories(formattedMemories);
  }, []);

  // Update memories when chat closes
  const handleChatClose = useCallback(async (chatId: string) => {
    try {
      const transcript = await getChatHistory(chatId);
      const memoryResponse = await extractMemories(transcript);

      // After extracting new memories, update the state
      if (memoryResponse.memories?.length) {
        const memoryStore = createMemoryStore();
        const currentMemories = memoryStore.getMemories();
        const formattedMemories = currentMemories
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .map((m) => `- ${m.content}`)
          .join("\n");

        setMemories(formattedMemories);
      }

      console.log("Extracted final memories:", memoryResponse);
    } catch (error) {
      console.error("Error processing chat memories:", error);
    }
  }, []);

  // not being used for memory PoC - this is for pausing/resuming with tool calls; keep in case used later
  const handleToolResponse = (message: Record<string, any>) => {
    if (message.type === "tool_response") {
      const toolResponse = JSON.parse(message.content);

      if (toolResponse.action === "pause") {
        // Send pause message to WebSocket
        const pauseMessage = {
          type: "pause_assistant",
          duration: toolResponse.duration * 1000,
        };
        websocket.current?.send(JSON.stringify(pauseMessage));

        setTimeout(() => {
          const resumeMessage = {
            type: "resume_assistant",
          };
          websocket.current?.send(JSON.stringify(resumeMessage));
        }, toolResponse.duration * 1000);
      }
    }
  };

  const sessionSettings = {
    type: "session_settings" as const,
    variables: {
      memories: isMemoryEnabled ? memories : "", // Only include memories if enabled
    },
  };

  return (
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]">
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        resumedChatGroupId={PERMANENT_CHAT_GROUP_ID}
        sessionSettings={sessionSettings}
        onOpen={() => {
          console.log("Sent session settings:\n", sessionSettings);
          console.log("Memory enabled:", isMemoryEnabled);
          console.log("Current memories:", memories);
        }}
        onMessage={(message) => {
          handleToolResponse(message);

          // Store chatId when we receive the metadata
          if (message.type === "chat_metadata") {
            setCurrentChatId(message.chatId);
            console.log("Chat metadata:\n", message);
          }

          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;
              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
        onClose={() => {
          // Use the stored chatId when the connection closes
          if (currentChatId) {
            handleChatClose(currentChatId);
          }
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}

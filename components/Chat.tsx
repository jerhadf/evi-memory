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
const PERMANENT_CHAT_GROUP_ID = "8e9f616d-e940-49b1-baf9-c6a1e1565824";

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

  const { isMemoryEnabled, isResumeEnabled } = useMemoryEnabled();

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
  const handleChatClose = useCallback(
    async (chatId: string) => {
      // Only process chat close if it's a legitimate end of conversation
      if (!chatId) {
        console.log("No chat ID provided, skipping chat close handling");
        return;
      }

      try {
        // Get chat history regardless of memory setting
        const transcript = await getChatHistory(chatId);

        // Only extract and save memories if the feature is enabled
        if (isMemoryEnabled) {
          console.log("Extracting memories from chat...");
          const memoryResponse = await extractMemories(transcript);

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
        } else {
          console.log("Memory extraction skipped - memories disabled");
        }
      } catch (error) {
        console.error("Error processing chat memories:", error);
      }
    },
    [isMemoryEnabled]
  );

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
        resumedChatGroupId={
          isResumeEnabled ? PERMANENT_CHAT_GROUP_ID : undefined
        }
        sessionSettings={sessionSettings}
        onOpen={() => {
          console.log("Memory enabled:", isMemoryEnabled);
          console.log("Resume enabled:", isResumeEnabled);
          console.log(
            "Resuming from chat group ID:",
            isResumeEnabled ? PERMANENT_CHAT_GROUP_ID : "none"
          );
          console.log("Sent session settings:\n", sessionSettings);
          console.log("Current memories:\n", memories);
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

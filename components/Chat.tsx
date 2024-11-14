"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef, useCallback, useState } from "react";
import { getChatHistory } from "@/utils/getChatHistory";
import { extractMemories } from "@/utils/memoryExtractor";
import { createMemoryStore } from "@/utils/memoryStore";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];

  // Add new function to format memories as markdown list
  const getFormattedMemories = useCallback(() => {
    const memoryStore = createMemoryStore();
    const memories = memoryStore.getMemories();

    // Sort memories by timestamp in descending order (newest first)
    const sortedMemories = [...memories].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );

    // Format as markdown list without timestamps
    return sortedMemories.map((m) => `- ${m.content}`).join("\n");
  }, []);

  const handleChatClose = useCallback(async (chatId: string) => {
    try {
      // Get chat history
      const transcript = await getChatHistory(chatId);

      // Extract and save memories for this chat history
      const memories = await extractMemories(transcript);

      console.log("Extracted final memories:", memories);
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

  return (
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]">
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={configId}
        sessionSettings={{
          type: "session_settings",
          variables: {
            memories: getFormattedMemories(),
          },
        }}
        onMessage={(message) => {
          handleToolResponse(message);

          // Store chatId when we receive the metadata
          if (message.type === "chat_metadata") {
            setCurrentChatId(message.chatId);
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

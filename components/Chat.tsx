"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef } from "react";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  // optional: use configId from environment variable
  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];

  const handleToolResponse = (message: Record<string, any>) => {
    if (message.type === "tool_response") {
      const toolResponse = JSON.parse(message.content);

      if (toolResponse.action === "pause") {
        // Send pause message to WebSocket
        const pauseMessage = {
          type: "pause_assistant",
          duration: toolResponse.duration * 1000, // Convert to milliseconds
        };
        // Your WebSocket send method here
        websocket.current?.send(JSON.stringify(pauseMessage));

        // Set timeout to automatically resume after duration
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
        onMessage={(message) => {
          handleToolResponse(message);

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
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}

import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone, Brain, History } from "lucide-react";
import { useMemoryEnabled } from "./Providers";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function StartCall() {
  const { status, connect } = useVoice();
  const {
    isMemoryEnabled,
    setIsMemoryEnabled,
    isResumeEnabled,
    setIsResumeEnabled,
  } = useMemoryEnabled();

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className="fixed inset-0 p-4 flex items-center justify-center bg-background"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            variants={{
              initial: { scale: 0.5 },
              enter: { scale: 1 },
              exit: { scale: 0.5 },
            }}
          >
            <Button
              className="z-50 flex items-center gap-1.5"
              onClick={() => {
                connect()
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {});
              }}
            >
              <Phone className="size-4 opacity-50" strokeWidth={2} />
              <span>Start Call</span>
            </Button>

            <div className="flex flex-col items-center gap-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`z-50 flex items-center gap-1.5 ${
                        isMemoryEnabled
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setIsMemoryEnabled(!isMemoryEnabled)}
                    >
                      <Brain className="size-4" />
                      <span>Use memories in chat</span>
                      <span className="ml-1">
                        {isMemoryEnabled ? "✅" : "❌"}
                      </span>
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      align="center"
                      className="bg-black text-white p-2 rounded text-xs max-w-[200px]"
                      sideOffset={5}
                    >
                      When enabled, both memories and chat history are used.
                      When disabled, only chat history is used.
                      <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`z-50 flex items-center gap-1.5 ${
                        isResumeEnabled
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setIsResumeEnabled(!isResumeEnabled)}
                    >
                      <History className="size-4" />
                      <span>Resume from chat group</span>
                      <span className="ml-1">
                        {isResumeEnabled ? "✅" : "❌"}
                      </span>
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      align="center"
                      className="bg-black text-white p-2 rounded text-xs max-w-[200px]"
                      sideOffset={5}
                    >
                      When enabled, conversations continue from the previous
                      chat group. When disabled, each chat starts fresh.
                      <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

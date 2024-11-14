import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone, Brain } from "lucide-react";
import { useMemoryEnabled } from "./Providers";

export default function StartCall() {
  const { status, connect } = useVoice();
  const { isMemoryEnabled, setIsMemoryEnabled } = useMemoryEnabled();

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={
            "fixed inset-0 p-4 flex items-center justify-center bg-background"
          }
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
              className={"z-50 flex items-center gap-1.5"}
              onClick={() => {
                connect()
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {});
              }}
            >
              <Phone
                className={"size-4 opacity-50"}
                strokeWidth={2}
                stroke={"currentColor"}
              />
              <span>Start Call</span>
            </Button>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`z-50 flex items-center gap-1.5 ${
                  isMemoryEnabled ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMemoryEnabled(!isMemoryEnabled)}
              >
                <Brain className="size-4" />
                <span>Use memories in chat</span>
                <span className="ml-1">{isMemoryEnabled ? "✅" : "❌"}</span>
              </Button>
              <p className="text-xs text-muted-foreground text-center max-w-[300px]">
                When enabled, both memories and chat history are used. When
                disabled, only chat history is used.
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

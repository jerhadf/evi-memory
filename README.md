<div align="center">
  <img src="https://storage.googleapis.com/hume-public-logos/hume/hume-banner.png">
  <h1>EVI Memory PoC</h1>
</div>

## Overview

Proof of concept of a simple memory system for the consumer app - extract key memories from chats, then save them to the prompt (in a {{memories}} dynamic variable). Uses the Vercel EVI example as a starting point.

## How it works

- Chats are processed through `utils/memoryExtractor.ts` and `api/memories/route.ts`, which uses a prompt with Claude 3.5 Sonnet to extract memories
- Memory extraction occurs on chat close through `handleChatClose` in `Chat.tsx`
- Memories are stored with timestamps in `memoryStore.ts`
- The memory panel (`components/MemoryPanel.tsx`) displays the extracted memories chronologically with timestamps
- Memory storage is handled by `api/memory-store/route.ts`, using either a small Redis (Upstash) database or local JSON storage in `memories.json`
- Redis (Upstash) for production memory storage
- Chat history is tracked via `utils/getChatHistory.ts` which paginates through chat events to get a string of just User and Assistant messages
- Real-time UI updates are triggered through custom events (`memoriesUpdated`)
- Global memory state is managed in `components/Providers.tsx` using React Context
- A permanent chat group ID (`PERMANENT_CHAT_GROUP_ID` in Chat.tsx) is used for all chats by default, so we can see whether the memories really add to it
- The `StartCall` component provides toggles for memory and chat history resumption - this allows us to test turning these off to feel the difference in conversation

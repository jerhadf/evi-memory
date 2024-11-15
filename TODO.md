# EVI Memory PoC Implementation Checklist

## 1. Basic Setup and Infrastructure ✅

- [x] Create initial README plan
- [x] Set up Next.js project with Vercel EVI template
- [x] Add memory panel component to layout (basic memory panel display)
- [x] Set up API routes structure
- [x] Spice up the UI - add a title "EVI Memory PoC", change the colors/design a bit, etc
- [x] Improve the memory panel (currently just shows raw strings - make it prettier)

## 2. Chat History System ✅

- [x] Implement API endpoint for chat history retrieval
- [x] Create chat transcript formatting utility
- [x] Add chat ID tracking in the voice provider
- [x] Implement chat close handler
- [x] Fix bug where chat history will include interim messages as well
- [x] Fix bug where chat history will output part of the results, not the full chat history (probably because we're only getting some of the page, not full transcript)

## 3. Memory System 🏗️

- [x] Create memory extraction API endpoint
- [x] Implement v1 of the Claude prompt for memory extraction
- [x] Create basic memory store implementation (as strings)
- [x] Implement dynamic variables to send the memories to EVI (adding them to the prompt)
- [x] Fix memory persistence between page refreshes (currently resets on refresh)
- [x] Add memory appending mechanism (currently overwrites instead of appends)
- [x] Modify the prompt to add proactive memory gathering, get-to-know-you questions
- [x] Make sure the memory panel only displays real memories, not None or other
- [x] Improve the memory prompt to extract more legit accurate memories - have the model output JSON memories, which have a `chain_of_thought`, a `memory_type`, and a `content`
- [x] Add a chat resumability option in the UI so that we can toggle between resuming or not (to test whether resuming from previous chats is enough or if memories make a difference)
- [ ] Option to turn off chat resumability seperately
- [ ] Add vercel KV storage instead of local JSON storage of memories

## 4. Evaluation ⚖️

- [] Make sure that in the deployed version memories are still saved
- [] Build up some memories and chat history, and see what the difference is

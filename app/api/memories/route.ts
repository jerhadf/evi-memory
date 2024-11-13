import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { MemoryResponse } from '@/utils/memoryStore';
import { createMemoryStore } from '@/utils/memoryStore';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const MEMORY_EXTRACTION_PROMPT = `<role>Assistant is a memory extraction system that identifies and extracts key semantic memories from human-AI voice conversations. Focus on extracting memories that would be valuable for future personalization, context, and building long-term engagement.</role>

<task>Extract key memories from the provided conversation transcript. Output your analysis in valid JSON format with two fields:
1. "reasoning": Your chain of thought explaining what memories you identified in the conversation and why they are relevant, about a paragraph
2. "memories": An array of clear, concise memory strings (up to a few sentences each). If the conversation doesn't contain relevant memories, use null for this field.

Focus on extracting memories about the user, including but not limited to their name, age, gender, location, background, occupation, living situation, interests, goals, emotional patterns (e.g. "Gets anxious when discussing work deadlines"), conversational style (e.g. "Prefers casual, friendly tone with occasional jokes"), daily routines, relationships, challenges (e.g. "Struggles with work-life balance due to long commute"), values, past experiences, and learning preferences (e.g. "Learns best through concrete examples rather than abstract concepts").

Make sure to extract a mutually exclusive, collectively exhaustive set of all the relevant memories from the conversation. Memories must be distinct things that will be relevant in future chats. Err on the side of extracting more memories, even if they are short or not detailed, as long as they might be relevant in the future.
</task>

<output_format>
{
  "reasoning": "string explaining the memory extraction thought process",
  "memories": ["memory1", "memory2"] // or null if no memories found
}
</output_format>

<output_rules>
- Output must be valid JSON only
- Each memory must be a complete, standalone statement
- No combining multiple, conceptually distinct memories into a single memory string
- No markdown or other formatting - JSON output only
- No preamble or postamble text - just the output JSON
- Keep memories concise and factual, but include all relevant details
- Do not duplicate existing memories - only return new memories. If they are related to existing memories, output them as new memories still
- Make the memories as specific as possible and as TRUE to the conversation - don't just extract high-level, generic takeaways, but actual things the user mentioned (e.g. "Asked the AI to always speak as the character of a Scottish farmer with a strong accent and a gruff manner" rather than "Prefers roleplaying with characters")
</output_rules>

<example>
{
  "reasoning": "User mentioned their name, location, and job, which are key memories for personalization and are not already known.",
  "memories": [
    "Name is Sarah",
    "Lives in Seattle after recently moving from New York, looking for new friends in the city",
    "Works as a product designer at Amazon, and likes the role so far but is looking for a promotion"
  ]
}
</example>

<existing_memories>
Here are the existing memories for this user.
{{existingMemories}}
</existing_memories>

Return the extracted memories as ONLY valid JSON for the chat history provided below.`;

export async function POST(request: Request) {
  try {
    const { chatHistory } = await request.json();

    if (!chatHistory?.trim()) {
      return NextResponse.json({
        reasoning: "No chat history provided",
        memories: null
      });
    }

    // Get existing memories
    const memoryStore = createMemoryStore();
    const existingMemories = memoryStore.getAllMemoriesText();

    const promptWithMemories = MEMORY_EXTRACTION_PROMPT.replace(
      '{{existingMemories}}',
      existingMemories || 'No existing memories.'
    );

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1000,
      temperature: 0.8,
      system: promptWithMemories,
      messages: [{
        role: 'user',
        content: `Extract new memories from this chat history as valid JSON, without any additional text:\n${chatHistory}`
      }]
    });
    console.log('Raw Claude API response:\n', response);

    const extractedContent = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      // Validate JSON structure
      const memoryResponse = JSON.parse(extractedContent) as MemoryResponse;

      // validate response - reasoning and memory fields must be present
      if (!memoryResponse.reasoning || !('memories' in memoryResponse)) {
        throw new Error('Invalid memory response structure: ' + extractedContent);
      }

      console.log('Extracted memories:', memoryResponse);
      return NextResponse.json(memoryResponse);
    } catch (parseError) {
      console.error('Error parsing memory response:', parseError);
      return NextResponse.json({
        reasoning: "Failed to parse memory response",
        memories: null
      });
    }
  } catch (error) {
    console.error('Error extracting memories:', error);
    return NextResponse.json({
      reasoning: "Error during memory extraction",
      memories: null
    }, { status: 500 });
  }
}
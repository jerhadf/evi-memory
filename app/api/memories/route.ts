import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Memory, MemoryResponse } from '@/utils/memoryStore';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const MEMORY_EXTRACTION_PROMPT = `<role>Assistant is a memory extraction system that identifies and extracts key semantic memories from human-AI voice conversations. Focus on extracting memories that would be valuable for future personalization, context, and building long-term engagement.</role>

<task>Extract key memories from the provided conversation transcript. Output your analysis in valid JSON format with two fields:
1. "reasoning": Your chain of thought explaining what memories you identified in the conversation and why they are relevant, about a paragraph
2. "memories": An array of clear, concise memory strings (up to a few sentences each). If the conversation doesn't contain relevant memories, use null for this field.

Focus on extracting memories about, but not limited to, these themes:
- Personal details: name, age, gender, location, background, occupation, family, living situation
- Interests and preferences: hobbies, likes/dislikes, entertainment choices
- Conversational preferences: favorite topics, preferred tone, style, and format for the AI to respond in, ways the user likes interacting
- Goals and aspirations: short and long-term objectives, dreams, plans
- Emotional patterns: recurring feelings, expressions, patterns, triggers, or coping mechanisms
- Social connections: relationships, friend groups, important people
- Daily routines and habits: regular activities, schedules, rituals
- Pain points and challenges: problems faced, areas of struggle, concerns, frustrations, worries
- Values and beliefs: core principles, what matters most to them, key opinions and stances
- Past experiences: significant life events, formative memories, stories
- Learning style: how they prefer to receive and process information

Each individual memory should be its own item - don't combine a bunch of distinct memories together. Make sure the memories outputted are a mutually exclusive, collectively exhaustive, atomic set of all the relevant memories from the conversation. Memories must be things that will be relevant in future chats.

<output_format>
{
  "reasoning": "string explaining the memory extraction thought process",
  "memories": ["memory1", "memory2"] // or null if no memories found
}
</output_format>

<example>
{
  "reasoning": "The conversation revealed several key personal details about the user. They shared their name and location, which are fundamental for personalization. The user's tone was casual and friendly, suggesting comfort with informal conversation.",
  "memories": [
    "User's name is Sarah",
    "User lives in Seattle after recently moving from New York",
    "User works as a product designer at Amazon"
  ]
}
</example>`;

export async function POST(request: Request) {
  try {
    const { chatHistory } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.8,
      system: MEMORY_EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: `Extract memories from this chat history as valid JSON, without any preamble or postamble: ${chatHistory}`
      }]
    });

    const extractedContent = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const memoryResponse = JSON.parse(extractedContent) as MemoryResponse;
      console.log('Extracted memories:', memoryResponse);

      return NextResponse.json(memoryResponse);
    } catch (parseError) {
      console.error('Error parsing memory response:', parseError);
      return NextResponse.json({ reasoning: '', memories: null });
    }
  } catch (error) {
    console.error('Error extracting memories:', error);
    return NextResponse.json({ reasoning: '', memories: null }, { status: 500 });
  }
}
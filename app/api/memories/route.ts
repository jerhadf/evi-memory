import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Memory } from '@/utils/memoryStore';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const MEMORY_EXTRACTION_PROMPT = `<role>Assistant is a memory extraction system that identifies and extracts key semantic memories from human-AI voice conversations. Focus on extracting memories that would be valuable for future personalization, context, and building long-term engagement.</role>

<task>
Extract key memories from the provided conversation transcript. Focus on extracting memories, including but not limited to these types:
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

Each individual memory should be its own line - don't combine a bunch of distinct memories into one line. Make sure the memories outputted are a mutually exclusive, collectively exhaustive, atomic set of all the relevant memories from the conversation.

If there are no major memories from the chat, just return the string "None."
</task>

<memory_format>Format each memory as 1-3 clear, concise sentences that capture the essential meaning. Each memory should be a markdown bullet point on its own line.</memory_format>

<examples>
- User is Sarah, a 34-year-old product designer living in Seattle who recently moved from New York for a role at a Amazon.
- Sarah is struggling to build a new social circle in the city but has joined several meetup groups focused on hiking and photography. Her goal is to establish meaningful friendships by the end of the year.
- User has been developing a mobile app for mental health tracking in their spare time for the past two years, inspired by their own challenges with anxiety management.
- User grew up in a military family, moving between bases every few years which shaped their adaptable personality and love of travel.
</examples>

Remember, always extract all memories that are available.`;

export async function POST(request: Request) {
  try {
    const { chatHistory } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 1,
      system: MEMORY_EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: `Output the extracted memories as a markdown list for the chat history below.\n <chat_history>${chatHistory}</chat_history>`
      }]
    });

    const extractedContent = response.content[0].type === 'text' ? response.content[0].text : '';

    const memories = extractedContent
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((content: string) => ({
        content
      }));

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error extracting memories:', error);
    return NextResponse.json({ memories: [] }, { status: 500 });
  }
}
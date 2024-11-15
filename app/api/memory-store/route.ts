import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import type { Memory } from '@/utils/memoryStore';

const MEMORY_KEY = 'evi-memories';
const USE_LOCAL_JSON_IN_DEV = false; // Toggle this to true to use local memories.json file in development

// Initialize Redis
const redis = Redis.fromEnv();
const isProduction = process.env.NODE_ENV === 'production';

async function getLocalMemories() {
  const filePath = path.join(process.cwd(), 'data', 'memories.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function saveLocalMemories(memories: Memory[]) {
  const filePath = path.join(process.cwd(), 'data', 'memories.json');
  await fs.writeFile(filePath, JSON.stringify(memories, null, 2));
}

export async function POST(request: Request) {
  try {
    const memories = await request.json();

    if (!isProduction && USE_LOCAL_JSON_IN_DEV) {
      await saveLocalMemories(memories);
    } else {
      console.log('Saving memories to Redis:', memories);
      await redis.set(MEMORY_KEY, memories); // Don't stringify, Redis will handle it
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving memories:', error);
    return NextResponse.json({ error: 'Failed to save memories' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isProduction && USE_LOCAL_JSON_IN_DEV) {
      console.log('Reading memories from local JSON file');
      const memories = await getLocalMemories();
      return NextResponse.json(memories);
    } else {
      console.log('Reading memories from Redis');
      const memories = await redis.get<Memory[]>(MEMORY_KEY); // Type the response
      console.log('Raw Redis response:', memories);

      if (!memories) {
        console.log('No memories found in Redis, returning empty array');
        return NextResponse.json([]);
      }

      // No need to parse, Redis already returns the correct format
      console.log(`Retrieved ${memories.length} memories from Redis`);
      return NextResponse.json(memories);
    }
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE() {
  try {
    if (!isProduction && USE_LOCAL_JSON_IN_DEV) {
      console.log('Clearing memories from local JSON file');
      await saveLocalMemories([]);
    } else {
      console.log('Clearing memories from Redis');
      await redis.del(MEMORY_KEY);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing memories:', error);
    return NextResponse.json({ error: 'Failed to clear memories' });
  }
}
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import type { Memory } from '@/utils/memoryStore';

const isProduction = process.env.NODE_ENV === 'production';
const MEMORY_KEY = 'evi-memories';

// Initialize Redis for production
const redis = Redis.fromEnv();

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

    if (isProduction) {
      await redis.set(MEMORY_KEY, JSON.stringify(memories));
    } else {
      await saveLocalMemories(memories);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving memories:', error);
    return NextResponse.json({ error: 'Failed to save memories' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (isProduction) {
      const memoriesStr = await redis.get<string>(MEMORY_KEY);
      const memories = memoriesStr ? JSON.parse(memoriesStr) : [];
      return NextResponse.json(memories);
    } else {
      const memories = await getLocalMemories();
      return NextResponse.json(memories);
    }
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE() {
  try {
    if (isProduction) {
      await redis.del(MEMORY_KEY);
    } else {
      await saveLocalMemories([]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing memories:', error);
    return NextResponse.json({ error: 'Failed to clear memories' });
  }
}
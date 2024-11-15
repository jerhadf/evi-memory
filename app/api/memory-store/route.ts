import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import type { Memory } from '@/utils/memoryStore';

const isProduction = process.env.NODE_ENV === 'production';
const MEMORY_KEY = 'evi-memories'; // consistent key for KV store

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
      await kv.set(MEMORY_KEY, memories);
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
      const memories = await kv.get(MEMORY_KEY) as Memory[] || [];
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

// Add export endpoint to download current memories as JSON
export async function PUT(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'export') {
      const memories = isProduction
        ? await kv.get(MEMORY_KEY) as Memory[]
        : await getLocalMemories();

      return new Response(JSON.stringify(memories, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename=memories.json'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting memories:', error);
    return NextResponse.json({ error: 'Failed to export memories' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (isProduction) {
      await kv.del(MEMORY_KEY);
    } else {
      await saveLocalMemories([]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing memories:', error);
    return NextResponse.json({ error: 'Failed to clear memories' });
  }
}
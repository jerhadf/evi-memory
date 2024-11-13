import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import type { Memory } from '@/utils/memoryStore';

const MEMORIES_FILE = path.join(process.cwd(), 'data', 'memories.json');

async function readMemoriesFile() {
  try {
    const data = await fs.readFile(MEMORIES_FILE, 'utf-8');
    return JSON.parse(data) as Memory[];
  } catch (error) {
    return [];
  }
}

async function writeMemoriesFile(memories: Memory[]) {
  await fs.writeFile(MEMORIES_FILE, JSON.stringify(memories, null, 2));
}

export async function GET() {
  try {
    const memories = await readMemoriesFile();
    console.log('Reading memories from file:', memories);
    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { memories: newMemories } = await request.json();
    const existingMemories = await readMemoriesFile();

    const updatedMemories = [...existingMemories, ...newMemories];
    await writeMemoriesFile(updatedMemories);

    return NextResponse.json(updatedMemories);
  } catch (error) {
    console.error('Error saving memories:', error);
    return NextResponse.json({ error: 'Failed to save memories' });
  }
}

export async function DELETE() {
  try {
    await writeMemoriesFile([]);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error clearing memories:', error);
    return NextResponse.json({ error: 'Failed to clear memories' });
  }
}
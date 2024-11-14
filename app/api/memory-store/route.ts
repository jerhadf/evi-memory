import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const memories = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'memories.json');
    await fs.writeFile(filePath, JSON.stringify(memories, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving memories:', error);
    return NextResponse.json({ error: 'Failed to save memories' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'memories.json');
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'memories.json');
    const existingMemories = await fs.readFile(filePath, 'utf8');
    const deletedMemories = JSON.parse(existingMemories);
    await fs.writeFile(filePath, '[]');
    return NextResponse.json(deletedMemories);
  } catch (error) {
    console.error('Error clearing memories:', error);
    return NextResponse.json({ error: 'Failed to clear memories' });
  }
}
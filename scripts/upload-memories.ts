import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';
import type { Memory } from '../utils/memoryStore';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadMemories() {
  const redis = Redis.fromEnv();

  // First check if memories already exist
  const existingMemoriesStr = await redis.get('evi-memories');
  const existingMemories = existingMemoriesStr
    ? (typeof existingMemoriesStr === 'string'
        ? JSON.parse(existingMemoriesStr)
        : existingMemoriesStr) as Memory[]
    : [];

  // Read new memories
  const newMemories = JSON.parse(
    readFileSync(join(__dirname, '../data/memories.json'), 'utf-8')
  ) as Memory[];

  // Create a map of existing memories by content to check for duplicates
  const existingContentMap = new Map(existingMemories.map(m => [m.content, m]));

  // Merge memories, preferring new timestamps for duplicates
  const mergedMemories = [...newMemories];
  for (const memory of existingMemories) {
    if (!existingContentMap.has(memory.content)) {
      mergedMemories.push(memory);
    }
  }

  // Sort by timestamp
  mergedMemories.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Save merged memories
  await redis.set('evi-memories', JSON.stringify(mergedMemories));
  console.log('Memories uploaded to Redis');

  // Validate and show results
  console.log('\nValidating stored memories:');
  console.log('Number of memories stored:', mergedMemories.length);
  console.log('\nFirst few memories:');
  console.log(JSON.stringify(mergedMemories.slice(0, 3), null, 2));
}

uploadMemories()
  .then(() => console.log('\nDone!'))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
import { HumeClient } from 'hume';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
  }

  try {
    const client = new HumeClient({
      apiKey: process.env.HUME_API_KEY || ''
    });

    const events = await client.empathicVoice.chats.listChatEvents(chatId);

    const transcript = events.data
      .filter((event) =>
        event.type === 'USER_MESSAGE' ||
        event.type === 'AGENT_MESSAGE'
      )
      .map((event) => {
        const role = event.type === 'USER_MESSAGE' ? 'user' : 'assistant';
        return `${role}: ${event.messageText || ''}`;
      })
      .join('\n');

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
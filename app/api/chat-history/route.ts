import { HumeClient } from 'hume';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  const pageNumber = Number(searchParams.get('pageNumber') || '0');
  const pageSize = 100;

  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
  }

  try {
    const client = new HumeClient({
      apiKey: process.env.HUME_EVI_API_KEY || ''
    });

    const response = await client.empathicVoice.chats.listChatEvents(chatId, {
      pageNumber,
      pageSize,
      ascendingOrder: true
    });

    // The response data contains an array of events directly
    const events = response.data;

    if (!Array.isArray(events)) {
      console.error('Invalid response format:', events);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    const transcript = events
      .filter(event =>
        event.type === 'USER_MESSAGE' ||
        event.type === 'AGENT_MESSAGE'
      )
      .map(event => {
        const role = event.type === 'USER_MESSAGE' ? 'user' : 'assistant';
        return `${role}: ${event.messageText || ''}`;
      })
      .join('\n');

    // Check if there might be more pages based on the number of events returned
    const hasMore = events.length === pageSize;

    return NextResponse.json({
      transcript,
      hasMore,
      pageNumber
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
import { HumeClient } from 'hume';

export const getChatHistory = async (chatId: string): Promise<string> => {
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

    console.log('retrieved chat history:', transcript.slice(0, 100) + '...');

    return transcript;

  } catch (error) {
    console.error('Error getting chat history:', error);
    return '';
  }
};
export const getChatHistory = async (chatId: string): Promise<string> => {
  try {
    console.log('Attempting to get chat history for chatId:', chatId);

    const response = await fetch(`/api/chat-history?chatId=${encodeURIComponent(chatId)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.transcript || '';

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting chat history:', {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Error getting chat history:', error);
    }
    return '';
  }
};
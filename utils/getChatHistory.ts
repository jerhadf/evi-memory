export const getChatHistory = async (chatId: string): Promise<string> => {
  try {
    console.log('Attempting to get chat history for chatId:', chatId);
    let allTranscripts: string[] = [];
    let hasMore = true;
    let pageNumber = 0;

    // Loop through all pages of chat events
    while (hasMore) {
      console.log(`Fetching page ${pageNumber} of chat history...`);
      const url = `/api/chat-history?chatId=${encodeURIComponent(chatId)}&pageNumber=${pageNumber}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      if (data.transcript) {
        allTranscripts.push(data.transcript);
      }

      hasMore = data.hasMore;
      pageNumber++;

      // Safety check to prevent infinite loops
      if (pageNumber > 100) {
        console.error('Too many pages requested, breaking loop');
        break;
      }
    }

    const fullTranscript = allTranscripts.join('\n');
    return fullTranscript;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting chat history:', error);
    } else {
      console.error('Error getting chat history:', error);
    }
    return '';
  }
};
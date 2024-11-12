import { ChatAnswers, ChatQnAData } from '@/lib/types/chat_qna';

// export async function sendChatQnA(chatInputQnA: ChatQnAData) {
export async function sendChatQnA(chatAnswers: ChatAnswers) {
  console.log('Chat input answers data in sendChatQnA:', chatAnswers);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const response = await fetch(`${baseUrl}/api/send-chat-qna`, {
    // const response = await fetch('/api/send-chat-qna', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatAnswers),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to send chat QnA data');
  }


  console.log('Response from server:', response);
  const responseData = await response.json();
  console.log('Response data:', responseData);
  // console.log('Response text:', await response.text());
  // console.log('Response JSON:', response.json());

  // return response.json();
  return responseData;
}

export async function runLLMChat(chatInputQnA: ChatQnAData) {
  console.log('Run LLM chat QnA data in runLLMChat:', chatInputQnA);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const response = await fetch(`${baseUrl}/api/run-llm-chat`, {
    // const response = await fetch('/api/run-llm-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatInputQnA),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to run llm chat QnA');
  }


  console.log('Response from server:', response);
  const responseData = await response.json();
  console.log('Response data:', responseData);
  // console.log('Response text:', await response.text());
  // console.log('Response JSON:', response.json());

  // return response.json();
  return responseData;
}

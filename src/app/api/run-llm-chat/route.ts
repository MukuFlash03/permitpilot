import { NextResponse } from 'next/server';
import { ChatQnAData } from '@/lib/types/chat_qna'

export async function POST(request: Request) {
  try {
    console.log("Received request in send-chat-qna POST route");

    const bodyText = await request.text();
    console.log("Raw request body:", bodyText);

    const { question, answer } = JSON.parse(bodyText);

    const extractInfoResponse = await extractInfoFromQnA({ question: question, answer: answer });
    console.log("Extracted info content response:", extractInfoResponse);

    const data = {
      question: question,
      answer: answer,
    }

    return NextResponse.json({ message: 'Business details fetched successfully', data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch business data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { ChatQnAData, ChatAnswers } from '@/lib/types/chat_qna'

export async function POST(request: Request) {
  try {
    console.log("Received request in send-chat-qna POST route");

    const bodyText = await request.text();
    console.log("Raw request body:", bodyText);

    // const { question, answer } = JSON.parse(bodyText);
    const { answers } = JSON.parse(bodyText);

    // const extractInfoResponse = await extractInfoFromQnA({ question: question, answer: answer });
    const extractInfoResponse = await extractInfoFromQnA({ answers: answers });
    console.log("Extracted info content response:", extractInfoResponse);

    const data = {
      answers: answers,
    }
    // const data = {
    //   question: question,
    //   answer: answer,
    // }

    return NextResponse.json({ message: 'Business details fetched successfully', data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch business data' }, { status: 500 });
  }
}


async function extractInfoFromQnA(chatAnswers: ChatAnswers) {
  console.log("Inside extractInfroFromQnA route.ts");
  console.log("chatAnswers: ", chatAnswers);

  const { answers } = chatAnswers;

  try {
    // const url = `${API_BASE_URL}/api/py/extract-info?user_id=${user_id}&book_id=${book_id}&page_id=${page_id}`;

    // const url = process.env.NODE_ENV === 'development'
    //   ? `http://127.0.0.1:8000/api/py/extract-info?question=${question}&answer=${answer}`
    //   : `/api/py/extract-info?question=${question}&answer=${answer}`;

    // const url = `http://127.0.0.1:8000/api/py/extract-info?question=${question}&answer=${answer}`
    // const url = `http://127.0.0.1:8000/api/py/extract-info?answers=${answers}`

    const url = `http://127.0.0.1:8000/api/py/extract-info`

    console.log("Requesting URL:", url);

    // const requestUrl = process.env.NODE_ENV === 'development'
    //   ? url
    //   : new URL(url, 'https://bookwise-ai.vercel.app').toString();

    const requestUrl = url;

    // const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 50000);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: answers })
    });

    // const response = await fetch(requestUrl, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   // signal: controller.signal,
    // });

    // clearTimeout(timeoutId);

    // const response = await fetch(`${API_BASE_URL}/api/py/generate-notes-claude?user_id=${user_id}&book_id=${book_id}&page_id=${page_id}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    console.log("After fetching extracted info request");
    console.log("Response status from extract info:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response after trying to extract info:", errorText);
      throw new Error(`Failed to fetch extract info: ${errorText}`);
    }

    const extractedInfoResponse = await response.json();
    console.log("Extracted info response:");
    console.log(extractedInfoResponse);
    console.log("********************************************");

    return extractedInfoResponse;
  } catch (error: unknown) {
    console.error("Error in extractInfoFromQnA:", error);

    if (error instanceof Error) {
      // if (error.name === 'AbortError') {
      //   throw new Error('Request timed out after 50 seconds');
      // }
      throw error;
    }

    throw new Error('An unknown error occurred');
  }
}

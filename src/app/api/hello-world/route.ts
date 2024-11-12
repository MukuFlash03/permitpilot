import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const owner_id = "1234;"

    const data = {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "1234567890",
      "address": "123 Main St",
      "city": "San Francisco",
    }

    return NextResponse.json({ message: 'Hello John Doe! Business owner details fetched successfully', data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch business owner data' }, { status: 500 });
  }
}
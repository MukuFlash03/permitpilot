// app/api/forms/route.ts
import { NextResponse } from 'next/server';
import formsData from '@/app/data/forms.json';

export async function GET() {
  try {
    // Log that we're accessing the API
    console.log('API route accessed, returning forms:', Object.keys(formsData).length);
    
    return NextResponse.json(formsData, {
      headers: {
        'Cache-Control': 'no-store',  // Disable caching during debugging
      },
    });
  } catch (error) {
    console.error('Error in forms API route:', error);
    return NextResponse.json(
      { error: 'Failed to load forms data' },
      { status: 500 }
    );
  }
}
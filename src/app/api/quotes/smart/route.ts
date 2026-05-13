import { NextResponse } from 'next/server';
import { createSmartQuote } from '@/db';

export async function POST(request: Request) {
  try {
    const { leadId, customerId, jobType } = await request.json();

    if (!leadId || !customerId || !jobType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quote = await createSmartQuote({
      leadId,
      customerId,
      jobType,
    });
    
    return NextResponse.json({ success: true, quoteId: quote.id });
  } catch (error) {
    console.error('Failed to create smart quote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

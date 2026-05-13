import { NextResponse } from 'next/server';
import { getLeads } from '@/db';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

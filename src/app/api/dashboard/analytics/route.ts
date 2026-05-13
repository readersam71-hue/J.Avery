import { NextResponse } from 'next/server';
import { getDashboardAnalytics } from '@/db';

export async function GET() {
  try {
    const analytics = await getDashboardAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

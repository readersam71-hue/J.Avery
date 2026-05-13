import { NextResponse } from 'next/server';
import { db, updateLeadStatus } from '@/db';

export async function PATCH(request: Request) {
  try {
    const { leadId, status } = await request.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required' }, { status: 400 });
    }

    await updateLeadStatus(leadId, status);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

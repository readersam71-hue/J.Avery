import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { onJobCompletion } from '@/lib/integrations';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Update job status in database
    await db.update(jobs)
      .set({ 
        status: 'completed',
        actualCompletion: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // Trigger integrations (GBP Post, Review Request, etc.)
    // Note: In production, this might be offloaded to a background queue
    await onJobCompletion(jobId);

    return NextResponse.json({ success: true, message: 'Job completed and integrations triggered' });
  } catch (error) {
    console.error('Failed to complete job:', error);
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
  }
}

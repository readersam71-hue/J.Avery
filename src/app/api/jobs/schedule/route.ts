import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { onJobScheduled } from '@/lib/integrations';

export async function POST(request: Request) {
  try {
    const { jobId, techId, scheduledStart, scheduledEnd } = await request.json();

    if (!jobId || !techId || !scheduledStart || !scheduledEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update job in database
    await db.update(jobs)
      .set({ 
        assignedTechId: techId,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        status: 'scheduled',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // Trigger Calendar Integration
    await onJobScheduled(jobId);

    return NextResponse.json({ success: true, message: 'Job scheduled and dispatched to calendar' });
  } catch (error) {
    console.error('Failed to schedule job:', error);
    return NextResponse.json({ error: 'Failed to schedule job' }, { status: 500 });
  }
}

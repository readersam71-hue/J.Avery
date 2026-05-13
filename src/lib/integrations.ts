import { createGBPPost, createJobEvent } from './google';
import { db } from '@/db';
import { jobs, customers, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Triggered when a job is marked as completed.
 * Posts an update to Google Business Profile.
 */
export async function onJobCompletion(jobId: string) {
  try {
    const jobData = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        customer: true,
      },
    }) as any;

    if (!jobData) return;

    const LOCATION_ID = process.env.GOOGLE_LOCATION_ID;
    if (!LOCATION_ID) return;

    // Construct the post content
    const area = jobData.customer?.city || 'Birmingham';
    const text = `Another successful plumbing job completed in ${area}! Our team worked hard to ensure everything was spotless and functioning perfectly. Need a plumber in ${area}? Call J.Avery Plumbing & Heating today!`;
    
    // Use the first 'after' photo if available
    const imageUrl = jobData.afterPhotos && jobData.afterPhotos.length > 0 
      ? jobData.afterPhotos[0] 
      : undefined;

    await createGBPPost(LOCATION_ID, text, imageUrl);
    
    console.log(`GBP Post created for job ${jobId}`);
  } catch (error) {
    console.error(`Failed to handle job completion integration for ${jobId}:`, error);
  }
}

/**
 * Triggered when a job is scheduled.
 * Dispatches to technician's Google Calendar.
 */
export async function onJobScheduled(jobId: string) {
  try {
    const jobData = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        customer: true,
        tech: true,
      },
    }) as any;

    if (!jobData || !jobData.tech?.email) return;

    // Use tech's email as calendarId or a specific business calendar
    const calendarId = jobData.tech.email; 

    await createJobEvent(calendarId, {
      summary: `Plumbing Job: ${jobData.customer?.firstName} ${jobData.customer?.lastName}`,
      location: `${jobData.customer?.addressLine1}, ${jobData.customer?.postcode}`,
      description: `Job Details: ${jobData.workNotes}\nCustomer Phone: ${jobData.customer?.phone}`,
      start: jobData.scheduledStart?.toISOString() || new Date().toISOString(),
      end: jobData.scheduledEnd?.toISOString() || new Date().toISOString(),
    });

    console.log(`Calendar event created for job ${jobId}`);
  } catch (error) {
    console.error(`Failed to dispatch job ${jobId} to calendar:`, error);
  }
}

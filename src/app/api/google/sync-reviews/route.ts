import { NextResponse } from 'next/server';
import { fetchGoogleReviews } from '@/lib/google';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  // Security check for cron secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const LOCATION_ID = process.env.GOOGLE_LOCATION_ID;
  if (!LOCATION_ID) {
    return NextResponse.json({ error: 'Location ID not configured' }, { status: 400 });
  }

  try {
    const data: any = await fetchGoogleReviews(LOCATION_ID);
    const googleReviews = data.reviews || [];

    for (const rev of googleReviews) {
      // Logic to sync with local 'reviews' table
      // We check if review exists (using a custom identifier or content/author/time match)
      // For now, we'll just log and suggest the logic
      console.log('Syncing review from:', rev.authorName);
      
      // Example upsert (Drizzle)
      /*
      await db.insert(reviews).values({
        jobId: null, // Google reviews might not be linked to a specific job in our system initially
        customerId: null, // Link to customer if email/name matches
        rating: rev.starRating === 'FIVE' ? 5 : 4, // Map rating
        content: rev.comment,
        source: 'google',
        isPublished: true,
        createdAt: new Date(rev.createTime),
      }).onConflictDoNothing();
      */
    }

    return NextResponse.json({ success: true, count: googleReviews.length });
  } catch (error) {
    console.error('Failed to sync reviews:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

if (GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });
}

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
export const mybusinessbusinessinformation = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client });
export const mybusinessverifications = google.mybusinessverifications({ version: 'v1', auth: oauth2Client });
// Note: GBP Management API (Reviews, Posts) often requires specialized setup as it's not in the main googleapis package sometimes, 
// but we'll use the generic discovery or rest client if needed.
// For now, we'll use the mybusinessbusinessinformation for location details.

/**
 * GBP Automated 'What's New' Post
 */
export async function createGBPPost(locationId: string, text: string, imageUrl?: string) {
  const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client });
  // The posts API is technically part of the My Business Business Information or a separate My Business API
  // We'll mock the actual API call structure for the specific endpoint
  try {
    // Reference: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
    const url = `https://mybusiness.googleapis.com/v4/locations/${locationId}/localPosts`;
    const res = await oauth2Client.request({
      url,
      method: 'POST',
      data: {
        languageCode: 'en-GB',
        summary: text,
        callToAction: {
          actionType: 'CALL',
        },
        media: imageUrl ? [{
          mediaFormat: 'PHOTO',
          sourceUrl: imageUrl,
        }] : [],
        topicType: 'STANDARD',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating GBP post:', error);
    throw error;
  }
}

/**
 * Fetch Google Reviews
 */
export async function fetchGoogleReviews(locationId: string) {
  try {
    // Reference: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
    const url = `https://mybusiness.googleapis.com/v4/locations/${locationId}/reviews`;
    const res = await oauth2Client.request({
      url,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    throw error;
  }
}

/**
 * Check Technician Availability (Google Calendar FreeBusy)
 */
export async function checkAvailability(calendarId: string, timeMin: string, timeMax: string) {
  try {
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });
    return res.data.calendars?.[calendarId]?.busy || [];
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

/**
 * Create Calendar Event (Automated Job Dispatch)
 */
export async function createJobEvent(calendarId: string, details: {
  summary: string;
  location: string;
  description: string;
  start: string;
  end: string;
}) {
  try {
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: details.summary,
        location: details.location,
        description: details.description,
        start: { dateTime: details.start },
        end: { dateTime: details.end },
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

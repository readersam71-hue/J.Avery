// Twilio WhatsApp Business API Integration for J.Avery Plumbing & Heating
// Handles automated follow-up sequences and review requests

import Twilio from 'twilio';
import { Redis } from '@upstash/redis';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;

export const twilioClient = accountSid && authToken 
  ? Twilio(accountSid, authToken) 
  : null;

// Initialize Redis for follow-up queue
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// ============================================
// MESSAGE TEMPLATES
// ============================================

export interface MessageTemplate {
  name: string;
  variables: string[];
  content: string;
}

// Follow-up sequence templates (7-touch system)
export const QUOTE_TEMPLATES: Record<string, MessageTemplate> = {
  day1_thankyou: {
    name: 'quote_day1_thankyou',
    variables: ['customer_name', 'service_type', 'quote_summary'],
    content: `Hi {{1}}! 🛠️ Thanks for choosing J.Avery Plumbing!
    
Your quote for {{2}} is ready. Here's the breakdown:
{{3}}

This quote is valid for 48 hours. Ready to transform your home? Reply YES to accept or call us to discuss.

- James & the J.Avery Team`
  },
  day2_social_proof: {
    name: 'quote_day2_social_proof',
    variables: ['customer_name'],
    content: `Hi {{1}}! 👋 Just wanted to share what some of our customers say:

"James transformed our bathroom and we couldn't be happier. Clean, professional, on time. Highly recommend!" - Birmingham Customer

We'd love to earn your trust too. Questions about your quote? Just reply!`
  },
  day3_personal: {
    name: 'quote_day3_personal',
    variables: ['customer_name'],
    content: `Hi {{1}}, it's James here (owner of J.Avery Plumbing). 👋

I personally wanted to check in. Did you have any questions about your quote? I know choosing a plumber is important - we take that trust seriously.

No pressure - just here if you need anything. Reply anytime!

- James`
  },
  day5_case_study: {
    name: 'quote_day5_case_study',
    variables: ['customer_name'],
    content: `Hi {{1}}! 📸 Check out this recent transformation we completed in Wylde Green:

Complete bathroom renovation - new tiles, modern fixtures, clean finish. Our customers love the attention to detail!

We'd love to do the same for you! Your quote is still valid - just reply to get started.

Questions? We're here! 🛠️`
  },
  day7_offer: {
    name: 'quote_day7_offer',
    variables: ['customer_name'],
    content: `Hi {{1}}! ⏰ Just a quick note - your quote expires soon.

I'd like to offer you £25 off your booking if you decide to move forward this week. Just mention this message!

Ready to get started? Reply YES and we'll get you booked in.

- James`
  },
  day10_final: {
    name: 'quote_day10_final',
    variables: ['customer_name'],
    content: `Hi {{1}} - James here. 👋

I wanted to reach out one more time about your quote. I understand life gets busy!

If there's anything we can do differently, or if you have questions - we're happy to adjust. Your satisfaction is our priority.

Let us know how we can help!

- James & Team J.Avery 🛠️`
  }
};

export const REVIEW_TEMPLATE: MessageTemplate = {
  name: 'review_request',
  variables: ['customer_name', 'service_completed', 'review_link'],
  content: `Hi {{1}}! 👋 

Thanks for choosing J.Avery Plumbing! We hope you loved the {{2}} we completed.

We'd really appreciate it if you could take 30 seconds to leave us a review:
{{3}}

Every review helps us help more Birmingham families!

- James 🙏`
};

export const EMERGENCY_AUTO_REPLY: MessageTemplate = {
  name: 'emergency_auto_reply',
  variables: ['customer_name'],
  content: `Hi {{1}}! 🚨 

We see you need emergency help. Our team has been notified and will contact you within MINUTES.

If you can, please call us directly: [EMERGENCY_NUMBER] - we're standing by 24/7.

- J.Avery Emergency Team`
};

// ============================================
// FUNCTIONS
// ============================================

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  toPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient || !whatsappFrom) {
    console.warn('Twilio not configured - WhatsApp features disabled');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const formattedTo = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    
    const result = await twilioClient.messages.create({
      from: whatsappFrom,
      to: formattedTo,
      body: message,
    });

    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error('Twilio send error:', error?.message);
    return { success: false, error: error?.message || 'Send failed' };
  }
}

/**
 * Send template message (interpolates variables)
 */
export function interpolateTemplate(
  template: MessageTemplate,
  variables: string[]
): string {
  let content = template.content;
  variables.forEach((value, index) => {
    const placeholder = `{{${index + 1}}}`;
    content = content.replace(placeholder, value);
  });
  return content;
}

/**
 * Queue a follow-up message for later delivery
 */
export async function queueFollowUp(
  leadId: string,
  customerPhone: string,
  customerName: string,
  day: number,
  templateKey: string
): Promise<void> {
  if (!redis) {
    console.warn('Redis not configured - follow-up queue disabled');
    return;
  }

  const template = QUOTE_TEMPLATES[templateKey];
  if (!template) return;

  const content = interpolateTemplate(template, [customerName]);
  const deliveryTime = Date.now() + (day * 24 * 60 * 60 * 1000);
  
  await redis.zadd('followup_queue', {
    score: deliveryTime,
    member: JSON.stringify({
      leadId,
      customerPhone,
      customerName,
      templateKey,
      content,
      scheduledFor: new Date(deliveryTime).toISOString(),
    }),
  });
}

/**
 * Queue review request (sent 2 hours after job completion)
 */
export async function queueReviewRequest(
  jobId: string,
  customerId: string,
  customerPhone: string,
  customerName: string,
  serviceCompleted: string
): Promise<void> {
  if (!redis) return;

  const reviewLink = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || 'https://g.page/review';
  const content = interpolateTemplate(REVIEW_TEMPLATE, [customerName, serviceCompleted, reviewLink]);
  const deliveryTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

  await redis.zadd('review_queue', {
    score: deliveryTime,
    member: JSON.stringify({
      jobId,
      customerId,
      customerPhone,
      content,
      scheduledFor: new Date(deliveryTime).toISOString(),
    }),
  });
}

/**
 * Send emergency auto-reply
 */
export async function sendEmergencyAutoReply(
  phone: string,
  customerName: string
): Promise<void> {
  const content = interpolateTemplate(EMERGENCY_AUTO_REPLY, [customerName]);
  await sendWhatsAppMessage(phone, content);
}

/**
 * Process pending follow-ups from queue
 */
export async function processFollowUpQueue(): Promise<{ processed: number; errors: number }> {
  if (!redis) return { processed: 0, errors: 0 };

  const now = Date.now();
  let processed = 0;
  let errors = 0;

  const dueItems = await redis.zrange<string[]>('followup_queue', 0, now, { byScore: true });
  
  for (const item of dueItems) {
    try {
      const data = JSON.parse(item);
      const result = await sendWhatsAppMessage(data.customerPhone, data.content);
      
      if (result.success) {
        await redis.zrem('followup_queue', item);
        processed++;
      } else {
        errors++;
      }
    } catch (error) {
      errors++;
    }
  }

  return { processed, errors };
}
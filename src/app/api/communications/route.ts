// Communications API - Send WhatsApp/SMS messages
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, interpolateTemplate, QUOTE_TEMPLATES, REVIEW_TEMPLATE } from '@/lib/twilio';

interface SendMessageRequest {
  to: string;
  template?: string;
  variables?: string[];
  message?: string;
  type?: 'whatsapp' | 'sms';
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();

    if (!body.to) {
      return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
    }

    let content: string;

    if (body.message) {
      content = body.message;
    } else if (body.template) {
      const template = body.template === 'review_request' 
        ? REVIEW_TEMPLATE 
        : QUOTE_TEMPLATES[body.template];
      
      if (!template) {
        return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
      }
      content = interpolateTemplate(template, body.variables || []);
    } else {
      return NextResponse.json({ error: 'Must provide message or template' }, { status: 400 });
    }

    const result = await sendWhatsAppMessage(body.to, content);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Communications error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    templates: {
      quote: Object.keys(QUOTE_TEMPLATES),
      review: REVIEW_TEMPLATE.name,
    },
  });
}
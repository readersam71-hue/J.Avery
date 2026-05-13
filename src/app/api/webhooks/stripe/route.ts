// Stripe Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, handlePaymentSuccess, stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err: any) {
    console.error('Webhook verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      const result = await handlePaymentSuccess(paymentIntent);
      console.log('Payment processed:', result);
      
      // TODO: Update quote status, create job, trigger follow-ups
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
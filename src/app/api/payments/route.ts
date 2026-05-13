// Payments API - Create Stripe Payment Intents
import { NextRequest, NextResponse } from 'next/server';
import { createDepositPaymentIntent, createFinalPaymentIntent, calculateDeposit } from '@/lib/stripe';

interface CreatePaymentRequest {
  quoteId: string;
  leadId?: string;
  customerEmail: string;
  amount: number;
  type: 'deposit' | 'final';
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json();

    if (!body.quoteId || !body.customerEmail || !body.amount || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let paymentIntent;
    
    if (body.type === 'deposit') {
      paymentIntent = await createDepositPaymentIntent(
        body.amount,
        body.customerEmail,
        body.leadId || body.quoteId,
        body.description || 'Service quote'
      );
    } else {
      paymentIntent = await createFinalPaymentIntent(
        body.amount,
        body.customerEmail,
        body.quoteId,
        body.description || 'Service quote'
      );
    }

    const depositAmount = calculateDeposit(body.amount);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      type: body.type,
      depositAmount: body.type === 'deposit' ? depositAmount : null,
      currency: 'gbp',
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
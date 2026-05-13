// Stripe Integration for J.Avery Plumbing & Heating
// Handles deposits (50% for jobs > £500), payments, and Stripe webhooks

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features disabled');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
});

// Constants for payment configuration
export const DEPOSIT_PERCENTAGE = 50;
export const DEPOSIT_THRESHOLD = 500; // £500 minimum for required deposit

/**
 * Calculate deposit amount for a quote
 * - Jobs over £500 require 50% deposit
 * - Jobs under £500 may have deposit waived or reduced
 */
export function calculateDeposit(totalAmount: number): number {
  if (totalAmount > DEPOSIT_THRESHOLD) {
    return totalAmount * (DEPOSIT_PERCENTAGE / 100);
  }
  // For smaller jobs, 25% deposit
  return totalAmount * 0.25;
}

/**
 * Create a Stripe Payment Intent for deposit
 */
export async function createDepositPaymentIntent(
  amount: number,
  customerEmail: string,
  leadId: string,
  description: string
): Promise<Stripe.PaymentIntent> {
  const depositAmount = calculateDeposit(amount);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(depositAmount * 100), // Stripe uses pence
    currency: 'gbp',
    receipt_email: customerEmail,
    description: `Deposit for ${description}`,
    metadata: {
      lead_id: leadId,
      type: 'deposit',
      total_amount: amount.toString(),
      deposit_amount: depositAmount.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
  
  return paymentIntent;
}

/**
 * Create final payment intent (after deposit)
 */
export async function createFinalPaymentIntent(
  amount: number,
  customerEmail: string,
  jobId: string,
  description: string
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'gbp',
    receipt_email: customerEmail,
    description: `Final payment for ${description}`,
    metadata: {
      job_id: jobId,
      type: 'final',
      amount: amount.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
  
  return paymentIntent;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<{ type: 'deposit' | 'final'; leadId?: string; jobId?: string }> {
  const metadata = paymentIntent.metadata;
  
  if (metadata.type === 'deposit') {
    return {
      type: 'deposit',
      leadId: metadata.lead_id,
    };
  }
  
  return {
    type: 'final',
    jobId: metadata.job_id,
  };
}

/**
 * Format amount for display
 */
export function formatAmount(amountInPence: number): string {
  return `£${(amountInPence / 100).toFixed(2)}`;
}
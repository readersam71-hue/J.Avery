// Referral & Loyalty System - J.Avery Plumbing & Heating
// Phase 3: Turn customers into salespeople

import { db } from '../db';
import { customers, jobs, payments, maintenanceContracts } from '../db/schema';
import { eq, and, lt, gte, desc, sql } from 'drizzle-orm';
import { sendWhatsAppMessage } from './twilio';

// ============================================
// REFERRAL PROGRAM
// ============================================

export interface ReferralCode {
  code: string;
  customerId: string;
  generatedAt: Date;
  usesCount: number;
  discountAmount: number; // in pounds
  validUntil?: Date;
}

/**
 * Generate a unique referral code for a customer
 */
export function generateReferralCode(customerId: string, firstName: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const initials = firstName.substring(0, 2).toUpperCase();
  return `JAVERY${initials}${timestamp.slice(-4)}`;
}

/**
 * Get or create referral code for customer
 */
export async function getReferralCode(customerId: string, discountAmount = 50) {
  // Check if customer already has a referral code
  // For now, generate a new one (in production, store and retrieve from DB)
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) return null;

  const code = generateReferralCode(customerId, customer.firstName);
  
  return {
    code,
    customerId,
    customerName: `${customer.firstName} ${customer.lastName}`,
    generatedAt: new Date(),
    usesCount: 0,
    discountAmount,
  };
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(code: string) {
  // In production, look up in referral_codes table
  // For now, check format
  if (!code.startsWith('JAVERY') || code.length < 12) {
    return { valid: false, reason: 'Invalid referral code format' };
  }

  return { 
    valid: true, 
    discountAmount: 50,
    message: 'Referral code validated - £50 discount will be applied to your next service!' 
  };
}

/**
 * Record a referral conversion
 */
export async function recordReferralConversion(
  referralCode: string,
  newCustomerId: string,
  jobId: string
) {
  // In production:
  // 1. Look up referral by code
  // 2. Create referral record linking referrer to new customer
  // 3. Apply discount to referrer's next service
  // 4. Send notification to referrer

  const notification = {
    referralCode,
    newCustomerId,
    jobId,
    convertedAt: new Date(),
    rewardStatus: 'pending',
  };

  // Notify referrer via WhatsApp
  // await sendWhatsAppMessage(referrerPhone, `🎉 Great news! Your referral resulted in a new job! You'll get £50 off your next service. - J.Avery Team`);

  return notification;
}

/**
 * Calculate referral reward eligibility
 */
export async function getReferralRewardStatus(customerId: string) {
  // Count successful referrals
  // Check if there's a pending reward to claim
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) return null;

  return {
    customerId,
    customerName: `${customer.firstName} ${customer.lastName}`,
    referralCode: generateReferralCode(customerId, customer.firstName),
    totalReferrals: 0, // Would query referral table
    pendingRewards: 0,
    earnedRewards: 0,
    nextRewardAt: 1, // referrals needed for next reward
  };
}

// ============================================
// LOYALTY TIERS
// ============================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  minLTV: number;
  discountPercent: number;
  benefits: string[];
}

// Tier thresholds based on project brief
export const LOYALTY_TIERS: Record<LoyaltyTier, LoyaltyTierInfo> = {
  bronze: {
    tier: 'bronze',
    minLTV: 0,
    discountPercent: 0,
    benefits: ['Birthday greeting', 'Priority booking'],
  },
  silver: {
    tier: 'silver',
    minLTV: 500,
    discountPercent: 5,
    benefits: ['Birthday greeting', 'Priority booking', '5% off repairs', 'Annual check-up reminder'],
  },
  gold: {
    tier: 'gold',
    minLTV: 2000,
    discountPercent: 10,
    benefits: ['Birthday greeting', 'Priority booking', '10% off repairs', 'Free annual check-up', 'White-glove service', 'Same-day response'],
  },
};

/**
 * Calculate customer lifetime value
 */
export async function calculateCustomerLTV(customerId: string): Promise<number> {
  // Sum all successful payments from customer
  const result = await db.query.jobs.findMany({
    where: eq(jobs.customerId, customerId),
    with: {
      payments: true,
    },
  });

  let total = 0;
  for (const job of result) {
    for (const payment of job.payments) {
      if (payment.status === 'succeeded') {
        total += parseFloat(payment.amount);
      }
    }
  }

  return total;
}

/**
 * Determine customer's loyalty tier based on LTV and contracts
 */
export async function getCustomerLoyaltyTier(customerId: string): Promise<LoyaltyTier> {
  const ltv = await calculateCustomerLTV(customerId);
  
  // Check for active maintenance contract (boosts tier)
  const activeContract = await db.query.maintenanceContracts.findFirst({
    where: and(
      eq(maintenanceContracts.customerId, customerId),
      eq(maintenanceContracts.status, 'active')
    ),
  });

  // Gold: £2000+ LTV OR Gold contract holder
  if (ltv >= LOYALTY_TIERS.gold.minLTV || (activeContract && activeContract.tier === 'gold')) {
    return 'gold';
  }

  // Silver: £500+ LTV OR Silver/Gold contract holder
  if (ltv >= LOYALTY_TIERS.silver.minLTV || activeContract) {
    return 'silver';
  }

  // Bronze: everyone else
  return 'bronze';
}

/**
 * Get tier benefits for a customer
 */
export async function getCustomerBenefits(customerId: string) {
  const tier = await getCustomerLoyaltyTier(customerId);
  const tierInfo = LOYALTY_TIERS[tier];
  const ltv = await calculateCustomerLTV(customerId);
  
  return {
    tier,
    ...tierInfo,
    currentLTV: ltv,
    progressToNextTier: tier === 'gold' ? 100 : Math.min(100, (ltv / LOYALTY_TIERS[tier === 'bronze' ? 'silver' : 'gold'].minLTV) * 100),
    nextTierAt: tier === 'bronze' ? LOYALTY_TIERS.silver.minLTV : LOYALTY_TIERS.gold.minLTV,
  };
}

/**
 * Apply tier discount to a quote
 */
export async function applyTierDiscount(
  customerId: string,
  quoteAmount: number,
  serviceType: 'repair' | 'installation' | 'maintenance' = 'repair'
): Promise<{ discount: number; finalAmount: number; tier: LoyaltyTier }> {
  const tier = await getCustomerLoyaltyTier(customerId);
  const tierInfo = LOYALTY_TIERS[tier];

  // Only apply discount to repairs for silver/gold
  if (serviceType !== 'repair' || tierInfo.discountPercent === 0) {
    return { discount: 0, finalAmount: quoteAmount, tier };
  }

  const discount = quoteAmount * (tierInfo.discountPercent / 100);
  return {
    discount: Math.round(discount * 100) / 100,
    finalAmount: Math.round((quoteAmount - discount) * 100) / 100,
    tier,
  };
}

// ============================================
// WIN-BACK CAMPAIGNS
// ============================================

export interface DormantCustomer {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  lastJobDate: Date;
  monthsSinceLastJob: number;
  estimatedLTV: number;
  suggestedOffer: string;
}

/**
 * Find customers who haven't had a job in 2+ years
 */
export async function findDormantCustomers(monthsThreshold = 24) {
  const thresholdDate = new Date();
  thresholdDate.setMonth(thresholdDate.getMonth() - monthsThreshold);

  // Get all customers with their last job date
  const allCustomers = await db.query.customers.findMany({
    with: {
      jobs: {
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
        limit: 1,
      },
    },
  });

  const dormant: DormantCustomer[] = [];

  for (const customer of allCustomers) {
    const lastJob = customer.jobs[0];
    if (!lastJob) continue;

    const lastJobDate = new Date(lastJob.createdAt);
    if (lastJobDate < thresholdDate) {
      const monthsSinceLastJob = Math.floor(
        (Date.now() - lastJobDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
      );

      dormant.push({
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        lastJobDate,
        monthsSinceLastJob,
        estimatedLTV: 0, // Would calculate from job history
        suggestedOffer: monthsSinceLastJob > 36 ? '£75 off your next service' : '£50 off your next service',
      });
    }
  }

  return dormant.sort((a, b) => b.monthsSinceLastJob - a.monthsSinceLastJob);
}

/**
 * Trigger win-back campaign for a customer
 */
export async function triggerWinBackCampaign(customerId: string, offerAmount = 50) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) return { success: false, error: 'Customer not found' };

  const offer = offerAmount >= 50 ? `£${offerAmount} off your next service` : 'Special discount offer';
  
  const message = `Hi ${customer.firstName}! 👋 We miss you at J.Avery Plumbing!

It's been a while since your last visit, and we wanted to give you an exclusive offer:
${offer}

We'd love to catch up and show you what we've been working on. Book within 30 days and mention this message!

- James & the J.Avery Team 🛠️`;

  // Send via WhatsApp
  if (customer.phone) {
    await sendWhatsAppMessage(customer.phone, message);
  }

  return {
    success: true,
    customerId,
    customerName: `${customer.firstName} ${customer.lastName}`,
    offer,
    channel: customer.phone ? 'whatsapp' : 'email',
  };
}

/**
 * Send win-back campaigns to all dormant customers
 */
export async function sendWinBackCampaigns(offerAmount = 50) {
  const dormant = await findDormantCustomers(24);
  
  let sent = 0;
  let failed = 0;
  const results = [];

  for (const customer of dormant) {
    try {
      const result = await triggerWinBackCampaign(customer.customerId, offerAmount);
      if (result.success) {
        sent++;
        results.push(result);
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { sent, failed, totalDormant: dormant.length, results };
}

// ============================================
// BIRTHDAY & MILESTONE GREETINGS
// ============================================

/**
 * Get customers with birthdays this week
 */
export async function getCustomersWithBirthdaysThisWeek() {
  // In production, customers table would have birthdate field
  // For now, return empty array
  return [];
}

/**
 * Send birthday greeting
 */
export async function sendBirthdayGreeting(customerId: string) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) return { success: false };

  const message = `Happy Birthday, ${customer.firstName}! 🎂

From all of us at J.Avery Plumbing, we hope you have an amazing day!

As our gift to you, here's a special birthday offer - book any service this month and receive a discount.

Thank you for being part of the J.Avery family!

- James & Team J.Avery 🛠️`;

  if (customer.phone) {
    await sendWhatsAppMessage(customer.phone, message);
  }

  return { success: true, customerId, channel: customer.phone ? 'whatsapp' : 'email' };
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get loyalty program statistics
 */
export async function getLoyaltyProgramStats() {
  const allCustomers = await db.query.customers.findMany({
    with: {
      jobs: {
        with: {
          payments: true,
        },
      },
      contracts: {
        where: eq(maintenanceContracts.status, 'active'),
      },
    },
  });

  const tierCounts = { bronze: 0, silver: 0, gold: 0 };
  const totalLTV = { bronze: 0, silver: 0, gold: 0 };
  const totalReferrals = 0; // Would query referral table

  for (const customer of allCustomers) {
    const ltv = customer.jobs.reduce((sum, job) => {
      return sum + job.payments
        .filter(p => p.status === 'succeeded')
        .reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
    }, 0);

    // Determine tier
    if (ltv >= LOYALTY_TIERS.gold.minLTV || customer.contracts.some(c => c.tier === 'gold')) {
      tierCounts.gold++;
      totalLTV.gold += ltv;
    } else if (ltv >= LOYALTY_TIERS.silver.minLTV || customer.contracts.length > 0) {
      tierCounts.silver++;
      totalLTV.silver += ltv;
    } else {
      tierCounts.bronze++;
      totalLTV.bronze += ltv;
    }
  }

  return {
    totalCustomers: allCustomers.length,
    tierCounts,
    totalLTV,
    totalReferrals,
    averageLTV: allCustomers.length > 0 
      ? (totalLTV.bronze + totalLTV.silver + totalLTV.gold) / allCustomers.length 
      : 0,
    // Would include referral conversion rate, win-back campaign stats, etc.
  };
}

/**
 * Get high-value customers (£5000+ lifetime)
 */
export async function getHighValueCustomers(minLTV = 5000) {
  const allCustomers = await db.query.customers.findMany({
    with: {
      jobs: {
        with: {
          payments: true,
        },
      },
    },
  });

  return allCustomers
    .map(customer => ({
      ...customer,
      ltv: customer.jobs.reduce((sum, job) => {
        return sum + job.payments
          .filter(p => p.status === 'succeeded')
          .reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
      }, 0),
    }))
    .filter(c => c.ltv >= minLTV)
    .sort((a, b) => b.ltv - a.ltv);
}
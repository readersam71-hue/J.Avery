// Drizzle ORM Database Client - J.Avery Plumbing & Heating
// Uses the schema from architect: /home/team/shared/javery-plumbing-platform/src/db/schema.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  customers, leads, quotes, jobs, reviews, equipment, 
  maintenanceContracts, payments, teamMembers, notifications 
} from './schema';

const connectionString = process.env.DATABASE_URL;

// For query building - never connects directly
const queryClient = postgres(connectionString || '', { 
  prepare: false,
  max: 10,
});

// Drizzle instance
export const db = drizzle(queryClient, {
  schema: {
    customers,
    leads,
    quotes,
    jobs,
    reviews,
    equipment,
    maintenanceContracts,
    payments,
    teamMembers,
    notifications,
  },
});

// Export schema for use in other modules
export * from './schema';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate customer lifetime value from database
 */
export async function calculateCustomerLTV(customerId: string): Promise<number> {
  const result = await db.query.jobs.findMany({
    where: (jobs, { eq }) => eq(jobs.customerId, customerId),
    with: {
      payments: true,
    },
  });
  
  return (result as any).reduce((sum: number, job: any) => {
    return sum + (job.payments || []).reduce((pSum: number, p: any) => {
      if (p.status === 'succeeded') {
        return pSum + parseFloat(p.amount);
      }
      return pSum;
    }, 0);
  }, 0);
}

/**
 * Get lead with customer info
 */
export async function getLeadWithCustomer(leadId: string) {
  return db.query.leads.findFirst({
    where: (leads, { eq }) => eq(leads.id, leadId),
    with: {
      customer: true,
      quotes: {
        orderBy: (quotes: any, { desc }: any) => [desc(quotes.createdAt)],
        limit: 1,
      },
    },
  });
}

/**
 * Get customer job history
 */
export async function getCustomerJobHistory(customerId: string) {
  return db.query.jobs.findMany({
    where: (jobs, { eq }) => eq(jobs.customerId, customerId),
    with: {
      reviews: true,
      payments: true,
    },
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
  });
}

/**
 * Get equipment due for service (within specified days)
 */
export async function getEquipmentDueForService(daysAhead = 42) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const now = new Date();
  
  return db.query.equipment.findMany({
    where: (equipment: any, { and, lte, gte }: any) => and(
      lte(equipment.nextServiceDue, futureDate.toISOString().split('T')[0]),
      gte(equipment.nextServiceDue, now.toISOString().split('T')[0])
    ),
    with: {
      customer: true,
    },
    orderBy: (equipment: any, { asc }: any) => [asc(equipment.nextServiceDue)],
  });
}

/**
 * Get expiring maintenance contracts (within specified days)
 */
export async function getExpiringContracts(daysAhead = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const now = new Date();
  
  return db.query.maintenanceContracts.findMany({
    where: (contracts: any, { and, eq, lte, gte }: any) => and(
      eq(contracts.status, 'active'),
      lte(contracts.endDate, futureDate),
      gte(contracts.endDate, now)
    ),
    with: {
      customer: true,
    },
  });
}

/**
 * Get pending notifications
 */
export async function getPendingNotifications(limit = 50) {
  return db.query.notifications.findMany({
    where: (notifications, { eq }) => eq(notifications.status, 'pending'),
    orderBy: (notifications, { asc }) => [asc(notifications.createdAt)],
    limit,
  });
}

/**
 * Get Leads (Ordered by Priority and Date)
 */
export async function getLeads() {
  return db.query.leads.findMany({
    with: {
      customer: true,
    },
    orderBy: (leads, { desc, sql }) => [
      // Priority ordering: emergency first
      sql`CASE 
        WHEN ${leads.priority} = 'emergency' THEN 1 
        WHEN ${leads.priority} = 'high' THEN 2
        WHEN ${leads.priority} = 'medium' THEN 3
        ELSE 4 
      END ASC`,
      desc(leads.createdAt),
    ],
  });
}

/**
 * Mark notification as sent
 */
export async function markNotificationSent(notificationId: string) {
  await db.update(notifications)
    .set({ 
      status: 'sent',
      sentAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

/**
 * Create a new lead with customer
 */
export async function createLeadWithCustomer(data: {
  source: 'website' | 'phone' | 'referral' | 'gbp';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  inquiryDetails: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
}) {
  // Create customer first
  const [customer] = await db.insert(customers).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    postcode: data.postcode,
  }).returning();
  
  // Create lead
  const [lead] = await db.insert(leads).values({
    customerId: customer.id,
    source: data.source,
    priority: data.priority,
    inquiryDetails: data.inquiryDetails,
  }).returning();
  
  return { lead, customer };
}

/**
 * Get Analytics for Dashboard
 */
export async function getDashboardAnalytics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 1. Today's Revenue
  const todayPayments = await db.query.payments.findMany({
    where: (payments, { and, gte, eq }) => and(
      gte(payments.createdAt, startOfToday),
      eq(payments.status, 'succeeded')
    ),
  });
  
  const todayRevenue = todayPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

  // 2. Conversion Rate (Accepted vs Sent in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentQuotes = await db.query.quotes.findMany({
    where: (quotes, { gte }) => gte(quotes.createdAt, thirtyDaysAgo),
  });
  
  const sentQuotes = (recentQuotes as any[]).filter(q => q.status !== 'draft');
  const acceptedQuotes = sentQuotes.filter(q => q.status === 'accepted');
  const conversionRate = sentQuotes.length > 0 ? (acceptedQuotes.length / sentQuotes.length) * 100 : 0;

  // 3. Average Job Value (last 30 days)
  const completedJobs = await db.query.jobs.findMany({
    where: (jobs, { and, eq, gte }) => and(
      eq(jobs.status, 'completed'),
      gte(jobs.actualCompletion, thirtyDaysAgo)
    ),
    with: {
      quote: true,
    },
  });
  
  const totalJobValue = (completedJobs as any[]).reduce((sum: number, job: any) => sum + parseFloat(job.quote?.totalAmount || '0'), 0);
  const avgJobValue = completedJobs.length > 0 ? totalJobValue / completedJobs.length : 0;

  // 4. Technician ROI
  const techs = await db.query.teamMembers.findMany({
    where: (teamMembers, { eq }) => eq(teamMembers.role, 'tech'),
  });

  const techROI = await Promise.all(techs.map(async (tech) => {
    const techJobs = await db.query.jobs.findMany({
      where: (jobs, { and, eq, gte }) => and(
        eq(jobs.assignedTechId, tech.id),
        eq(jobs.status, 'completed'),
        gte(jobs.actualCompletion, thirtyDaysAgo)
      ),
      with: {
        quote: true,
      }
    });
    
    const revenue = (techJobs as any[]).reduce((sum: number, job: any) => sum + parseFloat(job.quote?.totalAmount || '0'), 0);
    return {
      name: tech.name,
      revenue,
      jobCount: techJobs.length,
    };
  }));

  return {
    todayRevenue,
    conversionRate,
    avgJobValue,
    techROI,
  };
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost') {
  await db.update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, leadId));
}

/**
 * Create quote
 */
export async function createQuote(data: {
  leadId: string;
  customerId: string;
  validUntil: Date;
  tierGoodDetails?: object;
  tierBetterDetails?: object;
  tierBestDetails?: object;
  totalAmount: string;
  depositAmount: string;
}) {
  const [quote] = await db.insert(quotes).values({
    leadId: data.leadId,
    customerId: data.customerId,
    validUntil: data.validUntil,
    tierGoodDetails: data.tierGoodDetails,
    tierBetterDetails: data.tierBetterDetails,
    tierBestDetails: data.tierBestDetails,
    totalAmount: data.totalAmount,
    depositAmount: data.depositAmount,
    status: 'draft',
  }).returning();
  
  return quote;
}

/**
 * Create Smart 3-Tier Quote
 */
export async function createSmartQuote(data: {
  leadId: string;
  customerId: string;
  jobType: 'boiler' | 'bathroom' | 'emergency' | 'maintenance';
}) {
  const validUntil = new Date();
  validUntil.setHours(validUntil.getHours() + 48); // 48 hour expiration

  let tierGoodDetails = {};
  let tierBetterDetails = {};
  let tierBestDetails = {};
  let totalAmount = '0';
  let depositAmount = '0';

  // Automated suggestions based on job type
  switch (data.jobType) {
    case 'boiler':
      tierGoodDetails = { title: 'Basic Repair', items: ['Fault diagnosis', 'Minor parts replacement'], price: '150' };
      tierBetterDetails = { title: 'Full Service & Repair', items: ['Full boiler service', 'Parts replacement', '1-year warranty'], price: '250' };
      tierBestDetails = { title: 'System Upgrade', items: ['New high-efficiency boiler', 'Smart thermostat install', '10-year warranty'], price: '3500' };
      totalAmount = '250'; // Default to 'Better' for placeholder
      depositAmount = '0';
      break;
    case 'bathroom':
      tierGoodDetails = { title: 'Refresh', items: ['Grout replacement', 'New taps', 'Silicone reseal'], price: '450' };
      tierBetterDetails = { title: 'Standard Refit', items: ['New suite (bath/toilet/sink)', 'Tiling', 'Basic plumbing'], price: '4500' };
      tierBestDetails = { title: 'Luxury Transformation', items: ['Full bespoke design', 'Underfloor heating', 'High-end fixtures'], price: '8500' };
      totalAmount = '4500';
      depositAmount = '2250'; // 50% deposit
      break;
    case 'emergency':
      tierGoodDetails = { title: 'Temporary Fix', items: ['Leak containment', 'Shut-off'], price: '90' };
      tierBetterDetails = { title: 'Full Repair', items: ['Parts & Labour for permanent fix'], price: '180' };
      tierBestDetails = { title: 'System Protection', items: ['Full repair', 'Water hammer arrestor install'], price: '280' };
      totalAmount = '180';
      depositAmount = '0';
      break;
    default:
      tierGoodDetails = { title: 'Standard Service', items: ['Inspection'], price: '80' };
      tierBetterDetails = { title: 'Premium Service', items: ['Inspection', 'Minor adjustments'], price: '120' };
      tierBestDetails = { title: 'Total Peace of Mind', items: ['Inspection', 'Annual contract signup'], price: '200' };
      totalAmount = '120';
      depositAmount = '0';
  }

  const [quote] = await db.insert(quotes).values({
    leadId: data.leadId,
    customerId: data.customerId,
    validUntil,
    tierGoodDetails,
    tierBetterDetails,
    tierBestDetails,
    totalAmount,
    depositAmount,
    status: 'sent',
  }).returning();

  // Mark lead as quoted
  await updateLeadStatus(data.leadId, 'quoted');

  return quote;
}

/**
 * Accept quote and create job
 */
export async function acceptQuoteAndCreateJob(quoteId: string, selectedTier: 'good' | 'better' | 'best') {
  // Update quote
  const [quote] = await db.update(quotes)
    .set({ 
      status: 'accepted',
      selectedTier,
      depositPaid: true,
    })
    .where(eq(quotes.id, quoteId))
    .returning();
  
  // Create job
  const [job] = await db.insert(jobs).values({
    quoteId: quote.id,
    customerId: quote.customerId,
    status: 'scheduled',
  }).returning();
  
  return { quote, job };
}
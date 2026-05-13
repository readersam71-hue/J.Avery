// Recurring Revenue Engine - J.Avery Plumbing & Heating
// Equipment tracking, service reminders, and maintenance contract management

import { db } from '../db';
import { equipment, maintenanceContracts, customers, notifications } from '../db/schema';
import { queueFollowUp } from './twilio';
import { eq, and, lte, gte, or } from 'drizzle-orm';

// ============================================
// EQUIPMENT TRACKING
// ============================================

export interface EquipmentInput {
  customerId: string;
  installedJobId?: string;
  type: string;
  make: string;
  model: string;
  serialNumber?: string;
  installationDate: Date;
  warrantyExpiry?: Date;
}

/**
 * Register new equipment (boiler, heating system, etc.)
 * Automatically sets next service due to 1 year from installation
 */
export async function registerEquipment(data: EquipmentInput) {
  const nextServiceDue = new Date(data.installationDate);
  nextServiceDue.setFullYear(nextServiceDue.getFullYear() + 1);

  const [newEquipment] = await db.insert(equipment).values({
    customerId: data.customerId,
    installedJobId: data.installedJobId,
    type: data.type,
    make: data.make,
    model: data.model,
    serialNumber: data.serialNumber,
    installationDate: data.installationDate,
    warrantyExpiry: data.warrantyExpiry,
    lastServiceDate: data.installationDate,
    nextServiceDue,
  }).returning();

  return newEquipment;
}

/**
 * Record a service for equipment
 * Updates lastServiceDate and calculates nextServiceDue (1 year)
 */
export async function recordEquipmentService(
  equipmentId: string,
  serviceDate: Date = new Date()
) {
  const nextServiceDue = new Date(serviceDate);
  nextServiceDue.setFullYear(nextServiceDue.getFullYear() + 1);

  await db.update(equipment)
    .set({
      lastServiceDate: serviceDate,
      nextServiceDue,
      updatedAt: new Date(),
    })
    .where(eq(equipment.id, equipmentId));

  return { equipmentId, serviceDate, nextServiceDue };
}

/**
 * Get all equipment due for service within specified days
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
 * Get equipment nearing warranty expiry (within 3 months)
 */
export async function getEquipmentNearingWarrantyExpiry(daysAhead = 90) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return db.query.equipment.findMany({
    where: (equipment: any, { and, lte, gte, isNotNull }: any) => and(
      isNotNull(equipment.warrantyExpiry),
      lte(equipment.warrantyExpiry, futureDate.toISOString().split('T')[0]),
      gte(equipment.warrantyExpiry, new Date().toISOString().split('T')[0])
    ),
    with: {
      customer: true,
    },
  });
}

/**
 * Get equipment by customer
 */
export async function getCustomerEquipment(customerId: string) {
  return db.query.equipment.findMany({
    where: eq(equipment.customerId, customerId),
    orderBy: (equipment, { desc }) => [desc(equipment.installationDate)],
  });
}

/**
 * Calculate equipment age and estimated remaining lifespan
 */
export function calculateEquipmentAgeAndLifespan(
  installationDate: Date,
  typicalLifespanYears = 15
) {
  const now = new Date();
  const ageInYears = (now.getTime() - installationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const remainingLifespan = Math.max(0, typicalLifespanYears - ageInYears);
  const percentRemaining = (remainingLifespan / typicalLifespanYears) * 100;

  return {
    ageInYears: Math.round(ageInYears * 10) / 10,
    remainingLifespanYears: Math.round(remainingLifespan * 10) / 10,
    percentRemaining: Math.round(percentRemaining),
    isEndOfLife: remainingLifespan <= 2,
    shouldRecommendReplacement: remainingLifespan <= 5,
  };
}

// ============================================
// MAINTENANCE CONTRACTS
// ============================================

export interface ContractInput {
  customerId: string;
  tier: 'bronze' | 'silver' | 'gold';
  startDate: Date;
  endDate: Date;
  monthlyPrice: number;
}

// Pricing tiers (can be adjusted)
export const CONTRACT_PRICES = {
  bronze: 15,      // £15/month = £180/year
  silver: 25,     // £25/month = £300/year
  gold: 40,       // £40/month = £480/year
};

export const CONTRACT_DISCOUNTS = {
  bronze: 0,       // No discount on repairs
  silver: 5,       // 5% discount on repairs
  gold: 10,       // 10% discount on repairs
};

/**
 * Create a new maintenance contract
 */
export async function createMaintenanceContract(data: ContractInput) {
  const [contract] = await db.insert(maintenanceContracts).values({
    customerId: data.customerId,
    tier: data.tier,
    startDate: data.startDate,
    endDate: data.endDate,
    monthlyPrice: data.monthlyPrice,
    status: 'active',
  }).returning();

  return contract;
}

/**
 * Renew an existing contract
 */
export async function renewContract(
  contractId: string,
  newEndDate: Date,
  newMonthlyPrice?: number
) {
  const [contract] = await db.update(maintenanceContracts)
    .set({
      endDate: newEndDate,
      monthlyPrice: newMonthlyPrice,
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(maintenanceContracts.id, contractId))
    .returning();

  return contract;
}

/**
 * Cancel a contract
 */
export async function cancelContract(contractId: string) {
  await db.update(maintenanceContracts)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(maintenanceContracts.id, contractId));
}

/**
 * Get contracts expiring within specified days
 */
export async function getExpiringContracts(daysAhead = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const now = new Date();

  return db.query.maintenanceContracts.findMany({
    where: and(
      eq(maintenanceContracts.status, 'active'),
      lte(maintenanceContracts.endDate, futureDate),
      gte(maintenanceContracts.endDate, now)
    ),
    with: {
      customer: true,
    },
  });
}

/**
 * Get active contract for customer
 */
export async function getCustomerActiveContract(customerId: string) {
  return db.query.maintenanceContracts.findFirst({
    where: and(
      eq(maintenanceContracts.customerId, customerId),
      eq(maintenanceContracts.status, 'active')
    ),
  });
}

/**
 * Get all active contracts
 */
export async function getAllActiveContracts() {
  return db.query.maintenanceContracts.findMany({
    where: eq(maintenanceContracts.status, 'active'),
    with: {
      customer: true,
    },
  });
}

/**
 * Calculate monthly recurring revenue from active contracts
 */
export async function calculateMonthlyRecurringRevenue() {
  const activeContracts = await getAllActiveContracts();
  
  return activeContracts.reduce((sum, contract) => {
    return sum + parseFloat(contract.monthlyPrice);
  }, 0);
}

// ============================================
// REMINDER SYSTEM
// ============================================

export interface ReminderData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  equipmentType: string;
  equipmentMake: string;
  equipmentModel: string;
  reminderType: 'service_due' | 'warranty_expiry' | 'contract_renewal' | 'annual_checkup';
  daysUntilDue: number;
}

/**
 * Create reminder notification for service due
 */
export async function createServiceReminder(data: ReminderData) {
  const urgencyLevel = data.daysUntilDue <= 7 ? 'urgent' : 
                       data.daysUntilDue <= 21 ? 'high' : 'normal';

  let message: string;
  switch (data.reminderType) {
    case 'service_due':
      message = `Hi ${data.customerName}! 🔧 Your ${data.equipmentType} (${data.equipmentMake} ${data.equipmentModel}) is due for its annual service in ${data.daysUntilDue} days. Book now to keep everything running smoothly! - J.Avery Team`;
      break;
    case 'warranty_expiry':
      message = `Hi ${data.customerName}! ⚠️ The warranty on your ${data.equipmentMake} ${data.equipmentModel} expires soon. Contact us to discuss coverage options! - J.Avery Team`;
      break;
    case 'contract_renewal':
      message = `Hi ${data.customerName}! 📋 Your J.Avery maintenance contract is due for renewal in ${data.daysUntilDue} days. Keep your priority service status - renew today! - James`;
      break;
    case 'annual_checkup':
      message = `Hi ${data.customerName}! 🔍 It's been a year since we checked your system. Let's schedule a quick check-up to make sure everything is running efficiently! - J.Avery Team`;
      break;
  }

  // Create notification record
  const [notification] = await db.insert(notifications).values({
    customerId: data.customerId,
    type: data.reminderType === 'contract_renewal' ? 'notification' : 'reminder',
    channel: 'whatsapp',
    content: { 
      message, 
      urgencyLevel,
      customerPhone: data.customerPhone,
      equipmentId: data.equipmentType,
      reminderType: data.reminderType,
    },
    status: 'pending',
  }).returning();

  return notification;
}

/**
 * Queue service reminders for all equipment due in next 6 weeks
 * Should be called daily by a cron job
 */
export async function queueServiceReminders() {
  const equipmentDue = await getEquipmentDueForService(42);
  const expiringContracts = await getExpiringContracts(60);

  let queued = 0;

  // Queue equipment service reminders
  for (const equip of equipmentDue) {
    if (!equip.customer) continue;

    const daysUntilDue = Math.ceil(
      (new Date(equip.nextServiceDue!).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    await createServiceReminder({
      customerId: equip.customerId,
      customerName: `${equip.customer.firstName} ${equip.customer.lastName}`,
      customerPhone: equip.customer.phone,
      customerEmail: equip.customer.email,
      equipmentType: equip.type,
      equipmentMake: equip.make,
      equipmentModel: equip.model,
      reminderType: 'service_due',
      daysUntilDue,
    });

    // Also queue follow-up via Twilio if phone available
    if (daysUntilDue <= 14 && equip.customer.phone) {
      await queueFollowUp(
        equip.customerId,
        equip.customer.phone,
        equip.customer.firstName,
        0, // Immediate (0 days)
        daysUntilDue <= 7 ? 'day7_offer' : 'day5_case_study'
      );
    }

    queued++;
  }

  // Queue contract renewal reminders
  for (const contract of expiringContracts) {
    if (!contract.customer) continue;

    const daysUntilExpiry = Math.ceil(
      (new Date(contract.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    await createServiceReminder({
      customerId: contract.customerId,
      customerName: `${contract.customer.firstName} ${contract.customer.lastName}`,
      customerPhone: contract.customer.phone,
      customerEmail: contract.customer.email,
      equipmentType: 'Maintenance Contract',
      equipmentMake: contract.tier.toUpperCase(),
      equipmentModel: '',
      reminderType: 'contract_renewal',
      daysUntilDue: daysUntilExpiry,
    });

    // Offer renewal incentive if within 30 days
    if (daysUntilExpiry <= 30) {
      await queueFollowUp(
        contract.customerId,
        contract.customer.phone,
        contract.customer.firstName,
        0,
        'day7_offer'
      );
    }

    queued++;
  }

  return { queued };
}

/**
 * Send upsell alert when equipment is aging
 * For boilers older than 10 years, recommend replacement
 */
export async function checkEquipmentForUpsells() {
  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  // Find old boilers without active contracts
  const oldBoilers = await db.query.equipment.findMany({
    where: and(
      eq(equipment.type, 'Boiler'),
      lte(equipment.installationDate, tenYearsAgo)
    ),
    with: {
      customer: {
        with: {
          contracts: true,
        },
      },
    },
  });

  const upsells: Array<{
    customerId: string;
    customerName: string;
    equipmentId: string;
    equipmentAge: number;
    hasContract: boolean;
    message: string;
  }> = [];

  for (const boiler of oldBoilers) {
    if (!boiler.customer) continue;
    
    const hasActiveContract = boiler.customer.contracts?.some(
      c => c.status === 'active'
    );

    const ageInYears = Math.floor(
      (now.getTime() - new Date(boiler.installationDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    upsells.push({
      customerId: boiler.customerId,
      customerName: `${boiler.customer.firstName} ${boiler.customer.lastName}`,
      equipmentId: boiler.id,
      equipmentAge: ageInYears,
      hasContract: !!hasActiveContract,
      message: `Your ${boiler.make} ${boiler.model} is ${ageInYears} years old. Typical boiler lifespan is 12-15 years. Consider replacement before it fails!`,
    });
  }

  return upsells;
}

/**
 * Process pending notifications
 * Should be called by a cron job every few minutes
 */
export async function processPendingNotifications() {
  const pending = await db.query.notifications.findMany({
    where: eq(notifications.status, 'pending'),
    limit: 50,
  });

  let processed = 0;
  let errors = 0;

  for (const notification of pending) {
    try {
      const content = notification.content as { message: string; customerPhone: string };
      
      // TODO: Send via Twilio
      // const result = await sendWhatsAppMessage(content.customerPhone, content.message);
      // if (result.success) {
        await db.update(notifications)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(notifications.id, notification.id));
        processed++;
      // }
    } catch (error) {
      await db.update(notifications)
        .set({ status: 'failed' })
        .where(eq(notifications.id, notification.id));
      errors++;
    }
  }

  return { processed, errors };
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get maintenance revenue summary
 */
export async function getMaintenanceRevenueSummary() {
  const activeContracts = await getAllActiveContracts();
  const mrr = await calculateMonthlyRecurringRevenue();
  
  const byTier = {
    bronze: { count: 0, revenue: 0 },
    silver: { count: 0, revenue: 0 },
    gold: { count: 0, revenue: 0 },
  };

  for (const contract of activeContracts) {
    byTier[contract.tier].count++;
    byTier[contract.tier].revenue += parseFloat(contract.monthlyPrice);
  }

  return {
    activeContracts: activeContracts.length,
    monthlyRecurringRevenue: mrr,
    annualRecurringRevenue: mrr * 12,
    byTier,
  };
}

/**
 * Get equipment aging report
 */
export async function getEquipmentAgingReport() {
  const allEquipment = await db.query.equipment.findMany({
    with: { customer: true },
  });

  const now = new Date();
  const agingBuckets = {
    new: { count: 0, label: '0-2 years' },
    mature: { count: 0, label: '3-7 years' },
    aging: { count: 0, label: '8-12 years' },
    endOfLife: { count: 0, label: '13+ years' },
  };

  for (const equip of allEquipment) {
    const ageInYears = (now.getTime() - new Date(equip.installationDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (ageInYears <= 2) agingBuckets.new.count++;
    else if (ageInYears <= 7) agingBuckets.mature.count++;
    else if (ageInYears <= 12) agingBuckets.aging.count++;
    else agingBuckets.endOfLife.count++;
  }

  return agingBuckets;
}
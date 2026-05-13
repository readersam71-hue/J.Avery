import { pgTable, text, timestamp, uuid, decimal, boolean, integer, jsonb, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const leadSourceEnum = pgEnum('lead_source', ['website', 'phone', 'referral', 'gbp']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'quoted', 'converted', 'lost']);
export const priorityEnum = pgEnum('priority_level', ['low', 'medium', 'high', 'emergency']);
export const quoteStatusEnum = pgEnum('quote_status', ['draft', 'sent', 'accepted', 'rejected', 'expired']);
export const tierLevelEnum = pgEnum('tier_level', ['good', 'better', 'best']);
export const jobStatusEnum = pgEnum('job_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);
export const reviewSourceEnum = pgEnum('review_source', ['internal', 'google']);
export const maintenanceTierEnum = pgEnum('maintenance_tier', ['bronze', 'silver', 'gold']);
export const contractStatusEnum = pgEnum('contract_status', ['active', 'expired', 'cancelled']);
export const teamRoleEnum = pgEnum('team_role', ['owner', 'tech', 'admin']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'transfer', 'cash', 'plan']);
export const notificationTypeEnum = pgEnum('notification_type', ['lead_new', 'quote_accepted', 'payment_received', 'job_reminder']);
export const notificationChannelEnum = pgEnum('notification_channel', ['sms', 'whatsapp', 'push', 'email']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

// Tables

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: teamRoleEnum('role').notNull().default('tech'),
  isActive: boolean('is_active').notNull().default(true),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  postcode: text('postcode').notNull(),
  customerSince: timestamp('customer_since', { withTimezone: true }).defaultNow(),
  lifetimeValue: decimal('lifetime_value', { precision: 12, scale: 2 }).default('0.00'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id),
  source: leadSourceEnum('source').notNull(),
  status: leadStatusEnum('status').notNull().default('new'),
  priority: priorityEnum('priority').notNull().default('medium'),
  inquiryDetails: text('inquiry_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  status: quoteStatusEnum('status').notNull().default('draft'),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  tierGoodDetails: jsonb('tier_good_details'),
  tierBetterDetails: jsonb('tier_better_details'),
  tierBestDetails: jsonb('tier_best_details'),
  selectedTier: tierLevelEnum('selected_tier'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  depositAmount: decimal('deposit_amount', { precision: 12, scale: 2 }),
  depositPaid: boolean('deposit_paid').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  assignedTechId: uuid('assigned_tech_id').references(() => teamMembers.id),
  status: jobStatusEnum('status').notNull().default('scheduled'),
  scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
  scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
  actualCompletion: timestamp('actual_completion', { withTimezone: true }),
  workNotes: text('work_notes'),
  beforePhotos: text('before_photos').array(),
  afterPhotos: text('after_photos').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  rating: integer('rating'),
  content: text('content'),
  source: reviewSourceEnum('source').notNull().default('internal'),
  isPublished: boolean('is_published').default(false),
  gatedFeedback: text('gated_feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  installedJobId: uuid('installed_job_id').references(() => jobs.id),
  type: text('type').notNull(),
  make: text('make'),
  model: text('model'),
  serialNumber: text('serial_number'),
  installationDate: date('installation_date'),
  warrantyExpiry: date('warranty_expiry'),
  lastServiceDate: date('last_service_date'),
  nextServiceDue: date('next_service_due'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const maintenanceContracts = pgTable('maintenance_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  tier: maintenanceTierEnum('tier').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: contractStatusEnum('status').notNull().default('active'),
  monthlyPrice: decimal('monthly_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  method: paymentMethodEnum('method').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => teamMembers.id),
  customerId: uuid('customer_id').references(() => customers.id),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  content: jsonb('content').notNull(),
  status: notificationStatusEnum('status').notNull().default('pending'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  jobs: many(jobs),
  notifications: many(notifications),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  leads: many(leads),
  quotes: many(quotes),
  jobs: many(jobs),
  reviews: many(reviews),
  equipment: many(equipment),
  contracts: many(maintenanceContracts),
  notifications: many(notifications),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  customer: one(customers, {
    fields: [leads.customerId],
    references: [customers.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  lead: one(leads, {
    fields: [quotes.leadId],
    references: [leads.id],
  }),
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [jobs.quoteId],
    references: [quotes.id],
  }),
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  tech: one(teamMembers, {
    fields: [jobs.assignedTechId],
    references: [teamMembers.id],
  }),
  reviews: many(reviews),
  payments: many(payments),
  equipment: many(equipment),
}));

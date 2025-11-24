import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function to generate UUIDs for SQLite
function createUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer, admin, super_admin
  phoneNumber: text("phone_number"),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: integer("last_login_at"), // Unix timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Customer Profiles
export const customerProfiles = sqliteTable("customer_profiles", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => users.id),
  defaultPayoutMethod: text("default_payout_method").default("paypal"), // paypal, bank_transfer, check, gift_card, other
  payoutDetailsJson: text("payout_details_json"), // JSON string
  defaultAddressId: text("default_address_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Addresses
export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull().default("shipping"), // shipping, payout, other
  label: text("label"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  street1: text("street1").notNull(),
  street2: text("street2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("US"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Device Brands
export const deviceBrands = sqliteTable("device_brands", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Device Families
export const deviceFamilies = sqliteTable("device_families", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  brandId: text("brand_id").notNull().references(() => deviceBrands.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Device Models
export const deviceModels = sqliteTable("device_models", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  brandId: text("brand_id").notNull().references(() => deviceBrands.id),
  familyId: text("family_id").references(() => deviceFamilies.id),
  name: text("name").notNull(),
  marketingName: text("marketing_name"),
  sku: text("sku"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  year: integer("year"),
  networkTechnology: text("network_technology").default("unknown"), // 5G, 4G, other, unknown
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Device Variants
export const deviceVariants = sqliteTable("device_variants", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  modelId: text("model_id").notNull().references(() => deviceModels.id),
  storageGb: integer("storage_gb").notNull(),
  color: text("color"),
  networkCarrier: text("network_carrier").default("unlocked"), // unlocked, att, verizon, tmobile, other, unknown
  hasEsim: integer("has_esim", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Buyback Condition Profiles
export const buybackConditionProfiles = sqliteTable("buyback_condition_profiles", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  code: text("code").notNull().unique(), // A, B, C, D, broken
  label: text("label").notNull(),
  description: text("description").notNull(),
  isBroken: integer("is_broken", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Buyback Pricing Rules
export const buybackPricingRules = sqliteTable("buyback_pricing_rules", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id),
  conditionProfileId: text("condition_profile_id").notNull().references(() => buybackConditionProfiles.id),
  basePrice: real("base_price").notNull(),
  currency: text("currency").notNull().default("USD"),
  isBlacklistedEligible: integer("is_blacklisted_eligible", { mode: "boolean" }).default(false),
  financedDevicePenaltyAmount: real("financed_device_penalty_amount").default(0),
  noPowerPenaltyAmount: real("no_power_penalty_amount").default(0),
  functionalIssuePenaltyAmount: real("functional_issue_penalty_amount").default(0),
  crackedGlassPenaltyAmount: real("cracked_glass_penalty_amount").default(0),
  activationLockPenaltyAmount: real("activation_lock_penalty_amount").default(0),
  minOfferAmount: real("min_offer_amount").default(0),
  maxOfferAmount: real("max_offer_amount"),
  effectiveFrom: integer("effective_from", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  effectiveTo: integer("effective_to", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Quote Requests
export const quoteRequests = sqliteTable("quote_requests", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  quoteNumber: text("quote_number").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  offerTotalAmount: real("offer_total_amount"),
  offerCurrency: text("offer_currency").default("USD"),
  offerExpiresAt: integer("offer_expires_at", { mode: "timestamp" }),
  status: text("status").notNull().default("draft"), // draft, quoted, expired, converted_to_order, cancelled
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  source: text("source").notNull().default("guest"), // guest, account
  notesInternal: text("notes_internal"),
  notesCustomer: text("notes_customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Quote Line Items
export const quoteLineItems = sqliteTable("quote_line_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  quoteRequestId: text("quote_request_id").notNull().references(() => quoteRequests.id),
  deviceModelId: text("device_model_id").notNull().references(() => deviceModels.id),
  deviceVariantId: text("device_variant_id").references(() => deviceVariants.id),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  claimedConditionProfileId: text("claimed_condition_profile_id").notNull().references(() => buybackConditionProfiles.id),
  claimedIssuesJson: text("claimed_issues_json"), // JSON string
  initialOfferAmount: real("initial_offer_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  calculatedAt: integer("calculated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sell Orders
export const sellOrders = sqliteTable("sell_orders", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  quoteRequestId: text("quote_request_id").references(() => quoteRequests.id),
  status: text("status").notNull().default("label_pending"), // label_pending, awaiting_device, in_transit, received, under_inspection, reoffer_pending, customer_decision_pending, payout_pending, completed, cancelled, returned_to_customer
  lockedInAt: integer("locked_in_at", { mode: "timestamp" }),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  shipmentId: text("shipment_id"),
  payoutStatus: text("payout_status").notNull().default("not_started"), // not_started, pending, paid, failed
  payoutMethod: text("payout_method"),
  payoutDetailsJson: text("payout_details_json"), // JSON string
  totalOriginalOffer: real("total_original_offer"),
  totalFinalOffer: real("total_final_offer"),
  currency: text("currency").notNull().default("USD"),
  notesInternal: text("notes_internal"),
  notesCustomer: text("notes_customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sell Order Items
export const sellOrderItems = sqliteTable("sell_order_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  quoteLineItemId: text("quote_line_item_id").references(() => quoteLineItems.id),
  deviceModelId: text("device_model_id").notNull().references(() => deviceModels.id),
  deviceVariantId: text("device_variant_id").references(() => deviceVariants.id),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  claimedConditionProfileId: text("claimed_condition_profile_id").notNull().references(() => buybackConditionProfiles.id),
  claimedIssuesJson: text("claimed_issues_json"), // JSON string
  originalOfferAmount: real("original_offer_amount").notNull(),
  pricingRuleId: text("pricing_rule_id"),
  basePrice: real("base_price"),
  totalPenalty: real("total_penalty"),
  penaltyBreakdownJson: text("penalty_breakdown_json"), // JSON string
  inspectedConditionProfileId: text("inspected_condition_profile_id").references(() => buybackConditionProfiles.id),
  inspectedIssuesJson: text("inspected_issues_json"), // JSON string
  inspectionNotes: text("inspection_notes"),
  finalOfferAmount: real("final_offer_amount"),
  adjustmentReason: text("adjustment_reason").default("none"), // condition_mismatch, blacklisted, financed, functional_issue, other, none
  customerDecision: text("customer_decision").notNull().default("pending"), // pending, accepted, rejected, returned
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Shipments
export const shipments = sqliteTable("shipments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  carrierName: text("carrier_name"),
  serviceLevel: text("service_level"),
  trackingNumber: text("tracking_number"),
  labelUrl: text("label_url"),
  labelCost: real("label_cost"),
  labelPaidBy: text("label_paid_by").default("company"), // company, customer
  shipFromAddressJson: text("ship_from_address_json"), // JSON string
  shipToAddressJson: text("ship_to_address_json"), // JSON string
  droppedOffAt: integer("dropped_off_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  lastTrackingStatus: text("last_tracking_status"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Payments
export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  direction: text("direction").notNull(), // incoming_from_customer, outgoing_to_customer
  payoutReference: text("payout_reference"),
  method: text("method").notNull(), // card, wire, ach, paypal, check, other
  status: text("status").notNull().default("pending"), // pending, succeeded, failed, refunded
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Support Tickets
export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id),
  sellOrderId: text("sell_order_id").references(() => sellOrders.id),
  quoteRequestId: text("quote_request_id").references(() => quoteRequests.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  lastCustomerActivityAt: integer("last_customer_activity_at", { mode: "timestamp" }),
  lastAgentActivityAt: integer("last_agent_activity_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Support Ticket Messages
export const supportTicketMessages = sqliteTable("support_ticket_messages", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  ticketId: text("ticket_id").notNull().references(() => supportTickets.id),
  authorType: text("author_type").notNull(), // customer, admin
  authorUserId: text("author_user_id").references(() => users.id),
  message: text("message").notNull(),
  isInternal: integer("is_internal", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Announcements
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// FAQs
export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"), // general, pricing, shipping, payments, data_wipe
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Audit Logs
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  previousValues: text("previous_values"), // JSON string
  newValues: text("new_values"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Site Settings
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  key: text("key").notNull().unique(),
  valueJson: text("value_json"), // JSON string
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLoginAt: true });
export const insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeviceBrandSchema = createInsertSchema(deviceBrands).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeviceFamilySchema = createInsertSchema(deviceFamilies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeviceModelSchema = createInsertSchema(deviceModels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeviceVariantSchema = createInsertSchema(deviceVariants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBuybackConditionProfileSchema = createInsertSchema(buybackConditionProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBuybackPricingRuleSchema = createInsertSchema(buybackPricingRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSellOrderSchema = createInsertSchema(sellOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSellOrderItemSchema = createInsertSchema(sellOrderItems).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  deviceVariantId: z.string().nullable().optional(),
});
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = z.infer<typeof insertCustomerProfileSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type DeviceBrand = typeof deviceBrands.$inferSelect;
export type InsertDeviceBrand = z.infer<typeof insertDeviceBrandSchema>;
export type DeviceFamily = typeof deviceFamilies.$inferSelect;
export type InsertDeviceFamily = z.infer<typeof insertDeviceFamilySchema>;
export type DeviceModel = typeof deviceModels.$inferSelect;
export type InsertDeviceModel = z.infer<typeof insertDeviceModelSchema>;
export type DeviceVariant = typeof deviceVariants.$inferSelect;
export type InsertDeviceVariant = z.infer<typeof insertDeviceVariantSchema>;
export type BuybackConditionProfile = typeof buybackConditionProfiles.$inferSelect;
export type InsertBuybackConditionProfile = z.infer<typeof insertBuybackConditionProfileSchema>;
export type BuybackPricingRule = typeof buybackPricingRules.$inferSelect;
export type InsertBuybackPricingRule = z.infer<typeof insertBuybackPricingRuleSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type SellOrder = typeof sellOrders.$inferSelect;
export type InsertSellOrder = z.infer<typeof insertSellOrderSchema>;
export type SellOrderItem = typeof sellOrderItems.$inferSelect;
export type InsertSellOrderItem = z.infer<typeof insertSellOrderItemSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

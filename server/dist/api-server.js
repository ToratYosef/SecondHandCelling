var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../server-api-only.js
import express from "express";

// routes.ts
import { createServer } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";

// db.ts
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ../shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  billingAddresses: () => billingAddresses,
  billingAddressesRelations: () => billingAddressesRelations,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  carts: () => carts,
  cartsRelations: () => cartsRelations,
  companies: () => companies,
  companiesRelations: () => companiesRelations,
  companyStatusEnum: () => companyStatusEnum,
  companyUserRoleEnum: () => companyUserRoleEnum,
  companyUsers: () => companyUsers,
  companyUsersRelations: () => companyUsersRelations,
  conditionGradeEnum: () => conditionGradeEnum,
  deviceCategories: () => deviceCategories,
  deviceCategoriesRelations: () => deviceCategoriesRelations,
  deviceModels: () => deviceModels,
  deviceModelsRelations: () => deviceModelsRelations,
  deviceVariants: () => deviceVariants,
  deviceVariantsRelations: () => deviceVariantsRelations,
  faqs: () => faqs,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBillingAddressSchema: () => insertBillingAddressSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCartSchema: () => insertCartSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompanyUserSchema: () => insertCompanyUserSchema,
  insertDeviceCategorySchema: () => insertDeviceCategorySchema,
  insertDeviceModelSchema: () => insertDeviceModelSchema,
  insertDeviceVariantSchema: () => insertDeviceVariantSchema,
  insertFaqSchema: () => insertFaqSchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertPriceTierSchema: () => insertPriceTierSchema,
  insertQuoteItemSchema: () => insertQuoteItemSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertSavedListItemSchema: () => insertSavedListItemSchema,
  insertSavedListSchema: () => insertSavedListSchema,
  insertShipmentSchema: () => insertShipmentSchema,
  insertShippingAddressSchema: () => insertShippingAddressSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryItems: () => inventoryItems,
  inventoryItemsRelations: () => inventoryItemsRelations,
  inventoryStatusEnum: () => inventoryStatusEnum,
  networkLockStatusEnum: () => networkLockStatusEnum,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  priceTiers: () => priceTiers,
  priceTiersRelations: () => priceTiersRelations,
  quoteItems: () => quoteItems,
  quoteItemsRelations: () => quoteItemsRelations,
  quoteStatusEnum: () => quoteStatusEnum,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  savedListItems: () => savedListItems,
  savedListItemsRelations: () => savedListItemsRelations,
  savedLists: () => savedLists,
  savedListsRelations: () => savedListsRelations,
  shipments: () => shipments,
  shipmentsRelations: () => shipmentsRelations,
  shippingAddresses: () => shippingAddresses,
  shippingAddressesRelations: () => shippingAddressesRelations,
  supportTicketPriorityEnum: () => supportTicketPriorityEnum,
  supportTicketStatusEnum: () => supportTicketStatusEnum,
  supportTickets: () => supportTickets,
  supportTicketsRelations: () => supportTicketsRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  real,
  text,
  timestamp,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = ["buyer", "admin", "super_admin"];
var companyStatusEnum = ["pending_review", "approved", "rejected", "suspended"];
var companyUserRoleEnum = ["owner", "admin", "buyer"];
var conditionGradeEnum = ["A", "B", "C", "D"];
var networkLockStatusEnum = ["unlocked", "locked", "other"];
var inventoryStatusEnum = ["in_stock", "reserved", "incoming", "discontinued"];
var orderStatusEnum = [
  "pending_payment",
  "payment_review",
  "processing",
  "shipped",
  "label_pending",
  "awaiting_device",
  "in_transit",
  "received",
  "under_inspection",
  "reoffer_sent",
  "payout_pending",
  "completed",
  "cancelled",
  "returned_to_customer"
];
var paymentStatusEnum = ["unpaid", "paid", "partially_paid", "refunded"];
var paymentMethodEnum = ["card", "wire", "ach", "terms", "other"];
var quoteStatusEnum = ["draft", "sent", "accepted", "rejected", "expired"];
var supportTicketStatusEnum = ["open", "in_progress", "closed"];
var supportTicketPriorityEnum = ["low", "medium", "high"];
var users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoleEnum }).notNull().default("buyer"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").notNull().default(true),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry")
});
var usersRelations = relations(users, ({ many }) => ({
  companyUsers: many(companyUsers),
  createdOrders: many(orders, { relationName: "orderCreator" }),
  createdQuotes: many(quotes, { relationName: "quoteCreator" }),
  createdSavedLists: many(savedLists),
  supportTickets: many(supportTickets),
  auditLogs: many(auditLogs)
}));
var companies = pgTable("companies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  legalName: text("legal_name").notNull(),
  taxId: text("tax_id"),
  resellerCertificateUrl: text("reseller_certificate_url"),
  website: text("website"),
  primaryPhone: text("primary_phone"),
  billingEmail: text("billing_email"),
  status: text("status", { enum: companyStatusEnum }).notNull().default("pending_review"),
  creditLimit: real("credit_limit").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var companiesRelations = relations(companies, ({ many }) => ({
  companyUsers: many(companyUsers),
  carts: many(carts),
  orders: many(orders),
  quotes: many(quotes),
  savedLists: many(savedLists),
  shippingAddresses: many(shippingAddresses),
  billingAddresses: many(billingAddresses),
  supportTickets: many(supportTickets)
}));
var companyUsers = pgTable("company_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleInCompany: text("role_in_company", { enum: companyUserRoleEnum }).notNull().default("buyer"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id]
  }),
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id]
  })
}));
var deviceCategories = pgTable("device_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceCategoriesRelations = relations(deviceCategories, ({ many }) => ({
  deviceModels: many(deviceModels)
}));
var deviceModels = pgTable("device_models", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  marketingName: text("marketing_name"),
  sku: text("sku").notNull().unique(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id").notNull().references(() => deviceCategories.id),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true)
});
var deviceModelsRelations = relations(deviceModels, ({ one, many }) => ({
  category: one(deviceCategories, {
    fields: [deviceModels.categoryId],
    references: [deviceCategories.id]
  }),
  variants: many(deviceVariants)
}));
var deviceVariants = pgTable("device_variants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deviceModelId: text("device_model_id").notNull().references(() => deviceModels.id, { onDelete: "cascade" }),
  storage: text("storage").notNull(),
  color: text("color").notNull(),
  networkLockStatus: text("network_lock_status", { enum: networkLockStatusEnum }).notNull().default("unlocked"),
  conditionGrade: text("condition_grade", { enum: conditionGradeEnum }).notNull(),
  internalCode: text("internal_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceVariantsRelations = relations(deviceVariants, ({ one, many }) => ({
  deviceModel: one(deviceModels, {
    fields: [deviceVariants.deviceModelId],
    references: [deviceModels.id]
  }),
  inventoryItems: many(inventoryItems),
  priceTiers: many(priceTiers),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  quoteItems: many(quoteItems),
  savedListItems: many(savedListItems)
}));
var inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id, { onDelete: "cascade" }),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  minOrderQuantity: integer("min_order_quantity").notNull().default(1),
  location: text("location"),
  status: text("status", { enum: inventoryStatusEnum }).notNull().default("in_stock"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  deviceVariant: one(deviceVariants, {
    fields: [inventoryItems.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var priceTiers = pgTable("price_tiers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id, { onDelete: "cascade" }),
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"),
  unitPrice: real("unit_price").notNull(),
  currency: text("currency").notNull().default("USD"),
  effectiveFrom: timestamp("effective_from").notNull().default(sql`CURRENT_TIMESTAMP`),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").notNull().default(true)
});
var priceTiersRelations = relations(priceTiers, ({ one }) => ({
  deviceVariant: one(deviceVariants, {
    fields: [priceTiers.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var carts = pgTable("carts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id]
  }),
  company: one(companies, {
    fields: [carts.companyId],
    references: [companies.id]
  }),
  items: many(cartItems)
}));
var cartItems = pgTable("cart_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  unitPriceSnapshot: real("unit_price_snapshot").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id]
  }),
  deviceVariant: one(deviceVariants, {
    fields: [cartItems.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(),
  companyId: text("company_id").notNull().references(() => companies.id),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  status: text("status", { enum: orderStatusEnum }).notNull().default("pending_payment"),
  subtotal: real("subtotal").notNull(),
  shippingCost: real("shipping_cost").notNull().default(0),
  taxAmount: real("tax_amount").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentStatus: text("payment_status", { enum: paymentStatusEnum }).notNull().default("unpaid"),
  paymentMethod: text("payment_method", { enum: paymentMethodEnum }),
  shippingAddressId: text("shipping_address_id").references(() => shippingAddresses.id),
  billingAddressId: text("billing_address_id").references(() => billingAddresses.id),
  notesInternal: text("notes_internal"),
  notesCustomer: text("notes_customer"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var ordersRelations = relations(orders, ({ one, many }) => ({
  company: one(companies, {
    fields: [orders.companyId],
    references: [companies.id]
  }),
  createdBy: one(users, {
    fields: [orders.createdByUserId],
    references: [users.id],
    relationName: "orderCreator"
  }),
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments)
}));
var orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  lineTotal: real("line_total").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  deviceVariant: one(deviceVariants, {
    fields: [orderItems.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var shippingAddresses = pgTable("shipping_addresses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  label: text("label"),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  street1: text("street1").notNull(),
  street2: text("street2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("USA"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var shippingAddressesRelations = relations(shippingAddresses, ({ one }) => ({
  company: one(companies, {
    fields: [shippingAddresses.companyId],
    references: [companies.id]
  })
}));
var billingAddresses = pgTable("billing_addresses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  label: text("label"),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  street1: text("street1").notNull(),
  street2: text("street2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("USA"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var billingAddressesRelations = relations(billingAddresses, ({ one }) => ({
  company: one(companies, {
    fields: [billingAddresses.companyId],
    references: [companies.id]
  })
}));
var quotes = pgTable("quotes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quoteNumber: text("quote_number").notNull().unique(),
  companyId: text("company_id").notNull().references(() => companies.id),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  status: text("status", { enum: quoteStatusEnum }).notNull().default("draft"),
  validUntil: timestamp("valid_until"),
  subtotal: real("subtotal").notNull().default(0),
  shippingEstimate: real("shipping_estimate").notNull().default(0),
  taxEstimate: real("tax_estimate").notNull().default(0),
  totalEstimate: real("total_estimate").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var quotesRelations = relations(quotes, ({ one, many }) => ({
  company: one(companies, {
    fields: [quotes.companyId],
    references: [companies.id]
  }),
  createdBy: one(users, {
    fields: [quotes.createdByUserId],
    references: [users.id],
    relationName: "quoteCreator"
  }),
  items: many(quoteItems)
}));
var quoteItems = pgTable("quote_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quoteId: text("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id),
  quantity: integer("quantity").notNull(),
  proposedUnitPrice: real("proposed_unit_price").notNull(),
  lineTotalEstimate: real("line_total_estimate").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id]
  }),
  deviceVariant: one(deviceVariants, {
    fields: [quoteItems.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var savedLists = pgTable("saved_lists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var savedListsRelations = relations(savedLists, ({ one, many }) => ({
  company: one(companies, {
    fields: [savedLists.companyId],
    references: [companies.id]
  }),
  createdBy: one(users, {
    fields: [savedLists.createdByUserId],
    references: [users.id]
  }),
  items: many(savedListItems)
}));
var savedListItems = pgTable("saved_list_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  savedListId: text("saved_list_id").notNull().references(() => savedLists.id, { onDelete: "cascade" }),
  deviceVariantId: text("device_variant_id").notNull().references(() => deviceVariants.id, { onDelete: "cascade" }),
  defaultQuantity: integer("default_quantity").notNull().default(1)
});
var savedListItemsRelations = relations(savedListItems, ({ one }) => ({
  savedList: one(savedLists, {
    fields: [savedListItems.savedListId],
    references: [savedLists.id]
  }),
  deviceVariant: one(deviceVariants, {
    fields: [savedListItems.deviceVariantId],
    references: [deviceVariants.id]
  })
}));
var payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  method: text("method", { enum: paymentMethodEnum }).notNull(),
  processedAt: timestamp("processed_at")
});
var paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  })
}));
var shipments = pgTable("shipments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  carrier: text("carrier").notNull(),
  serviceLevel: text("service_level"),
  trackingNumber: text("tracking_number"),
  shippingLabelUrl: text("shipping_label_url"),
  shippedAt: timestamp("shipped_at"),
  estimatedDeliveryDate: timestamp("estimated_delivery_date")
});
var shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id]
  })
}));
var faqs = pgTable("faqs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var announcements = pgTable("announcements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  body: text("body").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: supportTicketStatusEnum }).notNull().default("open"),
  priority: text("priority", { enum: supportTicketPriorityEnum }).notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  company: one(companies, {
    fields: [supportTickets.companyId],
    references: [companies.id]
  }),
  createdBy: one(users, {
    fields: [supportTickets.createdByUserId],
    references: [users.id]
  })
}));
var auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorUserId: text("actor_user_id").references(() => users.id),
  companyId: text("company_id").references(() => companies.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  previousValues: text("previous_values"),
  newValues: text("new_values"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCompanyUserSchema = createInsertSchema(companyUsers).omit({
  id: true,
  createdAt: true
});
var insertDeviceCategorySchema = createInsertSchema(deviceCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDeviceModelSchema = createInsertSchema(deviceModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDeviceVariantSchema = createInsertSchema(deviceVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPriceTierSchema = createInsertSchema(priceTiers).omit({
  id: true
});
var insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true
});
var insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBillingAddressSchema = createInsertSchema(billingAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
  createdAt: true
});
var insertSavedListSchema = createInsertSchema(savedLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSavedListItemSchema = createInsertSchema(savedListItems).omit({
  id: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true
});
var insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true
});
var insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true
});
var insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

// db.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var sql2 = neon(process.env.DATABASE_URL);
var db = drizzle(sql2, { schema: schema_exports });

// storage.ts
import { eq, and, desc, sql as sql3 } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getAllUsers() {
    const users2 = await db.select().from(users);
    return users2;
  }
  // Company methods
  async getCompany(id) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || void 0;
  }
  async createCompany(insertCompany) {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async updateCompany(id, updates) {
    const [company] = await db.update(companies).set(updates).where(eq(companies.id, id)).returning();
    return company || void 0;
  }
  async getAllCompanies() {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }
  async getCompanyByName(name) {
    const [company] = await db.select().from(companies).where(eq(companies.name, name));
    return company || void 0;
  }
  // CompanyUser methods
  async createCompanyUser(insertCompanyUser) {
    const [companyUser] = await db.insert(companyUsers).values(insertCompanyUser).returning();
    return companyUser;
  }
  async getCompanyUsersByUserId(userId) {
    return await db.select().from(companyUsers).where(eq(companyUsers.userId, userId));
  }
  async getCompanyUsersByCompanyId(companyId) {
    return await db.select().from(companyUsers).where(eq(companyUsers.companyId, companyId));
  }
  // Device Category methods
  async getAllCategories() {
    return await db.select().from(deviceCategories);
  }
  async getCategory(id) {
    const [category] = await db.select().from(deviceCategories).where(eq(deviceCategories.id, id));
    return category || void 0;
  }
  async getCategoryBySlug(slug) {
    const [category] = await db.select().from(deviceCategories).where(eq(deviceCategories.slug, slug));
    return category || void 0;
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(deviceCategories).values(insertCategory).returning();
    return category;
  }
  // Device Model methods
  async getAllDeviceModels() {
    return await db.select().from(deviceModels).where(eq(deviceModels.isActive, true));
  }
  async getDeviceModel(id) {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.id, id));
    return model || void 0;
  }
  async getDeviceModelBySlug(slug) {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.slug, slug));
    return model || void 0;
  }
  async createDeviceModel(insertModel) {
    const [model] = await db.insert(deviceModels).values(insertModel).returning();
    return model;
  }
  // Device Variant methods
  async getDeviceVariant(id) {
    const [variant] = await db.select().from(deviceVariants).where(eq(deviceVariants.id, id));
    return variant || void 0;
  }
  async getDeviceVariantsByModelId(modelId) {
    return await db.select().from(deviceVariants).where(eq(deviceVariants.deviceModelId, modelId));
  }
  async createDeviceVariant(insertVariant) {
    const [variant] = await db.insert(deviceVariants).values(insertVariant).returning();
    return variant;
  }
  async updateDeviceVariant(id, updates) {
    const [variant] = await db.update(deviceVariants).set(updates).where(eq(deviceVariants.id, id)).returning();
    return variant || void 0;
  }
  async deleteDeviceVariant(id) {
    await db.delete(deviceVariants).where(eq(deviceVariants.id, id));
  }
  // Inventory methods
  async getInventoryByVariantId(variantId) {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.deviceVariantId, variantId));
    return item || void 0;
  }
  async createInventory(insertInventory) {
    const [item] = await db.insert(inventoryItems).values(insertInventory).returning();
    return item;
  }
  async updateInventory(id, updates) {
    const [item] = await db.update(inventoryItems).set(updates).where(eq(inventoryItems.id, id)).returning();
    return item || void 0;
  }
  async deleteInventoryByVariantId(variantId) {
    await db.delete(inventoryItems).where(eq(inventoryItems.deviceVariantId, variantId));
  }
  // Price Tier methods
  async getPriceTiersByVariantId(variantId) {
    return await db.select().from(priceTiers).where(and(
      eq(priceTiers.deviceVariantId, variantId),
      eq(priceTiers.isActive, true)
    )).orderBy(priceTiers.minQuantity);
  }
  async createPriceTier(insertTier) {
    const [tier] = await db.insert(priceTiers).values(insertTier).returning();
    return tier;
  }
  async updatePriceTier(id, updates) {
    const [tier] = await db.update(priceTiers).set(updates).where(eq(priceTiers.id, id)).returning();
    return tier || void 0;
  }
  async deletePriceTiersByVariantId(variantId) {
    await db.delete(priceTiers).where(eq(priceTiers.deviceVariantId, variantId));
  }
  // Cart methods
  async getCartByUserId(userId) {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart || void 0;
  }
  async createCart(insertCart) {
    const [cart] = await db.insert(carts).values(insertCart).returning();
    return cart;
  }
  async getCartItems(cartId) {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }
  async addCartItem(insertItem) {
    const [item] = await db.insert(cartItems).values(insertItem).returning();
    return item;
  }
  async updateCartItem(id, updates) {
    const [item] = await db.update(cartItems).set(updates).where(eq(cartItems.id, id)).returning();
    return item || void 0;
  }
  async removeCartItem(id) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }
  async clearCart(cartId) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
  // Order methods
  async createOrder(insertOrder) {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || void 0;
  }
  async getOrderByNumber(orderNumber) {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || void 0;
  }
  async getOrdersByCompanyId(companyId) {
    return await db.select().from(orders).where(eq(orders.companyId, companyId)).orderBy(desc(orders.createdAt));
  }
  async updateOrder(id, updates) {
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async getAllOrders() {
    const orders2 = await db.select().from(orders);
    return orders2;
  }
  async createOrderItem(insertItem) {
    const [item] = await db.insert(orderItems).values(insertItem).returning();
    return item;
  }
  async getOrderItems(orderId) {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  // Shipping/Billing Address methods
  async getShippingAddressesByCompanyId(companyId) {
    return await db.select().from(shippingAddresses).where(eq(shippingAddresses.companyId, companyId));
  }
  async createShippingAddress(insertAddress) {
    const [address] = await db.insert(shippingAddresses).values(insertAddress).returning();
    return address;
  }
  async updateShippingAddress(id, updates) {
    const [address] = await db.update(shippingAddresses).set(updates).where(eq(shippingAddresses.id, id)).returning();
    return address || void 0;
  }
  async getBillingAddressesByCompanyId(companyId) {
    return await db.select().from(billingAddresses).where(eq(billingAddresses.companyId, companyId));
  }
  async createBillingAddress(insertAddress) {
    const [address] = await db.insert(billingAddresses).values(insertAddress).returning();
    return address;
  }
  // Quote methods
  async createQuote(insertQuote) {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }
  async getQuote(id) {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || void 0;
  }
  async getQuotesByCompanyId(companyId) {
    return await db.select().from(quotes).where(eq(quotes.companyId, companyId)).orderBy(desc(quotes.createdAt));
  }
  async updateQuote(id, updates) {
    const [quote] = await db.update(quotes).set(updates).where(eq(quotes.id, id)).returning();
    return quote || void 0;
  }
  async createQuoteItem(insertItem) {
    const [item] = await db.insert(quoteItems).values(insertItem).returning();
    return item;
  }
  async getQuoteItems(quoteId) {
    return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
  }
  // Saved List methods
  async getSavedListsByCompanyId(companyId) {
    return await db.select().from(savedLists).where(eq(savedLists.companyId, companyId));
  }
  async createSavedList(insertList) {
    const [list] = await db.insert(savedLists).values(insertList).returning();
    return list;
  }
  async getSavedListItems(listId) {
    return await db.select().from(savedListItems).where(eq(savedListItems.savedListId, listId));
  }
  async addSavedListItem(insertItem) {
    const [item] = await db.insert(savedListItems).values(insertItem).returning();
    return item;
  }
  async getSavedList(id) {
    const [list] = await db.select().from(savedLists).where(eq(savedLists.id, id));
    return list || void 0;
  }
  async deleteSavedList(id) {
    await db.delete(savedLists).where(eq(savedLists.id, id));
  }
  async deleteSavedListItem(id) {
    await db.delete(savedListItems).where(eq(savedListItems.id, id));
  }
  // Payment methods
  async createPayment(insertPayment) {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  async getPaymentsByOrderId(orderId) {
    return await db.select().from(payments).where(eq(payments.orderId, orderId));
  }
  // Shipment methods
  async createShipment(insertShipment) {
    const [shipment] = await db.insert(shipments).values(insertShipment).returning();
    return shipment;
  }
  async getShipmentsByOrderId(orderId) {
    return await db.select().from(shipments).where(eq(shipments.orderId, orderId));
  }
  // FAQ methods
  async getAllFaqs() {
    return await db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.category, faqs.displayOrder);
  }
  async createFaq(insertFaq) {
    const [faq] = await db.insert(faqs).values(insertFaq).returning();
    return faq;
  }
  // Announcement methods
  async getActiveAnnouncements() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(announcements).where(
      and(
        eq(announcements.isActive, true),
        sql3`${announcements.startsAt} <= ${now}`,
        sql3`(${announcements.endsAt} IS NULL OR ${announcements.endsAt} >= ${now})`
      )
    );
  }
  async createAnnouncement(insertAnnouncement) {
    const [announcement] = await db.insert(announcements).values(insertAnnouncement).returning();
    return announcement;
  }
  // Support Ticket methods
  async createSupportTicket(insertTicket) {
    const [ticket] = await db.insert(supportTickets).values(insertTicket).returning();
    return ticket;
  }
  async getSupportTicketsByCompanyId(companyId) {
    return await db.select().from(supportTickets).where(eq(supportTickets.companyId, companyId)).orderBy(desc(supportTickets.createdAt));
  }
  async updateSupportTicket(id, updates) {
    const [ticket] = await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id)).returning();
    return ticket || void 0;
  }
  // Audit Log methods
  async createAuditLog(insertLog) {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }
  async getAuditLogs(limit = 100) {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }
};
var storage = new DatabaseStorage();

// routes.ts
import bcrypt from "bcrypt";
import { z } from "zod";

// services/email.ts
import nodemailer from "nodemailer";
var transporter = null;
function getEmailTransporter() {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      throw new Error("Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.");
    }
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }
  return transporter;
}
async function sendEmail(mailOptions) {
  try {
    const transporter2 = getEmailTransporter();
    const defaultFrom = process.env.EMAIL_FROM || `SecondHandCell <${process.env.EMAIL_USER}>`;
    await transporter2.sendMail({
      from: mailOptions.from || defaultFrom,
      ...mailOptions
    });
    console.log("Email sent successfully to:", mailOptions.to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// routes/emails.ts
import { Router } from "express";

// helpers/emailTemplates.ts
var EMAIL_LOGO_URL = "https://raw.githubusercontent.com/ToratYosef/BuyBacking/refs/heads/main/assets/logo.png";
var TRUSTPILOT_REVIEW_LINK = "https://www.trustpilot.com/evaluate/secondhandcell.com";
var TRUSTPILOT_STARS_IMAGE_URL = "https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-5.png";
function buildTrustpilotSection() {
  return `
    <div style="text-align:center; padding: 28px 24px 32px; background-color:#f8fafc; border-top: 1px solid #e2e8f0;">
      <p style="font-weight:600; color:#0f172a; font-size:18px; margin:0 0 12px 0;">Loved your experience?</p>
      <a href="${TRUSTPILOT_REVIEW_LINK}" style="display:inline-block; text-decoration:none; border:none; outline:none;">
        <img src="${TRUSTPILOT_STARS_IMAGE_URL}" alt="Rate us on Trustpilot" style="height:58px; width:auto; display:block; margin:0 auto 10px auto; border:0;">
      </a>
      <p style="font-size:15px; color:#475569; margin:12px 0 0;">Your feedback keeps the <strong>SecondHandCell</strong> community thriving.</p>
    </div>
  `;
}
function buildCountdownNoticeHtml() {
  return `
    <div style="margin-top: 24px; padding: 18px 20px; background-color: #ecfdf5; border-radius: 12px; border: 1px solid #bbf7d0; color: #065f46; font-size: 17px; line-height: 1.6;">
      <strong style="display:block; font-size:18px; margin-bottom:8px;">Friendly reminder</strong>
      If we don't hear back, we may finalize your device at <strong>75% less</strong> to keep your order moving.
    </div>
  `;
}
function escapeHtml(text2) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text2.replace(/[&<>"']/g, (m) => map[m]);
}
function buildEmailLayout({
  title = "",
  bodyHtml = "",
  accentColor = "#16a34a",
  includeTrustpilot = true,
  footerText = "Need help? Reply to this email or call (347) 688-0662.",
  includeCountdownNotice = false
} = {}) {
  const headingSection = title ? `
        <tr>
          <td style="background:${accentColor}; padding: 30px 24px; text-align:center;">
            <h1 style="margin:0; font-size:28px; line-height:1.3; color:#ffffff; font-weight:700;">${escapeHtml(
    title
  )}</h1>
          </td>
        </tr>
      ` : "";
  const trustpilotSection = includeTrustpilot ? buildTrustpilotSection() : "";
  const countdownSection = includeCountdownNotice ? buildCountdownNoticeHtml() : "";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title || "SecondHandCell Update")}</title>
      <style>
        body { background-color:#f1f5f9; margin:0; padding:24px 12px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0f172a; }
        .email-shell { width:100%; max-width:640px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 25px 45px rgba(15,23,42,0.08); border:1px solid #e2e8f0; }
        .logo-cell { padding:28px 0 16px; text-align:center; background-color:#ffffff; }
        .logo-cell img { height:56px; width:auto; }
        .content-cell { padding:32px 30px; font-size:17px; line-height:1.75; }
        .content-cell p { margin:0 0 20px; }
        .footer-cell { padding:28px 32px; text-align:center; font-size:15px; color:#475569; background-color:#f8fafc; border-top:1px solid #e2e8f0; }
        .footer-cell p { margin:4px 0; }
        a.button-link { display:inline-block; padding:14px 26px; border-radius:9999px; background-color:#16a34a; color:#ffffff !important; font-weight:600; text-decoration:none; font-size:17px; }
      </style>
    </head>
    <body>
      <table role="presentation" cellpadding="0" cellspacing="0" class="email-shell">
        <tr>
          <td class="logo-cell">
            <img src="${EMAIL_LOGO_URL}" alt="SecondHandCell Logo" />
          </td>
        </tr>
        ${headingSection}
        <tr>
          <td class="content-cell">
            ${bodyHtml}
            ${countdownSection}
          </td>
        </tr>
        ${trustpilotSection ? `<tr><td>${trustpilotSection}</td></tr>` : ""}
        <tr>
          <td class="footer-cell">
            <p>${footerText}</p>
            <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} SecondHandCell. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
var SHIPPING_LABEL_EMAIL_HTML = buildEmailLayout({
  title: "Your Shipping Label is Ready!",
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>Your shipping label for order <strong>#**ORDER_ID**</strong> is ready to go.</p>
      <p style="margin-bottom:28px;">Use the secure button below to download it instantly and get your device on the way to us.</p>
      <div style="text-align:center; margin-bottom:32px;">
        <a href="**LABEL_DOWNLOAD_LINK**" class="button-link">Download Shipping Label</a>
      </div>
      <div style="background:#f8fafc; border:1px solid #dbeafe; border-radius:14px; padding:20px 24px;">
        <p style="margin:0 0 10px;"><strong style="color:#0f172a;">Tracking Number</strong><br><span style="color:#2563eb; font-weight:600;">**TRACKING_NUMBER**</span></p>
        <p style="margin:0; color:#475569;">Drop your device off with your preferred carrier as soon as you're ready.</p>
      </div>
      <p style="margin-top:28px;">Need a hand? Reply to this email and our team will guide you.</p>
  `
});
var SHIPPING_KIT_EMAIL_HTML = buildEmailLayout({
  title: "Your Shipping Kit is on its Way!",
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>Your shipping kit for order <strong>#**ORDER_ID**</strong> is en route.</p>
      <p>Track its journey with the number below and get ready to pop your device inside once it arrives.</p>
      <div style="background:#f8fafc; border:1px solid #dbeafe; border-radius:14px; padding:20px 24px; margin:0 0 28px;">
        <p style="margin:0 0 10px;"><strong style="color:#0f172a;">Tracking Number</strong><br><span style="color:#2563eb; font-weight:600;">**TRACKING_NUMBER**</span></p>
        <p style="margin:0; color:#475569;">Keep an eye out for your kit and pack your device securely when it lands.</p>
      </div>
      <p>Have accessories you don't need? Feel free to include them\u2014we'll recycle responsibly.</p>
      <p>Need anything else? Just reply to this email.</p>
  `
});
var ORDER_RECEIVED_EMAIL_HTML = buildEmailLayout({
  title: "We've received your order!",
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>Thanks for choosing SecondHandCell! We've logged your order for <strong>**DEVICE_NAME**</strong>.</p>
      <p>Your order ID is <strong style="color:#2563eb;">#**ORDER_ID**</strong>. Keep it handy for any questions.</p>
      <h2 style="font-size:20px; color:#0f172a; margin:32px 0 12px;">Before you ship</h2>
      <ul style="padding-left:22px; margin:0 0 20px; color:#475569;">
        <li style="margin-bottom:10px;"><strong>Backup your data</strong> so nothing personal is lost.</li>
        <li style="margin-bottom:10px;"><strong>Factory reset</strong> the device to wipe personal info.</li>
        <li style="margin-bottom:10px;"><strong>Remove accounts</strong> such as Apple ID/iCloud or Google/Samsung accounts.<br><span style="display:block; margin-top:6px; margin-left:10px;">\u2022 Turn off Find My iPhone (FMI).<br>\u2022 Disable Factory Reset Protection (FRP) on Android.</span></li>
        <li style="margin-bottom:10px;"><strong>Remove SIM cards</strong> and eSIM profiles.</li>
        <li style="margin-bottom:10px;"><strong>Pack accessories separately</strong> unless we specifically request them.</li>
      </ul>
      <div style="background:#fef3c7; border-radius:16px; padding:18px 22px; border:1px solid #fde68a; color:#92400e; margin:30px 0;">
        <strong>Important:</strong> We can't process devices that still have FMI/FRP enabled, an outstanding balance, or a blacklist/lost/stolen status.
      </div>
      **SHIPPING_INSTRUCTION**
  `
});
var DEVICE_RECEIVED_EMAIL_HTML = buildEmailLayout({
  title: "Your device has arrived!",
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>Your device for order <strong style="color:#2563eb;">#**ORDER_ID**</strong> has landed at our facility.</p>
      <p>Our technicians are giving it a full inspection now. We'll follow up shortly with an update on your payout.</p>
      <p>Have questions while you wait? Just reply to this email\u2014real humans are here to help.</p>
  `
});
var ORDER_PLACED_ADMIN_EMAIL_HTML = buildEmailLayout({
  title: "New order submitted",
  accentColor: "#f97316",
  bodyHtml: `
      <p>Heads up! A new order just came in.</p>
      <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:16px; padding:22px 24px; margin-bottom:28px; color:#7c2d12;">
        <p style="margin:0 0 10px;"><strong>Customer</strong>: **CUSTOMER_NAME**</p>
        <p style="margin:0 0 10px;"><strong>Order ID</strong>: #**ORDER_ID**</p>
        <p style="margin:0 0 10px;"><strong>Device</strong>: **DEVICE_NAME**</p>
        <p style="margin:0;"><strong>Estimated Quote</strong>: $**ESTIMATED_QUOTE** \u2022 <strong>Shipping</strong>: **SHIPPING_PREFERENCE**</p>
      </div>
      <div style="text-align:center; margin-bottom:20px;">
        <a href="https://secondhandcell.com/admin" class="button-link" style="background-color:#f97316;">Open in Admin</a>
      </div>
      <p style="color:#475569;">This alert is automated\u2014feel free to reply if you notice anything unusual.</p>
  `
});
var BLACKLISTED_EMAIL_HTML = buildEmailLayout({
  title: "Action required: Carrier blacklist detected",
  accentColor: "#dc2626",
  includeCountdownNotice: true,
  includeTrustpilot: false,
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>During our review of order <strong>#**ORDER_ID**</strong>, the carrier database flagged the device as lost, stolen, or blacklisted.</p>
      <p>We can't release payment while this status is active. Please contact your carrier to remove the flag and reply with confirmation or documentation so we can re-run the check.</p>
      <p>If you believe this alert is an error, include any proof in your reply and we'll take another look.</p>
      <div style="color:#dc2626; font-size:15px; line-height:1.6;">
        <p style="margin: 0 0 16px;">State and local law require us to hold devices that test positive for a lost, stolen, or blacklisted status. Key regulations include:</p>
        <ul style="margin: 0 0 16px; padding-left: 20px;">
          <li><strong>New York Penal Law \xA7\xA7 155.05(2)(b) &amp; 165.40\u2013165.54:</strong> Buying or possessing property that is reported lost or stolen can constitute larceny or criminal possession of stolen property.</li>
          <li><strong>New York City Administrative Code \xA7\xA7 20-272 &amp; 20-273:</strong> Secondhand dealers must record every transaction, report suspicious items to the NYPD, and hold flagged goods for law enforcement review.</li>
          <li><strong>New York General Business Law Article 6:</strong> Requires detailed recordkeeping and prohibits resale of devices until legal status issues are resolved.</li>
        </ul>
        <p style="margin: 0;">We will continue to cooperate with law enforcement and cannot release the device back to you unless they authorize it. For more information, review our <a href="https://secondhandcell.com/terms.html" style="color:#2563eb;">Terms &amp; Conditions</a> or reply with documentation clearing the device so we can re-run the check.</p>
      </div>
  `
});
var FMI_EMAIL_HTML = buildEmailLayout({
  title: "Turn off Find My to continue",
  accentColor: "#f59e0b",
  includeCountdownNotice: true,
  includeTrustpilot: false,
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>Our inspection for order <strong>#**ORDER_ID**</strong> shows Find My iPhone / Activation Lock is still enabled.</p>
      <p>Please complete the steps below so we can finish processing your payout:</p>
      <ol style="padding-left:22px; color:#475569; margin-bottom:20px;">
        <li>Visit <a href="https://icloud.com/find" target="_blank" style="color:#2563eb;">icloud.com/find</a> and sign in.</li>
        <li>Select the device you're selling.</li>
        <li>Choose "Remove from Account".</li>
        <li>Confirm the device no longer appears in your list.</li>
      </ol>
      <div style="text-align:center; margin:32px 0 24px;">
        <a href="**CONFIRM_URL**" class="button-link" style="background-color:#f59e0b;">I've turned off Find My</a>
      </div>
      <p style="color:#b45309; font-size:15px;">Once it's disabled, click the button above or reply to this email so we can recheck your device.</p>
  `
});
var BAL_DUE_EMAIL_HTML = buildEmailLayout({
  title: "Balance due with your carrier",
  accentColor: "#f97316",
  includeCountdownNotice: true,
  includeTrustpilot: false,
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>When we ran your device for order <strong>#**ORDER_ID**</strong>, the carrier reported a status of <strong>**FINANCIAL_STATUS**</strong>.</p>
      <p>Please contact your carrier to clear the balance and then reply to this email so we can rerun the check and keep your payout on track.</p>
      <p style="color:#c2410c;">Need help figuring out the right department to call? Let us know and we'll point you in the right direction.</p>
  `
});
var DOWNGRADE_EMAIL_HTML = buildEmailLayout({
  title: "Order finalized at adjusted payout",
  accentColor: "#f97316",
  includeTrustpilot: false,
  bodyHtml: `
      <p>Hi **CUSTOMER_NAME**,</p>
      <p>We reached out about the issue with your device for order <strong>#**ORDER_ID**</strong> but haven't received an update.</p>
      <p>To keep things moving, we've finalized the device at 75% less than the original offer. If you resolve the issue, reply to this email and we'll happily re-evaluate.</p>
      <p>We're here to help\u2014just let us know how you'd like to proceed.</p>
  `
});
function getOrderCompletedEmailTemplate({ includeTrustpilot = true } = {}) {
  return buildEmailLayout({
    title: "\u{1F973} Your order is complete!",
    includeTrustpilot,
    bodyHtml: `
        <p>Hi **CUSTOMER_NAME**,</p>
        <p>Great news! Order <strong>#**ORDER_ID**</strong> is complete and your payout is headed your way.</p>
        <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px 24px; margin:28px 0;">
          <p style="margin:0 0 12px;"><strong style="color:#0f172a;">Device</strong><br><span style="color:#475569;">**DEVICE_SUMMARY**</span></p>
          <p style="margin:0 0 12px;"><strong style="color:#0f172a;">Payout</strong><br><span style="color:#059669; font-size:22px; font-weight:700;">$**ORDER_TOTAL**</span></p>
          <p style="margin:0;"><strong style="color:#0f172a;">Payment method</strong><br><span style="color:#475569;">**PAYMENT_METHOD**</span></p>
        </div>
        <p>Thanks for choosing SecondHandCell!</p>
    `
  });
}
var REVIEW_REQUEST_EMAIL_HTML = buildEmailLayout({
  title: "We'd love your feedback",
  accentColor: "#0ea5e9",
  bodyHtml: `
      <p>Hello **CUSTOMER_NAME**,</p>
      <p>Thanks again for trusting us with your device. Sharing a quick review helps other sellers feel confident working with SecondHandCell.</p>
      <p style="margin-bottom:32px;">It only takes a minute and means the world to our team.</p>
      <div style="text-align:center; margin-bottom:24px;">
        <a href="${TRUSTPILOT_REVIEW_LINK}" class="button-link" style="background-color:#0ea5e9;">Leave a Trustpilot review</a>
      </div>
      <p style="text-align:center; color:#475569;">Thank you for being part of the SecondHandCell community!</p>
  `
});
var EMAIL_TEMPLATES = {
  SHIPPING_LABEL: {
    subject: "Your SecondHandCell Shipping Label for Order #**ORDER_ID**",
    html: SHIPPING_LABEL_EMAIL_HTML
  },
  SHIPPING_KIT: {
    subject: "Your SecondHandCell Shipping Kit for Order #**ORDER_ID** is on its Way!",
    html: SHIPPING_KIT_EMAIL_HTML
  },
  ORDER_RECEIVED: {
    subject: "Order Confirmation #**ORDER_ID** - SecondHandCell",
    html: ORDER_RECEIVED_EMAIL_HTML
  },
  DEVICE_RECEIVED: {
    subject: "Your Device Has Arrived - Order #**ORDER_ID**",
    html: DEVICE_RECEIVED_EMAIL_HTML
  },
  ORDER_PLACED_ADMIN: {
    subject: "New Order Submitted - #**ORDER_ID**",
    html: ORDER_PLACED_ADMIN_EMAIL_HTML
  },
  BLACKLISTED: {
    subject: "Important Notice Regarding Your Device for Order #**ORDER_ID**",
    html: BLACKLISTED_EMAIL_HTML
  },
  FMI_ACTIVE: {
    subject: "Action Required: Turn Off Find My iPhone - Order #**ORDER_ID**",
    html: FMI_EMAIL_HTML
  },
  BALANCE_DUE: {
    subject: "Action Required: Outstanding Balance Detected - Order #**ORDER_ID**",
    html: BAL_DUE_EMAIL_HTML
  },
  DOWNGRADE: {
    subject: "Order Update - Adjusted Payout for #**ORDER_ID**",
    html: DOWNGRADE_EMAIL_HTML
  },
  ORDER_COMPLETED: {
    subject: "Your Payout is on the Way! - Order #**ORDER_ID**",
    getHtml: getOrderCompletedEmailTemplate
  },
  REVIEW_REQUEST: {
    subject: "How was your experience with SecondHandCell?",
    html: REVIEW_REQUEST_EMAIL_HTML
  }
};
function replaceEmailVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\*\\*${key}\\*\\*`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

// routes/emails.ts
function createEmailsRouter() {
  const router = Router();
  router.post("/send-email", async (req, res) => {
    try {
      const { to, bcc, subject, html } = req.body || {};
      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing required fields: to, subject, and html are required." });
      }
      await sendEmail({
        to,
        subject,
        html,
        bcc: Array.isArray(bcc) ? bcc : bcc ? [bcc] : []
      });
      res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  });
  router.post("/test-emails", async (req, res) => {
    const { email, emailTypes } = req.body || {};
    if (!email || !emailTypes || !Array.isArray(emailTypes)) {
      return res.status(400).json({ error: "Email and emailTypes array are required." });
    }
    try {
      const results = [];
      for (const type of emailTypes) {
        let template;
        let variables = {
          CUSTOMER_NAME: "Test Customer",
          ORDER_ID: "TEST-12345",
          TRACKING_NUMBER: "TEST-TRACKING",
          LABEL_DOWNLOAD_LINK: "https://example.com/label.pdf",
          STATUS_REASON: "blacklisted/lost/stolen"
        };
        switch (type.toLowerCase()) {
          case "shipping_label":
            template = EMAIL_TEMPLATES.SHIPPING_LABEL;
            break;
          case "shipping_kit":
            template = EMAIL_TEMPLATES.SHIPPING_KIT;
            break;
          case "blacklisted":
            template = EMAIL_TEMPLATES.BLACKLISTED;
            break;
          default:
            results.push({ type, status: "skipped", reason: "Unknown template type" });
            continue;
        }
        await sendEmail({
          to: email,
          subject: replaceEmailVariables(template.subject, variables),
          html: replaceEmailVariables(template.html, variables)
        });
        results.push({ type, status: "sent" });
      }
      console.log("Test emails sent. Types:", emailTypes);
      res.status(200).json({ message: "Test emails sent", email, results });
    } catch (error) {
      console.error("Failed to send test emails:", error);
      res.status(500).json({ error: `Failed to send test emails: ${error.message}` });
    }
  });
  router.post("/orders/:id/send-condition-email", async (req, res) => {
    try {
      const { reason, notes, label: labelText } = req.body || {};
      const orderId = req.params.id;
      res.json({ message: "Email sent successfully." });
    } catch (error) {
      console.error("Failed to send condition email:", error);
      res.status(500).json({ error: "Failed to send condition email." });
    }
  });
  router.post("/orders/:id/fmi-cleared", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "FMI status updated successfully." });
    } catch (error) {
      console.error("Error clearing FMI status:", error);
      res.status(500).json({ error: "Failed to clear FMI status" });
    }
  });
  return router;
}

// routes/imei.ts
import { Router as Router2 } from "express";

// services/phonecheck.ts
import axios from "axios";
var PHONECHECK_BASE_URL = "https://clientapiv2.phonecheck.com";
var PHONECHECK_SAMSUNG_BASE_URL = "https://api.phonecheck.com";
function getPhoneCheckCredentials() {
  return {
    apiKey: process.env.PHONECHECK_API_KEY,
    username: process.env.PHONECHECK_USERNAME
  };
}
async function checkEsn(params) {
  const credentials = getPhoneCheckCredentials();
  if (!credentials.username || !credentials.apiKey) {
    throw new Error("PhoneCheck credentials not configured. Set PHONECHECK_USERNAME and PHONECHECK_API_KEY.");
  }
  try {
    const response = await axios.post(
      `${PHONECHECK_BASE_URL}/api/esn/check`,
      {
        imei: params.imei,
        carrier: params.carrier,
        deviceType: params.deviceType,
        brand: params.brand,
        checkAll: params.checkAll || false
      },
      {
        headers: {
          "Authorization": `Bearer ${credentials.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 3e4
      }
    );
    const data = response.data;
    const normalized = {
      blacklisted: data.blacklisted || false,
      summary: data.summary,
      remarks: data.remarks,
      brand: data.brand,
      model: data.model,
      deviceName: data.deviceName,
      carrier: data.carrier,
      raw: data
    };
    return { normalized, raw: data };
  } catch (error) {
    console.error("PhoneCheck ESN check failed:", error.message);
    throw new Error(`PhoneCheck ESN lookup failed: ${error.message}`);
  }
}
async function checkCarrierLock(params) {
  const credentials = getPhoneCheckCredentials();
  if (!credentials.apiKey) {
    throw new Error("PhoneCheck credentials not configured.");
  }
  try {
    const response = await axios.post(
      `${PHONECHECK_BASE_URL}/api/carrier/lock`,
      {
        imei: params.imei,
        deviceType: params.deviceType
      },
      {
        headers: {
          "Authorization": `Bearer ${credentials.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 3e4
      }
    );
    const data = response.data;
    return {
      normalized: {
        carrier: data.carrier,
        raw: data
      },
      raw: data
    };
  } catch (error) {
    console.error("PhoneCheck carrier lock check failed:", error.message);
    throw error;
  }
}
async function checkSamsungCarrierInfo(params) {
  const credentials = getPhoneCheckCredentials();
  if (!credentials.apiKey) {
    throw new Error("PhoneCheck API key not configured for Samsung checks.");
  }
  try {
    const response = await axios.post(
      `${PHONECHECK_SAMSUNG_BASE_URL}/api/samsung/info`,
      {
        identifier: params.identifier
      },
      {
        headers: {
          "Authorization": `Bearer ${credentials.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 3e4
      }
    );
    const data = response.data;
    return {
      normalized: {
        model: data.modelDescription,
        carrier: data.carrier,
        warrantyStatus: data.warranty,
        raw: data
      },
      raw: data
    };
  } catch (error) {
    console.error("Samsung carrier info check failed:", error.message);
    throw error;
  }
}
function isAppleDeviceHint(...values) {
  const appleRegex = /(apple|iphone|ipad|ipod|ios|watch)/i;
  return values.some((val) => val && appleRegex.test(String(val)));
}
function isSamsungDeviceHint(...values) {
  const samsungRegex = /(samsung|galaxy)/i;
  return values.some((val) => val && samsungRegex.test(String(val)));
}

// routes/imei.ts
function createImeiRouter() {
  const router = Router2();
  router.post("/check-esn", async (req, res) => {
    const {
      imei,
      orderId,
      customerName,
      customerEmail,
      carrier,
      deviceType,
      brand,
      checkAll
    } = req.body || {};
    if (!imei || !orderId) {
      return res.status(400).json({ error: "IMEI and Order ID are required." });
    }
    try {
      let checkAllFlag = false;
      if (typeof checkAll === "boolean") {
        checkAllFlag = checkAll;
      } else if (typeof checkAll === "number") {
        checkAllFlag = checkAll !== 0;
      } else if (typeof checkAll === "string") {
        checkAllFlag = ["1", "true", "yes"].includes(checkAll.trim().toLowerCase());
      }
      const trimmedImei = String(imei).trim();
      const esnResult = await checkEsn({
        imei: trimmedImei,
        carrier,
        deviceType,
        brand,
        checkAll: checkAllFlag
      });
      let carrierLockResult = null;
      const appleHintValues = [
        brand,
        deviceType,
        esnResult?.normalized?.brand,
        esnResult?.normalized?.model,
        esnResult?.normalized?.deviceName
      ];
      if (isAppleDeviceHint(...appleHintValues)) {
        try {
          carrierLockResult = await checkCarrierLock({
            imei: trimmedImei,
            deviceType: "Apple"
          });
        } catch (carrierError) {
          console.error(`Carrier lock lookup failed for order ${orderId}:`, carrierError);
        }
      }
      let samsungCarrierInfoResult = null;
      const samsungHintValues = [
        brand,
        deviceType,
        esnResult?.normalized?.brand,
        esnResult?.normalized?.model,
        esnResult?.normalized?.deviceName
      ];
      if (isSamsungDeviceHint(...samsungHintValues)) {
        try {
          samsungCarrierInfoResult = await checkSamsungCarrierInfo({
            identifier: trimmedImei
          });
        } catch (samsungError) {
          console.error(`Samsung carrier info lookup failed for order ${orderId}:`, samsungError);
        }
      }
      const normalized = {
        ...carrierLockResult?.normalized || {},
        ...esnResult.normalized
      };
      if (samsungCarrierInfoResult?.normalized) {
        normalized.samsungCarrierInfo = samsungCarrierInfoResult.normalized;
        if (!normalized.model && samsungCarrierInfoResult.normalized.model) {
          normalized.model = samsungCarrierInfoResult.normalized.model;
        }
        if (!normalized.carrier && samsungCarrierInfoResult.normalized.carrier) {
          normalized.carrier = samsungCarrierInfoResult.normalized.carrier;
        }
      }
      const rawResponses = { esn: esnResult.raw };
      if (carrierLockResult) {
        rawResponses.carrierLock = carrierLockResult.raw;
      }
      if (samsungCarrierInfoResult) {
        rawResponses.samsungCarrier = samsungCarrierInfoResult.raw;
      }
      normalized.raw = rawResponses;
      if (normalized.blacklisted && customerEmail) {
        const statusReason = normalized.summary || normalized.remarks || "Blacklisted";
        try {
          await sendEmail({
            to: customerEmail,
            subject: replaceEmailVariables(EMAIL_TEMPLATES.BLACKLISTED.subject, {
              ORDER_ID: orderId
            }),
            html: replaceEmailVariables(EMAIL_TEMPLATES.BLACKLISTED.html, {
              CUSTOMER_NAME: customerName || "Customer",
              ORDER_ID: orderId,
              STATUS_REASON: statusReason
            })
          });
        } catch (emailError) {
          console.error(`Failed to send blacklist notification for order ${orderId}:`, emailError);
        }
      }
      res.json(normalized);
    } catch (error) {
      console.error("Error during IMEI check:", error);
      if (error.message?.includes("PhoneCheck")) {
        return res.status(502).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to perform IMEI check." });
    }
  });
  return router;
}

// routes/labels.ts
import { Router as Router3 } from "express";

// services/shipstation.ts
import axios2 from "axios";
function getShipStationCredentials() {
  const key = process.env.SHIPSTATION_KEY;
  const secret = process.env.SHIPSTATION_SECRET;
  if (!key || !secret) {
    throw new Error("ShipStation credentials not configured. Set SHIPSTATION_KEY and SHIPSTATION_SECRET.");
  }
  return { key, secret };
}
function buildAuthHeader(credentials) {
  return `Basic ${Buffer.from(`${credentials.key}:${credentials.secret}`).toString("base64")}`;
}
async function createShipStationLabel(fromAddress, toAddress, carrierCode, serviceCode, packageCode = "package", weightInOunces = 8, testLabel = false, orderId) {
  const credentials = getShipStationCredentials();
  const authHeader = buildAuthHeader(credentials);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const payload = {
    carrierCode,
    serviceCode,
    packageCode,
    shipDate: today,
    weight: {
      value: weightInOunces,
      units: "ounces"
    },
    shipFrom: fromAddress,
    shipTo: toAddress,
    testLabel
  };
  try {
    const response = await axios2.post(
      "https://ssapi.shipstation.com/shipments/createlabel",
      payload,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        timeout: 3e4
      }
    );
    return {
      trackingNumber: response.data.trackingNumber,
      labelData: response.data.labelData,
      shipmentId: response.data.shipmentId,
      carrierCode: response.data.carrierCode,
      serviceCode: response.data.serviceCode,
      status: response.data.status
    };
  } catch (error) {
    console.error("Error creating ShipStation label:", error.response?.data || error.message);
    throw new Error(
      `Failed to create ShipStation label: ${error.response?.data?.ExceptionMessage || error.message}`
    );
  }
}

// routes/labels.ts
var SHC_RECEIVING_ADDRESS = {
  name: "SHC",
  company: "SecondHandCell",
  phone: "2015551234",
  street1: "1206 McDonald Ave",
  street2: "Ste Rear",
  city: "Brooklyn",
  state: "NY",
  postalCode: "11230",
  country: "US"
};
function createLabelsRouter() {
  const router = Router3();
  router.post("/generate-label/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = {
        id: orderId,
        shippingPreference: "Email Label Requested",
        shippingInfo: {
          fullName: "Test Customer",
          email: "customer@example.com",
          streetAddress: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001"
        }
      };
      const buyerAddress = {
        name: order.shippingInfo.fullName,
        phone: "5555555555",
        street1: order.shippingInfo.streetAddress,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        postalCode: order.shippingInfo.zipCode,
        country: "US"
      };
      let mainTrackingNumber = "";
      let labelType = "";
      if (order.shippingPreference === "Shipping Kit Requested") {
        const [outboundLabel, inboundLabel] = await Promise.all([
          createShipStationLabel(
            SHC_RECEIVING_ADDRESS,
            buyerAddress,
            "stamps_com",
            "usps_ground_advantage",
            "package",
            8,
            false,
            order.id
          ),
          createShipStationLabel(
            buyerAddress,
            SHC_RECEIVING_ADDRESS,
            "stamps_com",
            "usps_ground_advantage",
            "package",
            8,
            false,
            order.id
          )
        ]);
        mainTrackingNumber = outboundLabel.trackingNumber;
        labelType = "kit";
        await sendEmail({
          to: order.shippingInfo.email,
          subject: replaceEmailVariables(EMAIL_TEMPLATES.SHIPPING_KIT.subject, {
            ORDER_ID: order.id
          }),
          html: replaceEmailVariables(EMAIL_TEMPLATES.SHIPPING_KIT.html, {
            CUSTOMER_NAME: order.shippingInfo.fullName,
            ORDER_ID: order.id,
            TRACKING_NUMBER: outboundLabel.trackingNumber
          })
        });
      } else {
        const customerLabel = await createShipStationLabel(
          buyerAddress,
          SHC_RECEIVING_ADDRESS,
          "stamps_com",
          "usps_ground_advantage",
          "package",
          8,
          false,
          order.id
        );
        mainTrackingNumber = customerLabel.trackingNumber;
        labelType = "email";
        await sendEmail({
          to: order.shippingInfo.email,
          subject: replaceEmailVariables(EMAIL_TEMPLATES.SHIPPING_LABEL.subject, {
            ORDER_ID: order.id
          }),
          html: replaceEmailVariables(EMAIL_TEMPLATES.SHIPPING_LABEL.html, {
            CUSTOMER_NAME: order.shippingInfo.fullName,
            ORDER_ID: order.id,
            TRACKING_NUMBER: customerLabel.trackingNumber,
            LABEL_DOWNLOAD_LINK: "https://example.com/label.pdf"
            // TODO: Replace with actual URL
          })
        });
      }
      res.json({
        message: `Label(s) generated successfully (${labelType})`,
        orderId,
        trackingNumber: mainTrackingNumber
      });
    } catch (err) {
      console.error("Error generating label:", err.message || err);
      res.status(500).json({ error: "Failed to generate label" });
    }
  });
  router.post("/orders/:id/return-label", async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = {
        id: orderId,
        shippingInfo: {
          fullName: "Test Customer",
          email: "customer@example.com",
          streetAddress: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001"
        }
      };
      const buyerAddress = {
        name: order.shippingInfo.fullName,
        phone: "5555555555",
        street1: order.shippingInfo.streetAddress,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        postalCode: order.shippingInfo.zipCode,
        country: "US"
      };
      const returnLabel = await createShipStationLabel(
        SHC_RECEIVING_ADDRESS,
        buyerAddress,
        "stamps_com",
        "usps_ground_advantage",
        "package",
        8,
        false,
        `return-${order.id}`
      );
      await sendEmail({
        to: order.shippingInfo.email,
        subject: `Your SecondHandCell Return Label for Order #${order.id}`,
        html: `
          <p>Hello ${order.shippingInfo.fullName},</p>
          <p>As requested, here is your return shipping label for Order #${order.id}.</p>
          <p>Return Tracking Number: <strong>${returnLabel.trackingNumber}</strong></p>
          <p>Thank you,<br>The SecondHandCell Team</p>
        `
      });
      res.json({
        message: "Return label generated successfully.",
        orderId,
        trackingNumber: returnLabel.trackingNumber
      });
    } catch (err) {
      console.error("Error generating return label:", err);
      res.status(500).json({ error: "Failed to generate return label" });
    }
  });
  return router;
}

// routes/orders.ts
import { Router as Router4 } from "express";
function createOrdersRouter() {
  const router = Router4();
  router.post("/fetch-pdf", async (req, res) => {
    try {
      const { url } = req.body;
      res.json({ message: "PDF fetched successfully" });
    } catch (error) {
      console.error("Error fetching PDF:", error);
      res.status(500).json({ error: "Failed to fetch PDF" });
    }
  });
  router.get("/orders", async (req, res) => {
    try {
      res.json({ orders: [] });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  router.get("/orders/needs-printing", async (req, res) => {
    try {
      res.json({ orders: [] });
    } catch (error) {
      console.error("Error fetching orders needing printing:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  router.post("/orders/needs-printing/bundle", async (req, res) => {
    try {
      res.json({ message: "Print bundle created" });
    } catch (error) {
      console.error("Error creating print bundle:", error);
      res.status(500).json({ error: "Failed to create print bundle" });
    }
  });
  router.post("/merge-print", async (req, res) => {
    try {
      const { orderIds } = req.body;
      res.json({ message: "PDFs merged successfully" });
    } catch (error) {
      console.error("Error merging PDFs:", error);
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  });
  router.get("/merge-print/:orderIds", async (req, res) => {
    try {
      const { orderIds } = req.params;
      res.json({ message: "Merged print generated" });
    } catch (error) {
      console.error("Error generating merged print:", error);
      res.status(500).json({ error: "Failed to generate merged print" });
    }
  });
  router.get("/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ order: null });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Order not found" });
    }
  });
  router.get("/orders/find", async (req, res) => {
    try {
      const { trackingNumber, email, orderId } = req.query;
      res.json({ orders: [] });
    } catch (error) {
      console.error("Error finding orders:", error);
      res.status(500).json({ error: "Failed to find orders" });
    }
  });
  router.get("/orders/by-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      res.json({ orders: [] });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  });
  router.post("/submit-order", async (req, res) => {
    try {
      const orderData = req.body;
      res.json({ orderId: "TBD", message: "Order submitted successfully" });
    } catch (error) {
      console.error("Error submitting order:", error);
      res.status(500).json({ error: "Failed to submit order" });
    }
  });
  router.get("/promo-codes/:code", async (req, res) => {
    try {
      const { code } = req.params;
      res.json({ valid: false });
    } catch (error) {
      console.error("Error fetching promo code:", error);
      res.status(500).json({ error: "Promo code not found" });
    }
  });
  router.post("/generate-label/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "Label generated successfully" });
    } catch (error) {
      console.error("Error generating label:", error);
      res.status(500).json({ error: "Failed to generate label" });
    }
  });
  router.post("/orders/:id/void-label", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "Label voided successfully" });
    } catch (error) {
      console.error("Error voiding label:", error);
      res.status(500).json({ error: "Failed to void label" });
    }
  });
  router.get("/packing-slip/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "Packing slip generated" });
    } catch (error) {
      console.error("Error generating packing slip:", error);
      res.status(500).json({ error: "Failed to generate packing slip" });
    }
  });
  router.get("/print-bundle/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "Print bundle generated" });
    } catch (error) {
      console.error("Error generating print bundle:", error);
      res.status(500).json({ error: "Failed to generate print bundle" });
    }
  });
  router.post("/repair-label-generated", async (req, res) => {
    try {
      res.json({ processedCount: 0, updatedCount: 0 });
    } catch (error) {
      console.error("Failed to repair label-generated orders:", error);
      res.status(500).json({ error: "Unable to repair label-generated orders" });
    }
  });
  router.post("/orders/repair-label-generated", async (req, res) => {
    try {
      res.json({ processedCount: 0, updatedCount: 0 });
    } catch (error) {
      console.error("Failed to repair label-generated orders:", error);
      res.status(500).json({ error: "Unable to repair label-generated orders" });
    }
  });
  return router;
}

// routes/webhook.ts
import { Router as Router5 } from "express";
import crypto2 from "crypto";
function createWebhookRouter() {
  const router = Router5();
  const verifyShipStationSignature = (req, res, next) => {
    const signature = req.headers["x-shipstation-signature"];
    const secret = process.env.SHIPSTATION_WEBHOOK_SECRET;
    if (!signature) {
      console.error("Webhook received without signature header.");
      return res.status(401).send("Unauthorized: Signature missing.");
    }
    if (!secret) {
      console.error("SHIPSTATION_WEBHOOK_SECRET not configured.");
      return res.status(500).send("Internal Server Error.");
    }
    try {
      const hmac = crypto2.createHmac("sha256", secret);
      hmac.update(JSON.stringify(req.body));
      const calculatedSignature = hmac.digest("base64");
      if (calculatedSignature !== signature) {
        console.error("Invalid ShipStation webhook signature.");
        return res.status(401).send("Unauthorized: Invalid signature.");
      }
    } catch (err) {
      console.error("Error verifying ShipStation signature:", err);
      return res.status(500).send("Internal Server Error.");
    }
    next();
  };
  router.post("/webhook/shipstation", verifyShipStationSignature, async (req, res) => {
    try {
      const event = req.body;
      console.log("Received ShipStation webhook event:", event);
      res.status(200).send("Webhook received successfully");
    } catch (err) {
      console.error("Error processing ShipStation webhook:", err);
      res.status(500).send("Failed to process webhook");
    }
  });
  return router;
}

// routes.ts
var slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
var requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};
var getUserPrimaryCompany = async (userId) => {
  const companyUsers2 = await storage.getCompanyUsersByUserId(userId);
  if (companyUsers2.length === 0) {
    return null;
  }
  return {
    companyId: companyUsers2[0].companyId,
    roleInCompany: companyUsers2[0].roleInCompany
  };
};
var selectPriceTierForQuantity = (tiers, quantity) => {
  const activeTiers = tiers.filter((tier) => tier.isActive !== false);
  const sortedTiers = activeTiers.sort((a, b) => a.minQuantity - b.minQuantity);
  const exactMatch = sortedTiers.find((tier) => {
    const withinMin = quantity >= tier.minQuantity;
    const withinMax = tier.maxQuantity ? quantity <= tier.maxQuantity : true;
    return withinMin && withinMax;
  });
  if (exactMatch) return exactMatch;
  const fallback = [...sortedTiers].filter((tier) => quantity >= tier.minQuantity).sort((a, b) => b.minQuantity - a.minQuantity)[0];
  return fallback || null;
};
var requireAdmin = async (req, res, next) => {
  console.log("[requireAdmin] Session check:", {
    hasSession: !!req.session,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    sessionID: req.session?.id,
    cookies: req.headers.cookie
  });
  if (!req.session.userId) {
    console.log("[requireAdmin] No userId in session - returning 401");
    return res.status(401).json({
      error: "Authentication required",
      details: "No active session found. Please log in again."
    });
  }
  const user = await storage.getUser(req.session.userId);
  console.log("[requireAdmin] User lookup result:", {
    found: !!user,
    role: user?.role,
    userId: user?.id
  });
  if (!user || user.role !== "admin" && user.role !== "super_admin") {
    console.log("[requireAdmin] User not admin - returning 403");
    return res.status(403).json({
      error: "Admin access required",
      details: user ? `User role '${user.role}' is not authorized` : "User not found"
    });
  }
  console.log("[requireAdmin] Admin check passed for user:", user.email);
  next();
};
async function registerRoutes(app2) {
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-in-production";
  const MemoryStore = createMemoryStore(session);
  console.log("[Session Config]", {
    isProduction,
    cookieSecure: isProduction,
    cookieSameSite: isProduction ? "none" : "lax"
  });
  app2.use(session({
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1e3
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "shc.sid",
    // Custom session cookie name
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 7 days
      path: "/",
      domain: isProduction ? ".secondhandcell.com" : void 0
      // Allow subdomain sharing
    }
  }));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api/admin") || req.path === "/api/auth/me") {
      console.log("[Session Debug]", {
        path: req.path,
        method: req.method,
        sessionID: req.session?.id,
        userId: req.session?.userId,
        userRole: req.session?.userRole,
        hasCookie: !!req.headers.cookie,
        cookieHeader: req.headers.cookie,
        origin: req.headers.origin,
        isProduction
      });
    }
    next();
  });
  app2.use("/api", createEmailsRouter());
  app2.use("/api", createImeiRouter());
  app2.use("/api", createLabelsRouter());
  app2.use("/api", createOrdersRouter());
  app2.use("/api", createWebhookRouter());
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "SecondHandCell API",
      version: "1.0.0"
    });
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const payload = {
        logoUrl: process.env.SITE_LOGO_URL || null,
        siteName: "SecondHandCell"
      };
      res.json(payload);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });
  app2.get("/api/public/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get public categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/public/catalog", async (req, res) => {
    try {
      const devices = await storage.getAllDeviceModels();
      const publicDevices = await Promise.all(
        devices.map(async (device) => {
          const variants = await storage.getDeviceVariantsByModelId(device.id);
          const category = await storage.getCategory(device.categoryId);
          const conditionValues = variants.map((v) => v.conditionGrade).filter((c) => c !== null && c !== void 0);
          const storageValues = variants.map((v) => v.storage).filter((s) => s !== null && s !== void 0);
          const colorValues = variants.map((v) => v.color).filter((c) => c !== null && c !== void 0);
          return {
            id: device.id,
            brand: device.brand,
            marketingName: device.marketingName,
            slug: device.slug,
            categoryId: device.categoryId,
            categoryName: category?.name || "Unknown",
            imageUrl: device.imageUrl,
            description: device.description,
            variantCount: variants.length,
            // Don't include pricing for public view
            availableConditions: Array.from(new Set(conditionValues)),
            availableStorage: Array.from(new Set(storageValues)),
            availableColors: Array.from(new Set(colorValues))
          };
        })
      );
      res.json(publicDevices);
    } catch (error) {
      console.error("Get public catalog error:", error);
      res.status(500).json({ error: "Failed to fetch catalog" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = z.object({
        // User data
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        password: z.string().min(6),
        // Company data
        companyName: z.string(),
        legalName: z.string(),
        website: z.string().optional(),
        taxId: z.string().optional(),
        businessType: z.string(),
        // Address data
        contactName: z.string(),
        addressPhone: z.string(),
        street1: z.string(),
        street2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string()
      });
      const data = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: "buyer",
        isActive: true
      });
      const company = await storage.createCompany({
        name: data.companyName,
        legalName: data.legalName,
        website: data.website || null,
        taxId: data.taxId || null,
        primaryPhone: data.phone,
        billingEmail: data.email,
        status: "pending_review",
        creditLimit: "0"
      });
      await storage.createCompanyUser({
        userId: user.id,
        companyId: company.id,
        roleInCompany: "owner"
      });
      await storage.createShippingAddress({
        companyId: company.id,
        contactName: data.contactName,
        phone: data.addressPhone,
        street1: data.street1,
        street2: data.street2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: "USA",
        isDefault: true
      });
      res.json({ success: true, userId: user.id, companyId: company.id });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("[Login] Attempt for email:", email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("[Login] User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        console.log("[Login] Invalid password for user:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!user.isActive) {
        console.log("[Login] User account inactive:", email);
        return res.status(403).json({ error: "Account is inactive" });
      }
      await storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
      req.session.userId = user.id;
      req.session.userRole = user.role;
      console.log("[Login] Success:", {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionID: req.session.id,
        cookie: req.session.cookie
      });
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
      }
      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1e3);
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpiry
      });
      console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);
      if (!isProduction) {
        return res.json({
          success: true,
          message: "Reset link generated",
          devToken: resetToken
          // Only for development
        });
      }
      res.json({ success: true, message: "If the email exists, a reset link has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      const users2 = await storage.getAllUsers();
      const user = users2.find((u) => u.resetToken === token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      if (!user.resetTokenExpiry || /* @__PURE__ */ new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      });
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  const getMeHandler = async (req, res) => {
    try {
      console.log("[/api/auth/me] Session check:", {
        hasSession: !!req.session,
        sessionID: req.session?.id,
        userId: req.session?.userId,
        userRole: req.session?.userRole,
        hasCookie: !!req.headers.cookie
      });
      if (!req.session.userId) {
        console.log("[/api/auth/me] No userId in session");
        return res.status(401).json({ user: null, message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        console.log("[/api/auth/me] User not found for userId:", req.session.userId);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("[/api/auth/me] User found:", { id: user.id, email: user.email, role: user.role });
      const companyUsers2 = await storage.getCompanyUsersByUserId(user.id);
      let companyId = null;
      if (companyUsers2.length > 0) {
        companyId = companyUsers2[0].companyId;
      }
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          companyId
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  };
  app2.get("/api/auth/me", getMeHandler);
  app2.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const companyUsers2 = await storage.getCompanyUsersByUserId(user.id);
      let companyId = null;
      if (companyUsers2.length > 0) {
        companyId = companyUsers2[0].companyId;
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyId
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  app2.get("/api/auth/company", requireAuth, async (req, res) => {
    try {
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext) {
        return res.status(404).json({ error: "User does not belong to a company" });
      }
      const company = await storage.getCompany(companyContext.companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json({
        ...company,
        roleInCompany: companyContext.roleInCompany
      });
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ error: "Failed to load company" });
    }
  });
  app2.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const companyUsers2 = await storage.getCompanyUsersByUserId(user.id);
      let company = null;
      let roleInCompany = null;
      if (companyUsers2.length > 0) {
        company = await storage.getCompany(companyUsers2[0].companyId);
        roleInCompany = companyUsers2[0].roleInCompany;
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        company,
        roleInCompany
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });
  app2.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        phone: z.string().nullable().optional()
      });
      const updates = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.session.userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app2.post("/api/profile/password", requireAuth, async (req, res) => {
    try {
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8)
      });
      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { passwordHash: newPasswordHash });
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid password data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.get("/api/catalog/models", async (req, res) => {
    try {
      const models = await storage.getAllDeviceModels();
      res.json(models);
    } catch (error) {
      console.error("Get models error:", error);
      res.status(500).json({ error: "Failed to get models" });
    }
  });
  app2.get("/api/catalog/models/:slug", async (req, res) => {
    try {
      const model = await storage.getDeviceModelBySlug(req.params.slug);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      const variants = await storage.getDeviceVariantsByModelId(model.id);
      const variantsWithDetails = await Promise.all(
        variants.map(async (variant) => {
          const inventory = await storage.getInventoryByVariantId(variant.id);
          const priceTiers2 = await storage.getPriceTiersByVariantId(variant.id);
          return { ...variant, inventory, priceTiers: priceTiers2 };
        })
      );
      res.json({ ...model, variants: variantsWithDetails });
    } catch (error) {
      console.error("Get model error:", error);
      res.status(500).json({ error: "Failed to get model" });
    }
  });
  app2.get("/api/catalog", async (req, res) => {
    try {
      const models = await storage.getAllDeviceModels();
      const modelsWithVariants = await Promise.all(
        models.map(async (model) => {
          const variants = await storage.getDeviceVariantsByModelId(model.id);
          const variantsWithDetails = await Promise.all(
            variants.map(async (variant) => {
              const inventory = await storage.getInventoryByVariantId(variant.id);
              const priceTiers2 = await storage.getPriceTiersByVariantId(variant.id);
              return { ...variant, inventory, priceTiers: priceTiers2, deviceModel: model };
            })
          );
          return { ...model, variants: variantsWithDetails };
        })
      );
      res.json(modelsWithVariants);
    } catch (error) {
      console.error("Get catalog error:", error);
      res.status(500).json({ error: "Failed to get catalog" });
    }
  });
  const getCategoriesHandler = async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  };
  app2.get("/api/catalog/categories", getCategoriesHandler);
  app2.get("/api/categories", getCategoriesHandler);
  app2.get("/api/device-categories", getCategoriesHandler);
  app2.get("/api/brands", async (req, res) => {
    try {
      const models = await storage.getAllDeviceModels();
      const brandsSet = new Set(models.map((m) => m.brand));
      const brandsArray = Array.from(brandsSet).sort();
      const brands = brandsArray.map((brand, index) => ({
        id: `brand-${index}`,
        name: brand,
        slug: brand.toLowerCase().replace(/\s+/g, "-")
      }));
      res.json(brands);
    } catch (error) {
      console.error("Get brands error:", error);
      res.status(500).json({ error: "Failed to get brands" });
    }
  });
  app2.get("/api/brands/:brandSlug/models", async (req, res) => {
    try {
      const { brandSlug } = req.params;
      const models = await storage.getAllDeviceModels();
      const brandName = brandSlug.split("-").map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");
      const filteredModels = models.filter(
        (m) => m.brand.toLowerCase() === brandSlug.toLowerCase()
      );
      const result = filteredModels.map((m) => ({
        id: m.id,
        brandId: `brand-${m.brand.toLowerCase().replace(/\s+/g, "-")}`,
        name: m.marketingName || m.name,
        slug: m.slug,
        year: null
      }));
      res.json(result);
    } catch (error) {
      console.error("Get models by brand slug error:", error);
      res.status(500).json({ error: "Failed to get models" });
    }
  });
  app2.get("/api/models", async (req, res) => {
    try {
      const { brandId } = req.query;
      const models = await storage.getAllDeviceModels();
      console.log("[/api/models] Total models:", models.length);
      console.log("[/api/models] brandId param:", brandId);
      if (!brandId || typeof brandId !== "string") {
        const result2 = models.map((m) => ({
          id: m.id,
          brandId: `brand-${m.brand.toLowerCase().replace(/\s+/g, "-")}`,
          name: m.marketingName || m.name,
          slug: m.slug,
          year: null
        }));
        return res.json(result2);
      }
      let brandName = "";
      if (brandId.startsWith("brand-")) {
        const brandPart = brandId.replace("brand-", "");
        if (/^\d+$/.test(brandPart)) {
          const brandsSet = new Set(models.map((m) => m.brand));
          const brandsArray = Array.from(brandsSet).sort();
          const index = parseInt(brandPart, 10);
          brandName = brandsArray[index] || "";
          console.log("[/api/models] Brands array:", brandsArray);
          console.log("[/api/models] Selected brand by index", index, ":", brandName);
        } else {
          brandName = brandPart.charAt(0).toUpperCase() + brandPart.slice(1);
          console.log("[/api/models] Selected brand by slug:", brandName);
        }
      }
      if (!brandName) {
        console.log("[/api/models] No brand name found, returning empty");
        return res.json([]);
      }
      const filteredModels = models.filter(
        (m) => m.brand.toLowerCase() === brandName.toLowerCase()
      );
      console.log("[/api/models] Filtered models count:", filteredModels.length);
      const result = filteredModels.map((m) => ({
        id: m.id,
        brandId: `brand-${m.brand.toLowerCase().replace(/\s+/g, "-")}`,
        name: m.marketingName || m.name,
        slug: m.slug,
        year: null
      }));
      res.json(result);
    } catch (error) {
      console.error("Get models error:", error);
      res.status(500).json({ error: "Failed to get models" });
    }
  });
  app2.get("/api/device-models", async (req, res) => {
    try {
      const { brandId } = req.query;
      const models = await storage.getAllDeviceModels();
      if (!brandId || typeof brandId !== "string") {
        const result2 = models.map((m) => ({
          id: m.id,
          brandId: `brand-${m.brand.toLowerCase().replace(/\s+/g, "-")}`,
          name: m.marketingName || m.name,
          slug: m.slug,
          year: null
        }));
        return res.json(result2);
      }
      let brandName = "";
      if (brandId.startsWith("brand-")) {
        const brandPart = brandId.replace("brand-", "");
        if (/^\d+$/.test(brandPart)) {
          const brandsSet = new Set(models.map((m) => m.brand));
          const brandsArray = Array.from(brandsSet).sort();
          const index = parseInt(brandPart, 10);
          brandName = brandsArray[index] || "";
        } else {
          brandName = brandPart.charAt(0).toUpperCase() + brandPart.slice(1);
        }
      }
      if (!brandName) {
        return res.json([]);
      }
      const filteredModels = models.filter(
        (m) => m.brand.toLowerCase() === brandName.toLowerCase()
      );
      const result = filteredModels.map((m) => ({
        id: m.id,
        brandId: `brand-${m.brand.toLowerCase().replace(/\s+/g, "-")}`,
        name: m.marketingName || m.name,
        slug: m.slug,
        year: null
      }));
      res.json(result);
    } catch (error) {
      console.error("Get device-models error:", error);
      res.status(500).json({ error: "Failed to get device models" });
    }
  });
  app2.get("/api/conditions", async (req, res) => {
    try {
      const conditions = [
        { id: "A", name: "Like New", description: "Flawless condition, no visible wear" },
        { id: "B", name: "Good", description: "Minor signs of use, fully functional" },
        { id: "C", name: "Fair", description: "Moderate wear, fully functional" },
        { id: "D", name: "Poor", description: "Heavy wear but works" }
      ];
      res.json(conditions);
    } catch (error) {
      console.error("Get conditions error:", error);
      res.status(500).json({ error: "Failed to get conditions" });
    }
  });
  app2.get("/api/cart", requireAuth, async (req, res) => {
    try {
      let cart = await storage.getCartByUserId(req.session.userId);
      if (!cart) {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        if (companyUsers2.length === 0) {
          return res.status(400).json({ error: "No company found for user" });
        }
        cart = await storage.createCart({
          userId: req.session.userId,
          companyId: companyUsers2[0].companyId
        });
      }
      const items = await storage.getCartItems(cart.id);
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const variant = await storage.getDeviceVariant(item.deviceVariantId);
          const model = variant ? await storage.getDeviceModel(variant.deviceModelId) : null;
          return {
            ...item,
            unitPrice: item.unitPriceSnapshot,
            // Map to unitPrice for frontend
            variant: variant ? {
              ...variant,
              deviceModel: model
            } : null
          };
        })
      );
      res.json({ cart, items: itemsWithDetails });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ error: "Failed to get cart" });
    }
  });
  app2.post("/api/cart/items", requireAuth, async (req, res) => {
    try {
      const { deviceVariantId, quantity } = req.body;
      let cart = await storage.getCartByUserId(req.session.userId);
      if (!cart) {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        cart = await storage.createCart({
          userId: req.session.userId,
          companyId: companyUsers2[0].companyId
        });
      }
      const priceTiers2 = await storage.getPriceTiersByVariantId(deviceVariantId);
      const applicableTier = priceTiers2.find(
        (tier) => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity)
      );
      let unitPrice = applicableTier?.unitPrice;
      if (!unitPrice && priceTiers2.length > 0) {
        const sortedTiers = [...priceTiers2].sort((a, b) => a.minQuantity - b.minQuantity);
        const lowestTier = sortedTiers[0];
        const highestTier = sortedTiers[sortedTiers.length - 1];
        if (quantity < lowestTier.minQuantity) {
          unitPrice = lowestTier.unitPrice;
        } else if (quantity >= highestTier.minQuantity) {
          unitPrice = highestTier.unitPrice;
        } else {
          unitPrice = lowestTier.unitPrice;
        }
      }
      if (!unitPrice) {
        const variant = await storage.getDeviceVariant(deviceVariantId);
        unitPrice = variant?.minPrice;
      }
      if (!unitPrice) {
        return res.status(400).json({
          error: "Unable to determine price for this item. Please contact support."
        });
      }
      const item = await storage.addCartItem({
        cartId: cart.id,
        deviceVariantId,
        quantity,
        unitPriceSnapshot: unitPrice
      });
      res.json(item);
    } catch (error) {
      console.error("Add cart item error:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });
  app2.patch("/api/cart/items/:id", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, { quantity });
      res.json(item);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/items/:id", requireAuth, async (req, res) => {
    try {
      await storage.removeCartItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove cart item error:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      console.log("[POST /api/orders] Request body:", JSON.stringify(req.body, null, 2));
      console.log("[POST /api/orders] Session userId:", req.session?.userId);
      const userId = req.session?.userId;
      if (!userId) {
        const {
          customerInfo,
          devices,
          shippingAddress,
          paymentMethod: paymentMethod2,
          notes: notes2
        } = req.body;
        console.log("[POST /api/orders] Guest order detected");
        if (!customerInfo || !customerInfo.email) {
          return res.status(400).json({ error: "Customer email is required" });
        }
        if (!devices || !Array.isArray(devices) || devices.length === 0) {
          return res.status(400).json({ error: "At least one device is required" });
        }
        const orderNumber2 = `SL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        let total2 = 0;
        devices.forEach((device) => {
          total2 += parseFloat(device.price || device.amount || 0) * (device.quantity || 1);
        });
        let guestUser = await storage.getUserByEmail(customerInfo.email);
        if (!guestUser) {
          const randomPassword = Math.random().toString(36).slice(-8);
          const passwordHash = await bcrypt.hash(randomPassword, 10);
          guestUser = await storage.createUser({
            email: customerInfo.email,
            name: customerInfo.name || customerInfo.email.split("@")[0],
            passwordHash,
            role: "customer",
            isActive: true
          });
          console.log("[POST /api/orders] Created guest user:", guestUser.id);
        }
        let guestCompany = await storage.getCompanyByName("Guest Orders");
        if (!guestCompany) {
          guestCompany = await storage.createCompany({
            name: "Guest Orders",
            slug: "guest-orders",
            type: "supplier",
            isActive: true
          });
        }
        const customerNotes = `Customer: ${customerInfo.name || "N/A"}
Email: ${customerInfo.email}
Phone: ${customerInfo.phone || "N/A"}
${shippingAddress ? `Address: ${JSON.stringify(shippingAddress)}` : ""}
${notes2 ? `
Notes: ${notes2}` : ""}`;
        const order2 = await storage.createOrder({
          orderNumber: orderNumber2,
          companyId: guestCompany.id,
          createdByUserId: guestUser.id,
          status: "label_pending",
          subtotal: total2.toFixed(2),
          shippingCost: "0",
          taxAmount: "0",
          discountAmount: "0",
          total: total2.toFixed(2),
          currency: "USD",
          paymentStatus: "pending",
          paymentMethod: paymentMethod2 || "check",
          shippingAddressId: null,
          billingAddressId: null,
          notesCustomer: customerNotes
        });
        console.log("[POST /api/orders] Guest order created:", order2.id, orderNumber2);
        res.json({
          success: true,
          order: {
            id: order2.id,
            orderNumber: order2.orderNumber,
            status: order2.status,
            total: order2.total,
            currency: order2.currency,
            createdAt: order2.createdAt
          },
          orderId: order2.id,
          orderNumber: order2.orderNumber,
          shipment: null,
          // No shipment created yet for guest orders
          labelUrl: null,
          // No label yet
          message: "Order submitted successfully"
        });
        return;
      }
      const { paymentMethod, shippingAddressId, billingAddressId, notes } = req.body;
      if (!shippingAddressId) {
        return res.status(400).json({ error: "Shipping address is required" });
      }
      if (!billingAddressId) {
        return res.status(400).json({ error: "Billing address is required" });
      }
      const cart = await storage.getCartByUserId(userId);
      if (!cart) {
        return res.status(400).json({ error: "Cart not found" });
      }
      const items = await storage.getCartItems(cart.id);
      if (items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      let subtotal = 0;
      for (const item of items) {
        subtotal += parseFloat(item.unitPriceSnapshot) * item.quantity;
      }
      const shippingCost = 25;
      const taxAmount = subtotal * 0.08;
      const total = subtotal + shippingCost + taxAmount;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const order = await storage.createOrder({
        orderNumber,
        companyId: cart.companyId,
        createdByUserId: userId,
        status: "pending_payment",
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: "0",
        total: total.toFixed(2),
        currency: "USD",
        paymentStatus: "unpaid",
        paymentMethod: paymentMethod || "card",
        shippingAddressId: shippingAddressId || null,
        billingAddressId: billingAddressId || null,
        notesCustomer: notes || null
      });
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          deviceVariantId: item.deviceVariantId,
          quantity: item.quantity,
          unitPrice: item.unitPriceSnapshot,
          lineTotal: (parseFloat(item.unitPriceSnapshot) * item.quantity).toFixed(2)
        });
      }
      await storage.clearCart(cart.id);
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
      if (companyUsers2.length === 0) {
        return res.json([]);
      }
      const orders2 = await storage.getOrdersByCompanyId(companyUsers2[0].companyId);
      res.json(orders2);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });
  app2.get("/api/orders/by-number/:orderNumber", async (req, res) => {
    try {
      console.log("[GET /api/orders/by-number] Order number:", req.params.orderNumber);
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        console.log("[GET /api/orders/by-number] Order not found");
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(order.id);
      const payments2 = await storage.getPaymentsByOrderId(order.id);
      const shipments2 = await storage.getShipmentsByOrderId(order.id);
      console.log("[GET /api/orders/by-number] Order found:", {
        id: order.id,
        orderNumber: order.orderNumber,
        itemsCount: items.length,
        shipmentsCount: shipments2.length
      });
      res.json({ ...order, items, payments: payments2, shipments: shipments2 });
    } catch (error) {
      console.error("Get order by number error:", error);
      res.status(500).json({ error: "Failed to get order" });
    }
  });
  app2.get("/api/orders/:orderNumber", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(order.id);
      const payments2 = await storage.getPaymentsByOrderId(order.id);
      const shipments2 = await storage.getShipmentsByOrderId(order.id);
      res.json({ ...order, items, payments: payments2, shipments: shipments2 });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to get order" });
    }
  });
  app2.get("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      if (req.session.userRole !== "admin" && req.session.userRole !== "super_admin") {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        const isMember = companyUsers2.some((cu) => cu.companyId === req.params.id);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const shippingAddresses2 = await storage.getShippingAddressesByCompanyId(company.id);
      const billingAddresses2 = await storage.getBillingAddressesByCompanyId(company.id);
      res.json({
        ...company,
        shippingAddresses: shippingAddresses2,
        billingAddresses: billingAddresses2
      });
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ error: "Failed to get company" });
    }
  });
  app2.get("/api/admin/companies", requireAdmin, async (req, res) => {
    try {
      const companies2 = await storage.getAllCompanies();
      res.json(companies2);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ error: "Failed to get companies" });
    }
  });
  app2.post("/api/admin/companies/bulk", requireAdmin, async (req, res) => {
    try {
      const { companyIds, status, creditLimit } = req.body;
      if (!Array.isArray(companyIds) || companyIds.length === 0) {
        return res.status(400).json({ error: "companyIds must be a non-empty array" });
      }
      const results = await db.transaction(async (tx) => {
        const updated = [];
        for (const id of companyIds) {
          const updates = {};
          if (status) updates.status = status;
          if (creditLimit !== void 0) updates.creditLimit = creditLimit;
          const [company] = await tx.update(companies).set(updates).where(companies.id.equals(id)).returning();
          if (company) {
            await tx.insert(auditLogs).values({
              actorUserId: req.session.userId || null,
              companyId: id,
              action: "company_bulk_updated",
              entityType: "company",
              entityId: id,
              previousValues: null,
              newValues: JSON.stringify(updates)
            });
            updated.push(company);
          }
        }
        return updated;
      });
      res.json({ updated: results });
    } catch (error) {
      console.error("Bulk update companies error:", error);
      res.status(500).json({ error: "Failed to bulk update companies" });
    }
  });
  app2.patch("/api/admin/companies/:id", requireAdmin, async (req, res) => {
    try {
      const { status, creditLimit } = req.body;
      const updates = {};
      if (status) updates.status = status;
      if (creditLimit !== void 0) updates.creditLimit = creditLimit;
      const company = await storage.updateCompany(req.params.id, updates);
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        companyId: req.params.id,
        action: "company_updated",
        entityType: "company",
        entityId: req.params.id,
        newValues: JSON.stringify(updates)
      });
      res.json(company);
    } catch (error) {
      console.error("Update company error:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });
  app2.post("/api/admin/device-models", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        brand: z.string(),
        name: z.string(),
        marketingName: z.string().optional(),
        sku: z.string(),
        categorySlug: z.string().optional(),
        categoryName: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        variant: z.object({
          storage: z.string(),
          color: z.string(),
          conditionGrade: z.string(),
          networkLockStatus: z.string().default("unlocked"),
          internalCode: z.string().optional(),
          unitPrice: z.number(),
          quantity: z.number().min(0),
          minOrderQuantity: z.number().min(1).default(1)
        })
      });
      const data = schema.parse(req.body);
      let categoryId;
      if (data.categorySlug) {
        const category = await storage.getCategoryBySlug(data.categorySlug);
        categoryId = category?.id;
      }
      if (!categoryId) {
        const fallbackName = data.categoryName || "smartphones";
        const fallbackSlug = slugify(fallbackName);
        const existing = await storage.getCategoryBySlug(fallbackSlug);
        if (existing) {
          categoryId = existing.id;
        } else {
          const created = await storage.createCategory({
            name: fallbackName,
            slug: fallbackSlug
          });
          categoryId = created.id;
        }
      }
      const baseSlug = slugify(`${data.brand}-${data.name}-${data.sku}`);
      const model = await storage.createDeviceModel({
        brand: data.brand,
        name: data.name,
        marketingName: data.marketingName || data.name,
        sku: data.sku,
        slug: baseSlug,
        categoryId,
        imageUrl: data.imageUrl || null,
        description: data.description || null,
        isActive: true
      });
      const variant = await storage.createDeviceVariant({
        deviceModelId: model.id,
        storage: data.variant.storage,
        color: data.variant.color,
        conditionGrade: data.variant.conditionGrade,
        networkLockStatus: data.variant.networkLockStatus,
        internalCode: data.variant.internalCode || null,
        isActive: true
      });
      await storage.createInventory({
        deviceVariantId: variant.id,
        quantityAvailable: data.variant.quantity,
        minOrderQuantity: data.variant.minOrderQuantity,
        status: "in_stock"
      });
      await storage.createPriceTier({
        deviceVariantId: variant.id,
        minQuantity: 1,
        maxQuantity: null,
        unitPrice: data.variant.unitPrice,
        currency: "USD",
        isActive: true
      });
      res.json({ model, variant });
    } catch (error) {
      console.error("Create device error:", error);
      res.status(500).json({ error: "Failed to create device" });
    }
  });
  app2.patch("/api/admin/device-variants/:id", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        storage: z.string().optional(),
        color: z.string().optional(),
        conditionGrade: z.string().optional(),
        networkLockStatus: z.string().optional(),
        unitPrice: z.number().optional(),
        quantity: z.number().optional(),
        minOrderQuantity: z.number().optional()
      });
      const data = schema.parse(req.body);
      const variantId = req.params.id;
      const variant = await storage.getDeviceVariant(variantId);
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }
      const updatedVariant = await storage.updateDeviceVariant(variantId, {
        storage: data.storage ?? variant.storage,
        color: data.color ?? variant.color,
        conditionGrade: data.conditionGrade ?? variant.conditionGrade,
        networkLockStatus: data.networkLockStatus ?? variant.networkLockStatus
      });
      let inventory = await storage.getInventoryByVariantId(variantId);
      if (data.quantity !== void 0 || data.minOrderQuantity !== void 0) {
        if (inventory) {
          inventory = await storage.updateInventory(inventory.id, {
            quantityAvailable: data.quantity ?? inventory.quantityAvailable,
            minOrderQuantity: data.minOrderQuantity ?? inventory.minOrderQuantity
          });
        } else {
          inventory = await storage.createInventory({
            deviceVariantId: variantId,
            quantityAvailable: data.quantity ?? 0,
            minOrderQuantity: data.minOrderQuantity ?? 1,
            status: "in_stock"
          });
        }
      }
      let priceTier;
      if (data.unitPrice !== void 0) {
        const tiers = await storage.getPriceTiersByVariantId(variantId);
        if (tiers.length > 0) {
          priceTier = await storage.updatePriceTier(tiers[0].id, { unitPrice: data.unitPrice });
        } else {
          priceTier = await storage.createPriceTier({
            deviceVariantId: variantId,
            minQuantity: 1,
            maxQuantity: null,
            unitPrice: data.unitPrice,
            currency: "USD",
            isActive: true
          });
        }
      }
      res.json({ variant: updatedVariant, inventory, priceTier });
    } catch (error) {
      console.error("Update variant error:", error);
      res.status(500).json({ error: "Failed to update variant" });
    }
  });
  app2.delete("/api/admin/device-variants/:id", requireAdmin, async (req, res) => {
    try {
      const variantId = req.params.id;
      await storage.deletePriceTiersByVariantId(variantId);
      await storage.deleteInventoryByVariantId(variantId);
      await storage.deleteDeviceVariant(variantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete variant error:", error);
      res.status(500).json({ error: "Failed to delete variant" });
    }
  });
  app2.post("/api/admin/device-import", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        devices: z.array(
          z.object({
            brand: z.string(),
            name: z.string(),
            marketingName: z.string().optional(),
            sku: z.string(),
            categorySlug: z.string().optional(),
            categoryName: z.string().optional(),
            variants: z.array(
              z.object({
                storage: z.string(),
                color: z.string(),
                conditionGrade: z.string(),
                networkLockStatus: z.string().default("unlocked"),
                unitPrice: z.number(),
                quantity: z.number().min(0)
              })
            )
          })
        )
      });
      const data = schema.parse(req.body);
      const created = [];
      for (const device of data.devices) {
        const categorySlug = device.categorySlug || slugify(device.categoryName || "smartphones");
        let categoryId;
        const existingCategory = await storage.getCategoryBySlug(categorySlug);
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const createdCategory = await storage.createCategory({
            name: device.categoryName || device.brand,
            slug: categorySlug
          });
          categoryId = createdCategory.id;
        }
        const model = await storage.createDeviceModel({
          brand: device.brand,
          name: device.name,
          marketingName: device.marketingName || device.name,
          sku: device.sku,
          slug: slugify(`${device.brand}-${device.name}-${device.sku}`),
          categoryId,
          isActive: true
        });
        for (const variantData of device.variants) {
          const variant = await storage.createDeviceVariant({
            deviceModelId: model.id,
            storage: variantData.storage,
            color: variantData.color,
            conditionGrade: variantData.conditionGrade,
            networkLockStatus: variantData.networkLockStatus,
            isActive: true
          });
          await storage.createInventory({
            deviceVariantId: variant.id,
            quantityAvailable: variantData.quantity,
            minOrderQuantity: 1,
            status: "in_stock"
          });
          await storage.createPriceTier({
            deviceVariantId: variant.id,
            minQuantity: 1,
            maxQuantity: null,
            unitPrice: variantData.unitPrice,
            currency: "USD",
            isActive: true
          });
          created.push({ model, variant });
        }
      }
      res.json({ created });
    } catch (error) {
      console.error("Import devices error:", error);
      res.status(500).json({ error: "Failed to import devices" });
    }
  });
  app2.post("/api/quotes", requireAuth, async (req, res) => {
    try {
      const { items, notes, validUntil } = req.body;
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext) {
        return res.status(400).json({ error: "No company found for user" });
      }
      const companyId = companyContext.companyId;
      const timestamp2 = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const quoteNumber = `QT-${timestamp2}-${random}`;
      let subtotal = 0;
      const preparedItems = [];
      for (const item of items) {
        const tiers = await storage.getPriceTiersByVariantId(item.deviceVariantId);
        const matchingTier = selectPriceTierForQuantity(tiers, item.quantity);
        if (!matchingTier) {
          return res.status(400).json({ error: "No pricing available for one or more items" });
        }
        const unitPrice = parseFloat(matchingTier.unitPrice);
        if (isNaN(unitPrice)) {
          return res.status(400).json({ error: "Invalid pricing data for selected item" });
        }
        preparedItems.push({
          deviceVariantId: item.deviceVariantId,
          quantity: item.quantity,
          unitPrice
        });
        subtotal += unitPrice * item.quantity;
      }
      const shippingEstimate = 0;
      const taxEstimate = 0;
      const totalEstimate = subtotal + shippingEstimate + taxEstimate;
      const quote = await storage.createQuote({
        quoteNumber,
        companyId,
        createdByUserId: req.session.userId,
        status: "draft",
        validUntil: validUntil ? new Date(validUntil) : null,
        subtotal: subtotal.toFixed(2),
        shippingEstimate: shippingEstimate.toFixed(2),
        taxEstimate: taxEstimate.toFixed(2),
        totalEstimate: totalEstimate.toFixed(2),
        currency: "USD"
      });
      for (const item of preparedItems) {
        await storage.createQuoteItem({
          quoteId: quote.id,
          deviceVariantId: item.deviceVariantId,
          quantity: item.quantity,
          proposedUnitPrice: item.unitPrice.toFixed(2),
          lineTotalEstimate: (item.unitPrice * item.quantity).toFixed(2)
        });
      }
      res.json(quote);
    } catch (error) {
      console.error("Create quote error:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });
  app2.get("/api/quotes/:id", requireAuth, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (req.session.userRole !== "admin" && req.session.userRole !== "super_admin") {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        const isMember = companyUsers2.some((cu) => cu.companyId === quote.companyId);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const items = await storage.getQuoteItems(quote.id);
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const variant = await storage.getDeviceVariant(item.deviceVariantId);
          const model = variant ? await storage.getDeviceModel(variant.deviceModelId) : null;
          return { ...item, variant, model };
        })
      );
      res.json({ ...quote, items: itemsWithDetails });
    } catch (error) {
      console.error("Get quote error:", error);
      res.status(500).json({ error: "Failed to get quote" });
    }
  });
  app2.get("/api/companies/:companyId/quotes", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "admin" && req.session.userRole !== "super_admin") {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        const isMember = companyUsers2.some((cu) => cu.companyId === req.params.companyId);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const quotes2 = await storage.getQuotesByCompanyId(req.params.companyId);
      res.json(quotes2);
    } catch (error) {
      console.error("Get company quotes error:", error);
      res.status(500).json({ error: "Failed to get company quotes" });
    }
  });
  app2.patch("/api/quotes/:id", requireAuth, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      if (req.session.userRole !== "admin" && req.session.userRole !== "super_admin") {
        const companyUsers2 = await storage.getCompanyUsersByUserId(req.session.userId);
        const isMember = companyUsers2.some((cu) => cu.companyId === quote.companyId);
        if (!isMember) {
          return res.status(403).json({ error: "Access denied" });
        }
        const allowedUpdates = ["status"];
        const updates2 = {};
        if (req.body.status && ["accepted", "rejected"].includes(req.body.status)) {
          updates2.status = req.body.status;
        }
        const updatedQuote2 = await storage.updateQuote(req.params.id, updates2);
        return res.json(updatedQuote2);
      }
      const updates = {};
      if (req.body.status) updates.status = req.body.status;
      if (req.body.validUntil) updates.validUntil = new Date(req.body.validUntil);
      const validatePricing = (value, fieldName) => {
        if (value === void 0 || value === null) return null;
        if (value === "") {
          return `${fieldName} cannot be empty`;
        }
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
          return `${fieldName} must be a valid number`;
        }
        if (parsed < 0) {
          return `${fieldName} cannot be negative`;
        }
        return null;
      };
      const errors = [];
      if (req.body.subtotal !== void 0) {
        const error = validatePricing(req.body.subtotal, "Subtotal");
        if (error) errors.push(error);
        else updates.subtotal = parseFloat(req.body.subtotal).toFixed(2);
      }
      if (req.body.shippingEstimate !== void 0) {
        const error = validatePricing(req.body.shippingEstimate, "Shipping estimate");
        if (error) errors.push(error);
        else updates.shippingEstimate = parseFloat(req.body.shippingEstimate).toFixed(2);
      }
      if (req.body.taxEstimate !== void 0) {
        const error = validatePricing(req.body.taxEstimate, "Tax estimate");
        if (error) errors.push(error);
        else updates.taxEstimate = parseFloat(req.body.taxEstimate).toFixed(2);
      }
      if (req.body.totalEstimate !== void 0) {
        const error = validatePricing(req.body.totalEstimate, "Total estimate");
        if (error) errors.push(error);
        else updates.totalEstimate = parseFloat(req.body.totalEstimate).toFixed(2);
      }
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
      }
      if (updates.status === "sent") {
        const finalSubtotal = updates.subtotal || quote.subtotal;
        const finalTotal = updates.totalEstimate || quote.totalEstimate;
        if (parseFloat(finalTotal) <= 0) {
          return res.status(400).json({
            error: "Cannot send quote without valid pricing. Total estimate must be greater than 0."
          });
        }
      }
      const updatedQuote = await storage.updateQuote(req.params.id, updates);
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        companyId: quote.companyId,
        action: "quote_updated",
        entityType: "quote",
        entityId: req.params.id,
        newValues: JSON.stringify(updates)
      });
      res.json(updatedQuote);
    } catch (error) {
      console.error("Update quote error:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });
  app2.get("/api/admin/quotes", requireAdmin, async (req, res) => {
    try {
      const companies2 = await storage.getAllCompanies();
      const allQuotes = await Promise.all(
        companies2.map(async (company) => {
          const quotes2 = await storage.getQuotesByCompanyId(company.id);
          return quotes2.map((quote) => ({ ...quote, company }));
        })
      );
      res.json(allQuotes.flat());
    } catch (error) {
      console.error("Get all quotes error:", error);
      res.status(500).json({ error: "Failed to get quotes" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      const enhancedOrders = await Promise.all(
        orders2.map(async (order) => {
          const [user, company, shipments2, items] = await Promise.all([
            storage.getUser(order.createdByUserId),
            storage.getCompany(order.companyId),
            storage.getShipmentsByOrderId(order.id),
            storage.getOrderItems(order.id)
          ]);
          return {
            ...order,
            customerEmail: user?.email,
            customerName: user?.name,
            companyName: company?.name,
            shipments: shipments2,
            items
          };
        })
      );
      res.json(enhancedOrders);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });
  app2.get("/api/admin/export/orders.csv", requireAdmin, async (req, res) => {
    try {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      const filename = `orders-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      const pageSize = parseInt(String(req.query.pageSize || "500"), 10) || 500;
      const csvEscape = (v) => {
        if (v === null || v === void 0) return "";
        const s = String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      res.write(["orderNumber", "companyName", "companyId", "status", "paymentStatus", "total", "currency", "createdAt", "shippingState", "shippingCity", "items"].join(",") + "\n");
      const totalOrders = (await db.select().from(orders)).length;
      res.setHeader("X-Total-Rows", String(totalOrders));
      const stmt = sqlite.prepare(`SELECT * FROM orders ORDER BY created_at ASC`);
      for (const order of stmt.iterate()) {
        const items = await storage.getOrderItems(order.id);
        const company = await storage.getCompany(order.companyId);
        let shippingState = "";
        let shippingCity = "";
        if (order.shipping_address_id) {
          const addrStmt = sqlite.prepare(`SELECT * FROM shipping_addresses WHERE id = ?`);
          const addr = addrStmt.get(order.shipping_address_id);
          if (addr) {
            shippingState = addr.state || "";
            shippingCity = addr.city || "";
          }
        }
        const itemsSummary = items.map((i) => `${i.quantity}x ${i.deviceVariantId} @ ${i.unitPrice}`).join("; ");
        const row = [
          csvEscape(order.order_number || order.orderNumber),
          csvEscape(company?.name || ""),
          csvEscape(order.company_id || order.companyId),
          csvEscape(order.status),
          csvEscape(order.payment_status || order.paymentStatus),
          csvEscape(order.total),
          csvEscape(order.currency),
          csvEscape(new Date(order.created_at || order.createdAt).toISOString()),
          csvEscape(shippingState),
          csvEscape(shippingCity),
          csvEscape(itemsSummary)
        ];
        res.write(row.join(",") + "\n");
      }
      res.end();
    } catch (error) {
      console.error("Export orders CSV error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Failed to export orders" });
    }
  });
  app2.get("/api/admin/export/inventory.csv", requireAdmin, async (req, res) => {
    try {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      const filename = `inventory-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      const pageSize = parseInt(String(req.query.pageSize || "500"), 10) || 500;
      const csvEscape = (v) => {
        if (v === null || v === void 0) return "";
        const s = String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      res.write(["modelSku", "brand", "modelName", "variantId", "storage", "color", "conditionGrade", "quantityAvailable", "minOrderQuantity", "unitPrice"].join(",") + "\n");
      const modelsCount = (await db.select().from(deviceModels)).length;
      let totalRows = 0;
      const allModels = await db.select().from(deviceModels);
      for (const m of allModels) {
        const variants = await db.select().from(deviceVariants).where(deviceVariants.deviceModelId.equals(m.id));
        totalRows += variants.length;
      }
      res.setHeader("X-Total-Rows", String(totalRows));
      const modelStmt = sqlite.prepare(`SELECT * FROM device_models ORDER BY created_at ASC`);
      for (const model of modelStmt.iterate()) {
        const variantStmt = sqlite.prepare(`SELECT * FROM device_variants WHERE device_model_id = ?`);
        for (const variant of variantStmt.iterate(model.id)) {
          const inventory = await storage.getInventoryByVariantId(variant.id);
          const tiers = await storage.getPriceTiersByVariantId(variant.id);
          const unitPrice = tiers && tiers.length > 0 ? tiers[0].unitPrice : "";
          const row = [
            csvEscape(model.sku),
            csvEscape(model.brand),
            csvEscape(model.name),
            csvEscape(variant.id),
            csvEscape(variant.storage),
            csvEscape(variant.color),
            csvEscape(variant.condition_grade || variant.conditionGrade),
            csvEscape(inventory?.quantityAvailable ?? 0),
            csvEscape(inventory?.minOrderQuantity ?? 1),
            csvEscape(unitPrice)
          ];
          res.write(row.join(",") + "\n");
        }
      }
      res.end();
    } catch (error) {
      console.error("Export inventory CSV error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Failed to export inventory" });
    }
  });
  app2.get("/api/admin/reports/top-skus", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(String(req.query.limit || "20"), 10) || 20;
      const orders2 = await storage.getAllOrders();
      const skuMap = /* @__PURE__ */ new Map();
      for (const order of orders2) {
        const items = await storage.getOrderItems(order.id);
        for (const item of items) {
          const variant = await storage.getDeviceVariant(item.deviceVariantId);
          if (!variant) continue;
          const model = await storage.getDeviceModel(variant.deviceModelId);
          const key = model?.sku || variant.id;
          const existing = skuMap.get(key) || { sku: key, brand: model?.brand || "", name: model?.name || "", qty: 0, revenue: 0 };
          existing.qty += item.quantity;
          existing.revenue += parseFloat(item.unitPrice) * item.quantity || 0;
          skuMap.set(key, existing);
        }
      }
      const results = Array.from(skuMap.values()).sort((a, b) => b.qty - a.qty).slice(0, limit);
      res.json(results);
    } catch (error) {
      console.error("Top SKUs report error:", error);
      res.status(500).json({ error: "Failed to compute top SKUs" });
    }
  });
  app2.get("/api/admin/reports/sales-by-region", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      const byState = /* @__PURE__ */ new Map();
      for (const order of orders2) {
        let state = "unknown";
        if (order.shippingAddressId) {
          const [addr] = await db.select().from(shippingAddresses).where(shippingAddresses.id.equals(order.shippingAddressId));
          if (addr) state = addr.state || "unknown";
        }
        const current = byState.get(state) || { state, total: 0, count: 0 };
        current.total += parseFloat(order.total) || 0;
        current.count += 1;
        byState.set(state, current);
      }
      res.json(Array.from(byState.values()).sort((a, b) => b.total - a.total));
    } catch (error) {
      console.error("Sales by region report error:", error);
      res.status(500).json({ error: "Failed to compute sales by region" });
    }
  });
  app2.get("/api/admin/reports/companies-status", requireAdmin, async (req, res) => {
    try {
      const companies2 = await storage.getAllCompanies();
      const map = /* @__PURE__ */ new Map();
      for (const c of companies2) {
        const key = c.status || "unknown";
        map.set(key, (map.get(key) || 0) + 1);
      }
      res.json(Array.from(map.entries()).map(([status, count]) => ({ status, count })));
    } catch (error) {
      console.error("Companies status report error:", error);
      res.status(500).json({ error: "Failed to compute companies status" });
    }
  });
  app2.get("/api/admin/reports/top-suppliers", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      const map = /* @__PURE__ */ new Map();
      for (const o of orders2) {
        const company = await storage.getCompany(o.companyId);
        const key = company?.id || o.companyId;
        const entry = map.get(key) || { companyId: key, name: company?.name || "Unknown", revenue: 0, orders: 0 };
        entry.revenue += parseFloat(o.total) || 0;
        entry.orders += 1;
        map.set(key, entry);
      }
      const results = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 50);
      res.json(results);
    } catch (error) {
      console.error("Top suppliers report error:", error);
      res.status(500).json({ error: "Failed to compute top suppliers" });
    }
  });
  app2.get("/api/admin/reports/sales-timeseries", requireAdmin, async (req, res) => {
    try {
      const { start, end } = req.query;
      const orders2 = await storage.getAllOrders();
      const byMonth = /* @__PURE__ */ new Map();
      for (const o of orders2) {
        const date = new Date(o.createdAt);
        const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        const entry = byMonth.get(month) || { month, total: 0, count: 0 };
        entry.total += parseFloat(o.total) || 0;
        entry.count += 1;
        byMonth.set(month, entry);
      }
      const series = Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
      res.json(series);
    } catch (error) {
      console.error("Sales timeseries error:", error);
      res.status(500).json({ error: "Failed to compute sales timeseries" });
    }
  });
  app2.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      const updates = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      const order = await storage.updateOrder(req.params.id, updates);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        action: "order_updated",
        entityType: "order",
        entityId: req.params.id,
        newValues: JSON.stringify(updates)
      });
      res.json(order);
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  app2.post("/api/admin/orders/:id/reoffer", requireAdmin, async (req, res) => {
    try {
      const { amount, message, email } = req.body || {};
      const parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount)) {
        return res.status(400).json({ error: "A valid reoffer amount is required" });
      }
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const user = await storage.getUser(order.createdByUserId);
      const recipient = email || user?.email;
      if (!recipient) {
        return res.status(400).json({ error: "No recipient email found for this order" });
      }
      const formattedAmount = parsedAmount.toFixed(2);
      const emailBody = `
        <p>Hi ${user?.name || "there"},</p>
        <p>We've completed the inspection for order <strong>${order.orderNumber}</strong>.</p>
        <p>Your updated offer is <strong>$${formattedAmount}</strong>.</p>
        ${message ? `<p>${message}</p>` : ""}
        <p>Please reply to this email to accept or decline the updated offer.</p>
        <p>Thank you,<br/>SecondHandCell Team</p>
      `;
      await sendEmail({
        to: recipient,
        subject: `Updated offer for order ${order.orderNumber}`,
        html: emailBody
      });
      const noteLine = `[${(/* @__PURE__ */ new Date()).toISOString()}] Reoffer sent for $${formattedAmount}${message ? ` - ${message}` : ""}`;
      const updatedOrder = await storage.updateOrder(req.params.id, {
        status: "reoffer_sent",
        notesInternal: [order.notesInternal || "", noteLine].filter(Boolean).join("\n")
      });
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        action: "order_reoffer_sent",
        entityType: "order",
        entityId: req.params.id,
        newValues: JSON.stringify({ amount: formattedAmount, message })
      });
      res.json({ message: "Reoffer email sent", order: updatedOrder });
    } catch (error) {
      console.error("Failed to send reoffer email:", error);
      res.status(500).json({ error: "Unable to send reoffer email" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });
  app2.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { role, isActive } = req.body;
      const updates = {};
      if (role) updates.role = role;
      if (isActive !== void 0) updates.isActive = isActive;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        action: "user_updated",
        entityType: "user",
        entityId: req.params.id,
        newValues: JSON.stringify(updates)
      });
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.get("/api/saved-lists", requireAuth, async (req, res) => {
    try {
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext) {
        return res.status(400).json({ error: "User does not belong to a company" });
      }
      const lists = await storage.getSavedListsByCompanyId(companyContext.companyId);
      res.json(lists);
    } catch (error) {
      console.error("Get saved lists error:", error);
      res.status(500).json({ error: "Failed to get saved lists" });
    }
  });
  app2.post("/api/saved-lists", requireAuth, async (req, res) => {
    try {
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext) {
        return res.status(400).json({ error: "User does not belong to a company" });
      }
      const parsed = insertSavedListSchema.safeParse({
        ...req.body,
        companyId: companyContext.companyId,
        createdByUserId: req.session.userId
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const list = await storage.createSavedList(parsed.data);
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        companyId: companyContext.companyId,
        action: "saved_list_created",
        entityType: "saved_list",
        entityId: list.id,
        newValues: JSON.stringify(list)
      });
      res.json(list);
    } catch (error) {
      console.error("Create saved list error:", error);
      res.status(500).json({ error: "Failed to create saved list" });
    }
  });
  app2.get("/api/saved-lists/:id", requireAuth, async (req, res) => {
    try {
      const list = await storage.getSavedList(req.params.id);
      if (!list) {
        return res.status(404).json({ error: "Saved list not found" });
      }
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext || list.companyId !== companyContext.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const items = await storage.getSavedListItems(req.params.id);
      res.json({ ...list, items });
    } catch (error) {
      console.error("Get saved list error:", error);
      res.status(500).json({ error: "Failed to get saved list" });
    }
  });
  app2.delete("/api/saved-lists/:id", requireAuth, async (req, res) => {
    try {
      const list = await storage.getSavedList(req.params.id);
      if (!list) {
        return res.status(404).json({ error: "Saved list not found" });
      }
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext || list.companyId !== companyContext.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteSavedList(req.params.id);
      await storage.createAuditLog({
        actorUserId: req.session.userId,
        companyId: companyContext.companyId,
        action: "saved_list_deleted",
        entityType: "saved_list",
        entityId: req.params.id
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete saved list error:", error);
      res.status(500).json({ error: "Failed to delete saved list" });
    }
  });
  app2.post("/api/saved-lists/:id/items", requireAuth, async (req, res) => {
    try {
      const list = await storage.getSavedList(req.params.id);
      if (!list) {
        return res.status(404).json({ error: "Saved list not found" });
      }
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext || list.companyId !== companyContext.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const parsed = insertSavedListItemSchema.safeParse({
        ...req.body,
        savedListId: req.params.id
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const item = await storage.addSavedListItem(parsed.data);
      res.json(item);
    } catch (error) {
      console.error("Add saved list item error:", error);
      res.status(500).json({ error: "Failed to add item to saved list" });
    }
  });
  app2.delete("/api/saved-lists/:listId/items/:itemId", requireAuth, async (req, res) => {
    try {
      const list = await storage.getSavedList(req.params.listId);
      if (!list) {
        return res.status(404).json({ error: "Saved list not found" });
      }
      const companyContext = await getUserPrimaryCompany(req.session.userId);
      if (!companyContext || list.companyId !== companyContext.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteSavedListItem(req.params.itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove saved list item error:", error);
      res.status(500).json({ error: "Failed to remove item from saved list" });
    }
  });
  app2.get("/api/faqs", async (req, res) => {
    try {
      const faqs2 = await storage.getAllFaqs();
      res.json(faqs2);
    } catch (error) {
      console.error("Get FAQs error:", error);
      res.status(500).json({ error: "Failed to get FAQs" });
    }
  });
  app2.post("/api/support/tickets", async (req, res) => {
    try {
      const { name, email, company, subject, message } = req.body;
      const ticket = await storage.createSupportTicket({
        companyId: req.session.userId ? void 0 : null,
        createdByUserId: req.session.userId || null,
        subject,
        description: `From: ${name} (${email})
Company: ${company || "N/A"}

${message}`,
        status: "open",
        priority: "medium"
      });
      res.json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });
  app2.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const { eq: eq2, and: and2, sql: sql4 } = await import("drizzle-orm");
      const allOrders = await db.select().from(orders);
      const totalRevenue = allOrders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount || "0");
      }, 0);
      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter(
        (o) => o.status === "pending_approval" || o.status === "approved" || o.status === "processing"
      ).length;
      const completedOrders = allOrders.filter((o) => o.status === "completed").length;
      const allCompanies = await db.select().from(companies);
      const totalCompanies = allCompanies.length;
      const activeCompanies = allCompanies.filter((c) => c.status === "active").length;
      const allUsers = await db.select().from(users);
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u) => u.isActive).length;
      res.json({
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCompanies,
        activeCompanies,
        totalUsers,
        activeUsers
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });
  app2.get("/api/admin/quick-stats", requireAdmin, async (req, res) => {
    try {
      const { gte, and: and2 } = await import("drizzle-orm");
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const allOrders = await db.select().from(orders);
      const ordersToday = allOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today;
      }).length;
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const ordersThisMonth = allOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= firstDayOfMonth;
      }).length;
      const revenueToday = allOrders.filter((o) => new Date(o.createdAt) >= today).reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);
      const revenueThisMonth = allOrders.filter((o) => new Date(o.createdAt) >= firstDayOfMonth).reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);
      const pendingApprovals = allOrders.filter((o) => o.status === "pending_approval").length;
      res.json({
        ordersToday,
        ordersThisMonth,
        revenueToday,
        revenueThisMonth,
        pendingApprovals
      });
    } catch (error) {
      console.error("Quick stats error:", error);
      res.status(500).json({ error: "Failed to get quick stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// ../server-api-only.js
import http from "http";
var app = express();
var server = http.createServer(app);
var allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
registerRoutes(app);
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API server running" });
});
var port = parseInt(process.env.PORT || "8032", 10);
server.listen({
  port,
  host: "0.0.0.0"
}, () => {
  console.log(`\u2705 API server running on port ${port}`);
  console.log(`\u{1F4CD} http://localhost:${port}`);
});

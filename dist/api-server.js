var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/email.ts
var email_exports = {};
__export(email_exports, {
  emailTemplates: () => emailTemplates,
  sendDeviceReceived: () => sendDeviceReceived,
  sendEmail: () => sendEmail,
  sendInspectionComplete: () => sendInspectionComplete,
  sendOrderConfirmation: () => sendOrderConfirmation,
  sendPaymentConfirmation: () => sendPaymentConfirmation,
  sendRawEmail: () => sendRawEmail,
  sendShippingLabel: () => sendShippingLabel,
  sendStatusUpdate: () => sendStatusUpdate
});
import nodemailer from "nodemailer";
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: EMAIL_USER && EMAIL_PASS ? {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      } : void 0
    });
  }
  return transporter;
}
async function sendEmail(to, template, attachments) {
  try {
    const transporter2 = getTransporter();
    if (process.env.NODE_ENV === "development" && !EMAIL_USER) {
      console.log("\n\u{1F4E7} EMAIL (DEV MODE - NOT SENT):");
      console.log("To:", to);
      console.log("Subject:", template.subject);
      console.log("HTML Preview:", template.html.substring(0, 200) + "...");
      if (attachments?.length) {
        console.log("Attachments:", attachments.length);
      }
      return { success: true, messageId: "dev-" + Date.now() };
    }
    const info = await transporter2.sendMail({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      attachments: attachments || []
    });
    console.log("\u2705 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("\u274C Email error:", error);
    return { success: false, error };
  }
}
async function sendRawEmail(to, subject, text2, html, attachments) {
  return sendEmail(to, { subject, html: html || text2 }, attachments);
}
async function sendOrderConfirmation(email, orderNumber, deviceName, offerAmount) {
  return sendEmail(email, emailTemplates.orderConfirmation(orderNumber, deviceName, offerAmount));
}
async function sendShippingLabel(email, orderNumber, labelUrl, labelPdf) {
  const attachments = labelPdf ? [{
    filename: `shipping-label-${orderNumber}.pdf`,
    content: labelPdf,
    contentType: "application/pdf"
  }] : [];
  return sendEmail(email, emailTemplates.shippingLabelReady(orderNumber, labelUrl), attachments);
}
async function sendDeviceReceived(email, orderNumber, deviceName) {
  return sendEmail(email, emailTemplates.deviceReceived(orderNumber, deviceName));
}
async function sendInspectionComplete(email, orderNumber, finalOffer, matched = true) {
  return sendEmail(email, emailTemplates.inspectionComplete(orderNumber, finalOffer, matched));
}
async function sendPaymentConfirmation(email, orderNumber, amount, method) {
  return sendEmail(email, emailTemplates.paymentSent(orderNumber, amount, method));
}
async function sendStatusUpdate(email, orderNumber, status, message) {
  return sendEmail(email, emailTemplates.statusUpdate(orderNumber, status, message));
}
var EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, transporter, emailTemplates;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
    EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
    EMAIL_USER = process.env.EMAIL_USER || "";
    EMAIL_PASS = process.env.EMAIL_PASS || "";
    EMAIL_FROM = process.env.EMAIL_FROM || "SecondHandCell <noreply@secondhandcell.com>";
    transporter = null;
    emailTemplates = {
      orderConfirmation: (orderNumber, deviceName, offerAmount) => ({
        subject: `Order Confirmation - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmed!</h1>
        <p>Thank you for choosing SecondHandCell. Your order has been confirmed.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Device:</strong> ${deviceName}</p>
          <p><strong>Offer Amount:</strong> $${offerAmount.toFixed(2)}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ol>
          <li>Ship your device using the prepaid shipping label (attached or available in your account)</li>
          <li>We'll inspect your device within 24-48 hours of receipt</li>
          <li>Get paid via your selected method once inspection is complete</li>
        </ol>
        
        <p>Track your order status anytime at: <a href="${process.env.APP_URL || "http://localhost:5000"}/track">Track Your Order</a></p>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          Questions? Contact us at support@secondhandcell.com
        </p>
      </div>
    `
      }),
      shippingLabelReady: (orderNumber, labelUrl) => ({
        subject: `Shipping Label Ready - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Shipping Label is Ready!</h1>
        <p>Your prepaid shipping label for order ${orderNumber} is ready to use.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Shipping Instructions</h2>
          <ol>
            <li>Download and print your shipping label</li>
            <li>Securely package your device in a sturdy box</li>
            <li>Attach the label to the outside of the box</li>
            <li>Drop off at any carrier location or schedule a pickup</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${labelUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download Shipping Label
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Important:</strong> Make sure to remove all personal data and disable Find My iPhone/activation locks before shipping.
        </p>
      </div>
    `
      }),
      deviceReceived: (orderNumber, deviceName) => ({
        subject: `Device Received - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">We've Received Your Device!</h1>
        <p>Great news! Your ${deviceName} has arrived at our facility.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Status:</strong> Under Inspection</p>
        </div>
        
        <p>Our team will inspect your device within 24-48 hours and verify its condition matches your quote.</p>
        
        <p>You'll receive another email once the inspection is complete.</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          Track your order: <a href="${process.env.APP_URL || "http://localhost:5000"}/track">View Status</a>
        </p>
      </div>
    `
      }),
      inspectionComplete: (orderNumber, finalOffer, matched) => ({
        subject: `Inspection Complete - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Inspection Complete!</h1>
        
        ${matched ? `
          <p>Good news! Your device matches the condition you described.</p>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h2 style="margin-top: 0; color: #16a34a;">Payment Processing</h2>
            <p><strong>Final Offer:</strong> $${finalOffer.toFixed(2)}</p>
            <p>Your payment will be sent within 1-2 business days.</p>
          </div>
        ` : `
          <p>After inspecting your device, we found some differences from your original description.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h2 style="margin-top: 0; color: #f59e0b;">Revised Offer</h2>
            <p><strong>Updated Offer:</strong> $${finalOffer.toFixed(2)}</p>
            <p>Please review and accept or decline this revised offer in your account.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "http://localhost:5000"}/account/orders" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Offer
            </a>
          </div>
        `}
      </div>
    `
      }),
      paymentSent: (orderNumber, amount, method) => ({
        subject: `Payment Sent - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Payment Sent! \u{1F4B0}</h1>
        <p>Your payment has been successfully processed.</p>
        
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h2 style="margin-top: 0;">Payment Details</h2>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Method:</strong> ${method}</p>
          <p><strong>Order:</strong> ${orderNumber}</p>
        </div>
        
        <p>Depending on your payment method, funds should arrive within:</p>
        <ul>
          <li><strong>Zelle:</strong> Instantly</li>
          <li><strong>PayPal/Venmo:</strong> 1-3 business days</li>
          <li><strong>Check:</strong> 5-7 business days</li>
        </ul>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          Thank you for selling with SecondHandCell! We hope to serve you again soon.
        </p>
      </div>
    `
      }),
      statusUpdate: (orderNumber, status, message) => ({
        subject: `Order Update - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>
        
        <p>${message}</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || "http://localhost:5000"}/account/orders/${orderNumber}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Order Details
          </a>
        </div>
      </div>
    `
      })
    };
  }
});

// server/xml-parser.ts
var xml_parser_exports = {};
__export(xml_parser_exports, {
  parseDeviceXML: () => parseDeviceXML
});
import { parseStringPromise } from "xml2js";
async function parseDeviceXML(xmlContent) {
  try {
    const result = await parseStringPromise(xmlContent);
    const models = [];
    if (result.models && result.models.model) {
      const modelArray = Array.isArray(result.models.model) ? result.models.model : [result.models.model];
      for (const model of modelArray) {
        const parsedDevice = {
          brand: model.brand?.[0] || model.parentDevice?.[0] || "Unknown",
          modelID: model.modelID?.[0] || "",
          name: model.name?.[0] || "",
          slug: model.slug?.[0] || "",
          imageUrl: model.imageUrl?.[0],
          year: model.year?.[0] ? parseInt(model.year[0]) : void 0,
          variants: []
        };
        const pricesArray = Array.isArray(model.prices) ? model.prices : [model.prices];
        for (const priceGroup of pricesArray.filter(Boolean)) {
          const storage2 = priceGroup.storageSize?.[0] || "";
          const priceValue = priceGroup.priceValue?.[0];
          if (!priceValue) continue;
          if (priceValue.locked?.[0]) {
            const lockedPrices = priceValue.locked[0];
            const variant = {
              storage: storage2,
              carrier: "locked",
              pricing: [
                {
                  condition: "flawless",
                  price: parseFloat(lockedPrices.flawless?.[0] || "0")
                },
                {
                  condition: "good",
                  price: parseFloat(lockedPrices.good?.[0] || "0")
                },
                {
                  condition: "fair",
                  price: parseFloat(lockedPrices.fair?.[0] || "0")
                },
                {
                  condition: "broken",
                  price: parseFloat(lockedPrices.broken?.[0] || "0")
                }
              ]
            };
            parsedDevice.variants.push(variant);
          }
          if (priceValue.unlocked?.[0]) {
            const unlockedPrices = priceValue.unlocked[0];
            const variant = {
              storage: storage2,
              carrier: "unlocked",
              pricing: [
                {
                  condition: "flawless",
                  price: parseFloat(unlockedPrices.flawless?.[0] || "0")
                },
                {
                  condition: "good",
                  price: parseFloat(unlockedPrices.good?.[0] || "0")
                },
                {
                  condition: "fair",
                  price: parseFloat(unlockedPrices.fair?.[0] || "0")
                },
                {
                  condition: "broken",
                  price: parseFloat(unlockedPrices.broken?.[0] || "0")
                }
              ]
            };
            parsedDevice.variants.push(variant);
          }
        }
        if (parsedDevice.variants.length > 0) {
          models.push(parsedDevice);
        }
      }
    }
    return models;
  } catch (error) {
    console.error("Error parsing XML:", error);
    throw new Error("Failed to parse XML file");
  }
}
var init_xml_parser = __esm({
  "server/xml-parser.ts"() {
    "use strict";
  }
});

// server-api-only.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addresses: () => addresses,
  announcements: () => announcements,
  auditLogs: () => auditLogs,
  buybackConditionProfiles: () => buybackConditionProfiles,
  buybackPricingRules: () => buybackPricingRules,
  customerProfiles: () => customerProfiles,
  deviceBrands: () => deviceBrands,
  deviceFamilies: () => deviceFamilies,
  deviceModels: () => deviceModels,
  deviceVariants: () => deviceVariants,
  faqs: () => faqs,
  insertAddressSchema: () => insertAddressSchema,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBuybackConditionProfileSchema: () => insertBuybackConditionProfileSchema,
  insertBuybackPricingRuleSchema: () => insertBuybackPricingRuleSchema,
  insertCustomerProfileSchema: () => insertCustomerProfileSchema,
  insertDeviceBrandSchema: () => insertDeviceBrandSchema,
  insertDeviceFamilySchema: () => insertDeviceFamilySchema,
  insertDeviceModelSchema: () => insertDeviceModelSchema,
  insertDeviceVariantSchema: () => insertDeviceVariantSchema,
  insertFaqSchema: () => insertFaqSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertQuoteLineItemSchema: () => insertQuoteLineItemSchema,
  insertQuoteRequestSchema: () => insertQuoteRequestSchema,
  insertSellOrderItemSchema: () => insertSellOrderItemSchema,
  insertSellOrderSchema: () => insertSellOrderSchema,
  insertShipmentSchema: () => insertShipmentSchema,
  insertSiteSettingSchema: () => insertSiteSettingSchema,
  insertSupportTicketMessageSchema: () => insertSupportTicketMessageSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertUserSchema: () => insertUserSchema,
  payments: () => payments,
  quoteLineItems: () => quoteLineItems,
  quoteRequests: () => quoteRequests,
  sellOrderItems: () => sellOrderItems,
  sellOrders: () => sellOrders,
  shipments: () => shipments,
  siteSettings: () => siteSettings,
  supportTicketMessages: () => supportTicketMessages,
  supportTickets: () => supportTickets,
  users: () => users
});
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"),
  // customer, admin, super_admin
  phoneNumber: text("phone_number"),
  isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: integer("last_login_at"),
  // Unix timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var customerProfiles = sqliteTable("customer_profiles", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => users.id),
  defaultPayoutMethod: text("default_payout_method").default("paypal"),
  // paypal, bank_transfer, check, gift_card, other
  payoutDetailsJson: text("payout_details_json"),
  // JSON string
  defaultAddressId: text("default_address_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var addresses = sqliteTable("addresses", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull().default("shipping"),
  // shipping, payout, other
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
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceBrands = sqliteTable("device_brands", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceFamilies = sqliteTable("device_families", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  brandId: text("brand_id").notNull().references(() => deviceBrands.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceModels = sqliteTable("device_models", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  brandId: text("brand_id").notNull().references(() => deviceBrands.id),
  familyId: text("family_id").references(() => deviceFamilies.id),
  name: text("name").notNull(),
  marketingName: text("marketing_name"),
  sku: text("sku"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  year: integer("year"),
  networkTechnology: text("network_technology").default("unknown"),
  // 5G, 4G, other, unknown
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var deviceVariants = sqliteTable("device_variants", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  modelId: text("model_id").notNull().references(() => deviceModels.id),
  storageGb: integer("storage_gb").notNull(),
  color: text("color"),
  networkCarrier: text("network_carrier").default("unlocked"),
  // unlocked, att, verizon, tmobile, other, unknown
  hasEsim: integer("has_esim", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var buybackConditionProfiles = sqliteTable("buyback_condition_profiles", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  code: text("code").notNull().unique(),
  // A, B, C, D, broken
  label: text("label").notNull(),
  description: text("description").notNull(),
  isBroken: integer("is_broken", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var buybackPricingRules = sqliteTable("buyback_pricing_rules", {
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
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var quoteRequests = sqliteTable("quote_requests", {
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
  status: text("status").notNull().default("draft"),
  // draft, quoted, expired, converted_to_order, cancelled
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  source: text("source").notNull().default("guest"),
  // guest, account
  notesInternal: text("notes_internal"),
  notesCustomer: text("notes_customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var quoteLineItems = sqliteTable("quote_line_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  quoteRequestId: text("quote_request_id").notNull().references(() => quoteRequests.id),
  deviceModelId: text("device_model_id").notNull().references(() => deviceModels.id),
  deviceVariantId: text("device_variant_id").references(() => deviceVariants.id),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  claimedConditionProfileId: text("claimed_condition_profile_id").notNull().references(() => buybackConditionProfiles.id),
  claimedIssuesJson: text("claimed_issues_json"),
  // JSON string
  initialOfferAmount: real("initial_offer_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  calculatedAt: integer("calculated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var sellOrders = sqliteTable("sell_orders", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  quoteRequestId: text("quote_request_id").references(() => quoteRequests.id),
  status: text("status").notNull().default("label_pending"),
  // label_pending, awaiting_device, in_transit, received, under_inspection, reoffer_pending, customer_decision_pending, payout_pending, completed, cancelled, returned_to_customer
  lockedInAt: integer("locked_in_at", { mode: "timestamp" }),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  shipmentId: text("shipment_id"),
  // Customer contact information
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  // Shipping address
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country").default("US"),
  payoutStatus: text("payout_status").notNull().default("not_started"),
  // not_started, pending, paid, failed
  payoutMethod: text("payout_method"),
  payoutDetailsJson: text("payout_details_json"),
  // JSON string
  totalOriginalOffer: real("total_original_offer"),
  totalFinalOffer: real("total_final_offer"),
  currency: text("currency").notNull().default("USD"),
  notesInternal: text("notes_internal"),
  notesCustomer: text("notes_customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var sellOrderItems = sqliteTable("sell_order_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  quoteLineItemId: text("quote_line_item_id").references(() => quoteLineItems.id),
  deviceModelId: text("device_model_id").notNull().references(() => deviceModels.id),
  deviceVariantId: text("device_variant_id").references(() => deviceVariants.id),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  claimedConditionProfileId: text("claimed_condition_profile_id").notNull().references(() => buybackConditionProfiles.id),
  claimedIssuesJson: text("claimed_issues_json"),
  // JSON string
  originalOfferAmount: real("original_offer_amount").notNull(),
  pricingRuleId: text("pricing_rule_id"),
  basePrice: real("base_price"),
  totalPenalty: real("total_penalty"),
  penaltyBreakdownJson: text("penalty_breakdown_json"),
  // JSON string
  inspectedConditionProfileId: text("inspected_condition_profile_id").references(() => buybackConditionProfiles.id),
  inspectedIssuesJson: text("inspected_issues_json"),
  // JSON string
  inspectionNotes: text("inspection_notes"),
  finalOfferAmount: real("final_offer_amount"),
  adjustmentReason: text("adjustment_reason").default("none"),
  // condition_mismatch, blacklisted, financed, functional_issue, other, none
  customerDecision: text("customer_decision").notNull().default("pending"),
  // pending, accepted, rejected, returned
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var shipments = sqliteTable("shipments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  carrierName: text("carrier_name"),
  serviceLevel: text("service_level"),
  trackingNumber: text("tracking_number"),
  labelUrl: text("label_url"),
  labelCost: real("label_cost"),
  labelPaidBy: text("label_paid_by").default("company"),
  // company, customer
  shipFromAddressJson: text("ship_from_address_json"),
  // JSON string
  shipToAddressJson: text("ship_to_address_json"),
  // JSON string
  droppedOffAt: integer("dropped_off_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  lastTrackingStatus: text("last_tracking_status"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var payments = sqliteTable("payments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  sellOrderId: text("sell_order_id").notNull().references(() => sellOrders.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  direction: text("direction").notNull(),
  // incoming_from_customer, outgoing_to_customer
  payoutReference: text("payout_reference"),
  method: text("method").notNull(),
  // card, wire, ach, paypal, check, other
  status: text("status").notNull().default("pending"),
  // pending, succeeded, failed, refunded
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").references(() => users.id),
  sellOrderId: text("sell_order_id").references(() => sellOrders.id),
  quoteRequestId: text("quote_request_id").references(() => quoteRequests.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  // open, in_progress, closed
  priority: text("priority").notNull().default("medium"),
  // low, medium, high
  lastCustomerActivityAt: integer("last_customer_activity_at", { mode: "timestamp" }),
  lastAgentActivityAt: integer("last_agent_activity_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var supportTicketMessages = sqliteTable("support_ticket_messages", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  ticketId: text("ticket_id").notNull().references(() => supportTickets.id),
  authorType: text("author_type").notNull(),
  // customer, admin
  authorUserId: text("author_user_id").references(() => users.id),
  message: text("message").notNull(),
  isInternal: integer("is_internal", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var announcements = sqliteTable("announcements", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var faqs = sqliteTable("faqs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  // general, pricing, shipping, payments, data_wipe
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  previousValues: text("previous_values"),
  // JSON string
  newValues: text("new_values"),
  // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  key: text("key").notNull().unique(),
  valueJson: text("value_json"),
  // JSON string
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLoginAt: true });
var insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
var insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true, updatedAt: true });
var insertDeviceBrandSchema = createInsertSchema(deviceBrands).omit({ id: true, createdAt: true, updatedAt: true });
var insertDeviceFamilySchema = createInsertSchema(deviceFamilies).omit({ id: true, createdAt: true, updatedAt: true });
var insertDeviceModelSchema = createInsertSchema(deviceModels).omit({ id: true, createdAt: true, updatedAt: true });
var insertDeviceVariantSchema = createInsertSchema(deviceVariants).omit({ id: true, createdAt: true, updatedAt: true });
var insertBuybackConditionProfileSchema = createInsertSchema(buybackConditionProfiles).omit({ id: true, createdAt: true, updatedAt: true });
var insertBuybackPricingRuleSchema = createInsertSchema(buybackPricingRules).omit({ id: true, createdAt: true, updatedAt: true });
var insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true, updatedAt: true });
var insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({ id: true, createdAt: true, updatedAt: true });
var insertSellOrderSchema = createInsertSchema(sellOrders).omit({ id: true, createdAt: true, updatedAt: true });
var insertSellOrderItemSchema = createInsertSchema(sellOrderItems).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  deviceVariantId: z.string().nullable().optional()
});
var insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true, updatedAt: true });
var insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
var insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
var insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({ id: true, createdAt: true });
var insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
var insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true, updatedAt: true });
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
var insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });

// server/db.ts
var dbPath = "sqlite.db";
var sqlite = new Database(dbPath);
var db = drizzle({ client: sqlite, schema: schema_exports });

// server/storage.ts
import { eq, and, or, isNull, lte, gte } from "drizzle-orm";
var DatabaseStorage = class {
  // Shipments
  async getShipment(id) {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || void 0;
  }
  async getShipmentByOrder(orderId) {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.sellOrderId, orderId));
    return shipment || void 0;
  }
  async createShipment(shipment) {
    const [newShipment] = await db.insert(shipments).values(shipment).returning();
    return newShipment;
  }
  async updateShipment(id, updates) {
    const [shipment] = await db.update(shipments).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(shipments.id, id)).returning();
    return shipment || void 0;
  }
  async deleteModel(id) {
    const result = await db.delete(deviceModels).where(eq(deviceModels.id, id));
    return result.changes > 0;
  }
  // Users
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
    const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  // Device Brands
  async getAllBrands() {
    return await db.select().from(deviceBrands).where(eq(deviceBrands.isActive, true));
  }
  async getBrand(id) {
    const [brand] = await db.select().from(deviceBrands).where(eq(deviceBrands.id, id));
    return brand || void 0;
  }
  async getBrandBySlug(slug) {
    const [brand] = await db.select().from(deviceBrands).where(eq(deviceBrands.slug, slug));
    return brand || void 0;
  }
  async createBrand(brand) {
    const [newBrand] = await db.insert(deviceBrands).values(brand).returning();
    return newBrand;
  }
  async updateBrand(id, updates) {
    const [brand] = await db.update(deviceBrands).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deviceBrands.id, id)).returning();
    return brand || void 0;
  }
  // Device Models
  async getAllModels() {
    return await db.select().from(deviceModels).where(eq(deviceModels.isActive, true));
  }
  async getModel(id) {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.id, id));
    return model || void 0;
  }
  async getModelBySlug(slug) {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.slug, slug));
    return model || void 0;
  }
  async getModelsByBrand(brandId) {
    return await db.select().from(deviceModels).where(and(eq(deviceModels.brandId, brandId), eq(deviceModels.isActive, true)));
  }
  async createModel(model) {
    const [newModel] = await db.insert(deviceModels).values(model).returning();
    return newModel;
  }
  async updateModel(id, updates) {
    const [model] = await db.update(deviceModels).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deviceModels.id, id)).returning();
    return model || void 0;
  }
  // Device Variants
  async getVariant(id) {
    const [variant] = await db.select().from(deviceVariants).where(eq(deviceVariants.id, id));
    return variant || void 0;
  }
  async getVariantsByModel(modelId) {
    return await db.select().from(deviceVariants).where(and(eq(deviceVariants.modelId, modelId), eq(deviceVariants.isActive, true)));
  }
  async createVariant(variant) {
    const [newVariant] = await db.insert(deviceVariants).values(variant).returning();
    return newVariant;
  }
  async updateVariant(id, updates) {
    const [variant] = await db.update(deviceVariants).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deviceVariants.id, id)).returning();
    return variant || void 0;
  }
  // Buyback Condition Profiles
  async getAllConditionProfiles() {
    return await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.isActive, true));
  }
  async getConditionProfile(id) {
    const [profile] = await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.id, id));
    return profile || void 0;
  }
  async getConditionProfileByCode(code) {
    const [profile] = await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.code, code));
    return profile || void 0;
  }
  async createConditionProfile(profile) {
    const [newProfile] = await db.insert(buybackConditionProfiles).values(profile).returning();
    return newProfile;
  }
  // Buyback Pricing Rules
  async getPricingRule(id) {
    const [rule] = await db.select().from(buybackPricingRules).where(eq(buybackPricingRules.id, id));
    return rule || void 0;
  }
  async getPricingRulesByVariant(variantId) {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(buybackPricingRules).where(
      and(
        eq(buybackPricingRules.deviceVariantId, variantId),
        eq(buybackPricingRules.isActive, true),
        lte(buybackPricingRules.effectiveFrom, now),
        and(
          isNull(buybackPricingRules.effectiveTo),
          gte(buybackPricingRules.effectiveTo, now)
        )
      )
    );
  }
  async getPricingRuleByVariantAndCondition(variantId, conditionId) {
    const now = /* @__PURE__ */ new Date();
    const [rule] = await db.select().from(buybackPricingRules).where(
      and(
        eq(buybackPricingRules.deviceVariantId, variantId),
        eq(buybackPricingRules.conditionProfileId, conditionId),
        eq(buybackPricingRules.isActive, true),
        lte(buybackPricingRules.effectiveFrom, now),
        or(
          isNull(buybackPricingRules.effectiveTo),
          gte(buybackPricingRules.effectiveTo, now)
        )
      )
    );
    return rule || void 0;
  }
  async createPricingRule(rule) {
    const [newRule] = await db.insert(buybackPricingRules).values(rule).returning();
    return newRule;
  }
  async updatePricingRule(id, updates) {
    const [rule] = await db.update(buybackPricingRules).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(buybackPricingRules.id, id)).returning();
    return rule || void 0;
  }
  // Quote Requests
  async getQuoteRequest(id) {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quote || void 0;
  }
  async getQuoteRequestByNumber(quoteNumber) {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.quoteNumber, quoteNumber));
    return quote || void 0;
  }
  async getQuoteRequestsByUser(userId) {
    return await db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));
  }
  async getQuoteRequestsByEmail(email) {
    return await db.select().from(quoteRequests).where(eq(quoteRequests.email, email));
  }
  async createQuoteRequest(quote) {
    const [newQuote] = await db.insert(quoteRequests).values(quote).returning();
    return newQuote;
  }
  async updateQuoteRequest(id, updates) {
    const [quote] = await db.update(quoteRequests).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quoteRequests.id, id)).returning();
    return quote || void 0;
  }
  // Quote Line Items
  async getQuoteLineItem(id) {
    const [item] = await db.select().from(quoteLineItems).where(eq(quoteLineItems.id, id));
    return item || void 0;
  }
  async getQuoteLineItemsByQuote(quoteRequestId) {
    return await db.select().from(quoteLineItems).where(eq(quoteLineItems.quoteRequestId, quoteRequestId));
  }
  async createQuoteLineItem(item) {
    const [newItem] = await db.insert(quoteLineItems).values(item).returning();
    return newItem;
  }
  // Sell Orders
  async getSellOrder(id) {
    const [order] = await db.select().from(sellOrders).where(eq(sellOrders.id, id));
    return order || void 0;
  }
  async getSellOrderByNumber(orderNumber) {
    const [order] = await db.select().from(sellOrders).where(eq(sellOrders.orderNumber, orderNumber));
    return order || void 0;
  }
  async getSellOrdersByUser(userId) {
    return await db.select().from(sellOrders).where(eq(sellOrders.userId, userId));
  }
  async getAllSellOrders() {
    return await db.select().from(sellOrders);
  }
  async createSellOrder(order) {
    const [newOrder] = await db.insert(sellOrders).values(order).returning();
    return newOrder;
  }
  async updateSellOrder(id, updates) {
    const [order] = await db.update(sellOrders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sellOrders.id, id)).returning();
    return order || void 0;
  }
  // Sell Order Items
  async getSellOrderItem(id) {
    const [item] = await db.select().from(sellOrderItems).where(eq(sellOrderItems.id, id));
    return item || void 0;
  }
  async getSellOrderItemsByOrder(sellOrderId) {
    return await db.select().from(sellOrderItems).where(eq(sellOrderItems.sellOrderId, sellOrderId));
  }
  async createSellOrderItem(item) {
    const [newItem] = await db.insert(sellOrderItems).values(item).returning();
    return newItem;
  }
  async updateSellOrderItem(id, updates) {
    const [item] = await db.update(sellOrderItems).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sellOrderItems.id, id)).returning();
    return item || void 0;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { fromError } from "zod-validation-error";

// server/auth.ts
import bcrypt from "bcryptjs";
var SALT_ROUNDS = 10;
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
async function requireAdmin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin" && user.role !== "super_admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// server/routes.ts
import { z as z2 } from "zod";

// server/pricing.ts
async function calculateDeviceOffer(input) {
  const pricingRule = await storage.getPricingRuleByVariantAndCondition(
    input.deviceVariantId,
    input.conditionProfileId
  );
  if (!pricingRule) {
    return null;
  }
  const basePrice = parseFloat(pricingRule.basePrice);
  const penalties = {};
  let totalPenalty = 0;
  if (input.claimedIssues?.isFinanced && pricingRule.financedDevicePenaltyAmount) {
    const penalty = parseFloat(pricingRule.financedDevicePenaltyAmount);
    penalties.financed = penalty;
    totalPenalty += penalty;
  }
  if (input.claimedIssues?.noPower && pricingRule.noPowerPenaltyAmount) {
    const penalty = parseFloat(pricingRule.noPowerPenaltyAmount);
    penalties.noPower = penalty;
    totalPenalty += penalty;
  }
  if (input.claimedIssues?.functionalIssue && pricingRule.functionalIssuePenaltyAmount) {
    const penalty = parseFloat(pricingRule.functionalIssuePenaltyAmount);
    penalties.functionalIssue = penalty;
    totalPenalty += penalty;
  }
  if (input.claimedIssues?.crackedGlass && pricingRule.crackedGlassPenaltyAmount) {
    const penalty = parseFloat(pricingRule.crackedGlassPenaltyAmount);
    penalties.crackedGlass = penalty;
    totalPenalty += penalty;
  }
  if (input.claimedIssues?.activationLock && pricingRule.activationLockPenaltyAmount) {
    const penalty = parseFloat(pricingRule.activationLockPenaltyAmount);
    penalties.activationLock = penalty;
    totalPenalty += penalty;
  }
  let finalOffer = basePrice - totalPenalty;
  const minOffer = pricingRule.minOfferAmount ? parseFloat(pricingRule.minOfferAmount) : 0;
  const maxOffer = pricingRule.maxOfferAmount ? parseFloat(pricingRule.maxOfferAmount) : Infinity;
  finalOffer = Math.max(minOffer, Math.min(maxOffer, finalOffer));
  return {
    basePrice,
    penalties,
    totalPenalty,
    finalOffer,
    currency: pricingRule.currency,
    pricingRuleId: pricingRule.id
  };
}

// server/siteSettings.ts
import { eq as eq2 } from "drizzle-orm";
async function getSiteSettings() {
  const [settings] = await db.select().from(siteSettings);
  return settings || { logoUrl: "" };
}
async function updateSiteLogo(logoUrl) {
  const [existing] = await db.select().from(siteSettings);
  if (existing) {
    await db.update(siteSettings).set({ logoUrl }).where(eq2(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values({ logoUrl });
  }
}

// server/routes.ts
init_email();

// server/phonecheck.ts
import axios from "axios";
var getBaseUrl = () => process.env.IMEI_BASE_URL || "https://clientapiv2.phonecheck.com";
var getUsername = () => process.env.IMEI_USERNAME || "";
var getApiKey = () => process.env.IMEI_API || "";
async function checkIMEI(imei) {
  try {
    const cleanIMEI = imei.replace(/[\s-]/g, "");
    const PHONECHECK_USERNAME = getUsername();
    const PHONECHECK_API_KEY = getApiKey();
    const PHONECHECK_BASE_URL = getBaseUrl();
    if (!PHONECHECK_USERNAME || !PHONECHECK_API_KEY) {
      console.warn("\u26A0\uFE0F PhoneCheck credentials not configured. Returning mock data.");
      return {
        imei: cleanIMEI,
        make: "Apple",
        model: "iPhone",
        carrier: "Unknown",
        isBlacklisted: false,
        icloudStatus: "UNKNOWN",
        rawData: { mock: true }
      };
    }
    const response = await axios.post(
      `${PHONECHECK_BASE_URL}/api/v2/device/check`,
      {
        imei: cleanIMEI,
        username: PHONECHECK_USERNAME
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PHONECHECK_API_KEY}`
        },
        timeout: 15e3
        // 15 second timeout
      }
    );
    const data = response.data;
    return {
      imei: cleanIMEI,
      make: data.device?.make || data.make,
      model: data.device?.model || data.model,
      carrier: data.carrier?.name || data.carrier,
      isBlacklisted: data.blacklist?.status === "BLACKLISTED" || data.isBlacklisted === true,
      icloudStatus: parseICloudStatus(data.icloud || data.activationLock),
      batteryHealth: data.battery?.health || data.batteryHealth,
      storageCapacity: data.storage?.capacity || data.storageCapacity,
      rawData: data
    };
  } catch (error) {
    console.error("PhoneCheck API Error:", error.response?.data || error.message);
    return {
      imei,
      isBlacklisted: false,
      errors: [error.response?.data?.message || error.message || "Failed to check IMEI"]
    };
  }
}
function parseICloudStatus(icloudData) {
  if (!icloudData) return "UNKNOWN";
  if (typeof icloudData === "string") {
    const status = icloudData.toUpperCase();
    if (status.includes("ON") || status.includes("ENABLED") || status.includes("LOCKED")) return "ON";
    if (status.includes("OFF") || status.includes("DISABLED") || status.includes("CLEAN")) return "OFF";
  }
  if (typeof icloudData === "object") {
    const status = icloudData.status || icloudData.locked || icloudData.enabled;
    if (status === true || status === "ON" || status === "ENABLED" || status === "LOCKED") return "ON";
    if (status === false || status === "OFF" || status === "DISABLED" || status === "CLEAN") return "OFF";
  }
  return "UNKNOWN";
}
function isValidIMEI(imei) {
  const cleanIMEI = imei.replace(/[\s-]/g, "");
  if (!/^\d{15}$/.test(cleanIMEI)) {
    return false;
  }
  let sum = 0;
  let shouldDouble = false;
  for (let i = cleanIMEI.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanIMEI[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
async function getDeviceInfoFromIMEI(imei) {
  try {
    const result = await checkIMEI(imei);
    return {
      make: result.make,
      model: result.model,
      storage: result.storageCapacity
    };
  } catch (error) {
    console.error("Error getting device info from IMEI:", error);
    return {};
  }
}

// server/shipengine.ts
import axios2 from "axios";
var getApiKey2 = () => process.env.SHIPENGINE_KEY || process.env.SHIPENGINE_KEY_TEST || "";
var SHIPENGINE_BASE_URL = "https://api.shipengine.com/v1";
var FROM_ADDRESS = {
  name: process.env.SHIPENGINE_FROM_NAME || "SHC",
  company: process.env.SHIPENGINE_FROM_COMPANY || "SecondHandCell",
  address_line1: process.env.SHIPENGINE_FROM_ADDRESS1 || "1206 McDonald Ave",
  address_line2: process.env.SHIPENGINE_FROM_ADDRESS2 || "Ste Rear",
  city_locality: process.env.SHIPENGINE_FROM_CITY || "Brooklyn",
  state_province: process.env.SHIPENGINE_FROM_STATE || "NY",
  postal_code: process.env.SHIPENGINE_FROM_POSTAL || "11230",
  country_code: "US",
  phone: process.env.SHIPENGINE_FROM_PHONE || "2015551234"
};
async function createShippingLabel(toAddress, orderNumber, options) {
  try {
    const SHIPENGINE_API_KEY = getApiKey2();
    if (!SHIPENGINE_API_KEY) {
      throw new Error("ShipEngine API key not configured");
    }
    const carrier = options?.carrier || "usps";
    const serviceCode = options?.serviceCode || "usps_ground_advantage";
    const weight = options?.weight || 16;
    const labelRequest = {
      shipment: {
        service_code: serviceCode,
        ship_to: {
          ...toAddress,
          country_code: toAddress.country_code || "US"
        },
        ship_from: FROM_ADDRESS,
        packages: [
          {
            weight: {
              value: weight,
              unit: "ounce"
            },
            dimensions: {
              unit: "inch",
              length: 8,
              width: 6,
              height: 4
            },
            package_code: "package",
            // Standard package
            label_messages: {
              reference1: orderNumber
            }
          }
        ]
      },
      label_format: "pdf",
      label_layout: "4x6",
      test_label: SHIPENGINE_API_KEY.includes("TEST")
      // Use test mode if test key
    };
    const response = await axios2.post(
      `${SHIPENGINE_BASE_URL}/labels`,
      labelRequest,
      {
        headers: {
          "API-Key": SHIPENGINE_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 3e4
        // 30 second timeout
      }
    );
    const data = response.data;
    console.log("[ShipEngine] Response data:", JSON.stringify({
      label_id: data.label_id,
      tracking_number: data.tracking_number,
      label_download: data.label_download,
      label_download_url: data.label_download_url
    }, null, 2));
    return {
      labelId: data.label_id,
      trackingNumber: data.tracking_number,
      labelUrl: data.label_download?.href || data.label_download_url || data.label_url,
      labelPdfUrl: data.label_download?.href || data.label_url,
      labelDownload: data.label_download,
      cost: data.shipment_cost?.amount || 0,
      carrier: data.carrier_id || carrier,
      serviceCode: data.service_code || serviceCode,
      packageCode: data.package_code || "package",
      shipDate: data.ship_date || (/* @__PURE__ */ new Date()).toISOString(),
      rawResponse: data
    };
  } catch (error) {
    console.error("ShipEngine API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errors?.[0]?.message || error.response?.data?.message || "Failed to create shipping label"
    );
  }
}
async function trackShipment(carrierCode, trackingNumber) {
  try {
    const SHIPENGINE_API_KEY = getApiKey2();
    if (!SHIPENGINE_API_KEY) {
      throw new Error("ShipEngine API key not configured");
    }
    const response = await axios2.get(
      `${SHIPENGINE_BASE_URL}/tracking`,
      {
        params: {
          carrier_code: carrierCode,
          tracking_number: trackingNumber
        },
        headers: {
          "API-Key": SHIPENGINE_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Tracking Error:", error.response?.data || error.message);
    throw new Error("Failed to track shipment");
  }
}
async function voidLabel(labelId) {
  try {
    const SHIPENGINE_API_KEY = getApiKey2();
    if (!SHIPENGINE_API_KEY) {
      throw new Error("ShipEngine API key not configured");
    }
    const response = await axios2.put(
      `${SHIPENGINE_BASE_URL}/labels/${labelId}/void`,
      {},
      {
        headers: {
          "API-Key": SHIPENGINE_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Void Label Error:", error.response?.data || error.message);
    throw new Error("Failed to void label");
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/admin/quick-stats", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        try {
          const created = typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt).toISOString();
          return created.startsWith(today);
        } catch {
          return false;
        }
      }).length;
      const pending = orders.filter((o) => ["label_pending", "awaiting_device", "in_transit"].includes(o.status)).length;
      const needsPrinting = orders.filter((o) => o.status === "label_pending").length;
      res.json({ todayOrders, pending, needsPrinting });
    } catch (error) {
      console.error("Quick stats error:", error);
      res.status(500).json({ error: "Failed to fetch quick stats" });
    }
  });
  app2.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      const now = /* @__PURE__ */ new Date();
      const thisMonth = orders.filter((o) => {
        const createdDate = new Date(o.createdAt);
        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      });
      const today = now.toISOString().split("T")[0];
      const totalOrders = orders.length;
      const monthOrders = thisMonth.length;
      const pendingOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
      const needsPrinting = orders.filter((o) => o.status === "label_pending").length;
      const receivedToday = orders.filter((o) => {
        if (!o.updatedAt || o.status !== "received") return false;
        try {
          const updated = typeof o.updatedAt === "string" ? o.updatedAt : new Date(o.updatedAt).toISOString();
          return updated.startsWith(today);
        } catch {
          return false;
        }
      }).length;
      const avgOrderValue = orders.length > 0 ? (orders.reduce((sum, o) => sum + (typeof o.totalOriginalOffer === "number" ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || "0")), 0) / orders.length).toFixed(2) : "0.00";
      res.json({
        totalOrders,
        monthOrders,
        pendingOrders,
        needsPrinting,
        receivedToday,
        avgOrderValue
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { search, status, dateRange, page = "1", pageSize = "20" } = req.query;
      let orders = await storage.getAllSellOrders();
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        orders = orders.filter(
          (o) => o.orderNumber.toLowerCase().includes(searchLower) || o.notesCustomer && o.notesCustomer.toLowerCase().includes(searchLower)
        );
      }
      if (status && status !== "all") {
        orders = orders.filter((o) => o.status === status);
      }
      if (dateRange && dateRange !== "all") {
        const now = /* @__PURE__ */ new Date();
        const ranges = {
          today: 0,
          week: 7,
          month: 30
        };
        const daysAgo = ranges[dateRange];
        if (daysAgo !== void 0) {
          const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1e3);
          orders = orders.filter((o) => new Date(o.createdAt) >= cutoffDate);
        }
      }
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const total = orders.length;
      const paginatedOrders = orders.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
      const enrichedOrders = await Promise.all(paginatedOrders.map(async (order) => {
        const items = await storage.getSellOrderItemsByOrder(order.id);
        const itemsWithDetails = await Promise.all(items.map(async (item) => {
          const model = item.deviceModelId ? await storage.getModel(item.deviceModelId) : null;
          const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
          return { ...item, deviceModel: model, deviceVariant: variant };
        }));
        let customerName = "Guest";
        let customerEmail = "";
        if (order.notesCustomer) {
          const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
          const nameMatch = order.notesCustomer.match(/Name:\s*([^,\n]+)/);
          if (emailMatch) customerEmail = emailMatch[1];
          if (nameMatch) customerName = nameMatch[1].trim();
        }
        return {
          ...order,
          items: itemsWithDetails,
          customerName,
          customerEmail,
          labelStatus: order.shipmentId ? "generated" : "none"
        };
      }));
      res.json({ orders: enrichedOrders, total, page: pageNum, pageSize: pageSizeNum });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getSellOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getSellOrderItemsByOrder(order.id);
      const itemsWithDetails = await Promise.all(items.map(async (item) => {
        const model = item.deviceModelId ? await storage.getModel(item.deviceModelId) : null;
        const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
        const condition = item.claimedConditionProfileId ? await storage.getConditionProfile(item.claimedConditionProfileId) : null;
        return {
          ...item,
          deviceModel: model,
          deviceVariant: variant,
          conditionProfile: condition
        };
      }));
      let customerName = "Guest";
      let customerEmail = "";
      let customerPhone = "";
      let customerAddress = "";
      if (order.notesCustomer) {
        const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
        const nameMatch = order.notesCustomer.match(/Name:\s*([^,\n]+)/);
        const phoneMatch = order.notesCustomer.match(/Phone:\s*([^,\n]+)/);
        const addressMatch = order.notesCustomer.match(/Address:\s*([^,\n]+(?:\n[^:]+)*)/);
        if (emailMatch) customerEmail = emailMatch[1];
        if (nameMatch) customerName = nameMatch[1].trim();
        if (phoneMatch) customerPhone = phoneMatch[1].trim();
        if (addressMatch) customerAddress = addressMatch[1].trim();
      }
      let shipment = null;
      if (order.shipmentId) {
        shipment = await storage.getShipment(order.shipmentId);
      }
      res.json({
        ...order,
        items: itemsWithDetails,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        shipment,
        labelStatus: order.shipmentId ? "generated" : "none"
      });
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });
  app2.post("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateSellOrder(req.params.id, { status });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.notesCustomer) {
        const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
        if (emailMatch) {
          await sendStatusUpdate(emailMatch[1], order.orderNumber, status, `Your order status has been updated to: ${status.replace("_", " ")}`);
        }
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });
  app2.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      const now = Date.now();
      const aging = orders.filter((o) => ["label_pending", "awaiting_device", "in_transit", "received", "under_inspection", "reoffer_pending", "customer_decision_pending", "payout_pending"].includes(o.status)).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        ageDays: Math.floor((now - new Date(o.createdAt).getTime()) / (1e3 * 60 * 60 * 24))
      })).sort((a, b) => b.ageDays - a.ageDays);
      const metrics = {
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        pendingOrders: orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length,
        avgProcessingTime: (orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()), 0) / Math.max(1, orders.filter((o) => o.status === "completed").length) / (1e3 * 60 * 60 * 24)).toFixed(1)
      };
      res.json({ aging, metrics });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/analytics/full", requireAdmin, async (req, res) => {
    try {
      const { range = "month" } = req.query;
      const orders = await storage.getAllSellOrders();
      const now = /* @__PURE__ */ new Date();
      let startDate = /* @__PURE__ */ new Date();
      if (range === "week") startDate.setDate(now.getDate() - 7);
      else if (range === "month") startDate.setDate(now.getDate() - 30);
      else if (range === "quarter") startDate.setDate(now.getDate() - 90);
      else if (range === "year") startDate.setDate(now.getDate() - 365);
      const filteredOrders = orders.filter((o) => new Date(o.createdAt) >= startDate);
      const ordersOverTime = filteredOrders.reduce((acc, o) => {
        const date = (typeof o.createdAt === "string" ? o.createdAt : o.createdAt.toISOString()).split("T")[0];
        const existing = acc.find((d) => d.date === date);
        if (existing) {
          existing.orders++;
          existing.value += typeof o.totalOriginalOffer === "number" ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || "0");
        } else {
          acc.push({ date, orders: 1, value: typeof o.totalOriginalOffer === "number" ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || "0") });
        }
        return acc;
      }, []).sort((a, b) => a.date.localeCompare(b.date));
      const statusDistribution = filteredOrders.reduce((acc, o) => {
        const existing = acc.find((s) => s.status === o.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: o.status, count: 1 });
        }
        return acc;
      }, []);
      const allOrders = await storage.getAllSellOrders();
      const allItems = await Promise.all(allOrders.map((o) => storage.getSellOrderItemsByOrder(o.id)));
      const items = allItems.flat();
      const deviceMap = /* @__PURE__ */ new Map();
      for (const item of items.filter((i) => filteredOrders.find((o) => o.id === i.sellOrderId))) {
        const order = filteredOrders.find((o) => o.id === item.sellOrderId);
        if (!order) continue;
        const model = await storage.getModel(item.deviceModelId);
        const key = model?.name || "Unknown Device";
        const amount = typeof item.originalOfferAmount === "number" ? item.originalOfferAmount : parseFloat(item.originalOfferAmount || "0");
        if (deviceMap.has(key)) {
          const d = deviceMap.get(key);
          d.count++;
          d.totalAmount += amount;
        } else {
          deviceMap.set(key, { model: key, count: 1, totalAmount: amount });
        }
      }
      const topDevices = Array.from(deviceMap.values()).map((d) => ({ ...d, avgAmount: d.totalAmount / d.count })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + (typeof o.totalOriginalOffer === "number" ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || "0")), 0);
      const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
      const quotes = filteredOrders.length;
      const labeled = filteredOrders.filter((o) => ["awaiting_device", "in_transit", "received", "inspecting", "completed"].includes(o.status)).length;
      const shipped = filteredOrders.filter((o) => ["in_transit", "received", "inspecting", "completed"].includes(o.status)).length;
      const received = filteredOrders.filter((o) => ["received", "inspecting", "completed"].includes(o.status)).length;
      const inspected = filteredOrders.filter((o) => ["inspecting", "completed"].includes(o.status)).length;
      const completed = filteredOrders.filter((o) => o.status === "completed").length;
      res.json({
        ordersOverTime,
        statusDistribution,
        topDevices,
        revenue: { totalPaidOut: totalRevenue, avgOrderValue, totalOrders: filteredOrders.length },
        funnel: { quotes, labeled, shipped, received, inspected, completed }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/orders/needs-printing", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      const needsPrinting = orders.filter((o) => o.status === "label_pending");
      res.json(needsPrinting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch print queue" });
    }
  });
  app2.post("/api/admin/orders/needs-printing/bundle", requireAdmin, async (req, res) => {
    try {
      const { orderIds } = req.body;
      res.json({
        success: true,
        bundleUrl: `/api/admin/print-bundle/${orderIds.join("-")}.pdf`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create bundle" });
    }
  });
  app2.post("/api/admin/orders/:id/mark-kit-sent", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      await storage.updateSellOrder(orderId, { status: "awaiting_device" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark kit sent" });
    }
  });
  app2.get("/api/admin/clicks", requireAdmin, async (req, res) => {
    try {
      const { family = "all", range = "month", sortBy = "clicks" } = req.query;
      const devices = [
        { name: "iPhone 15 Pro Max", family: "iPhone", clicks: 342, orders: 28, conversionRate: 8.2, lastClicked: (/* @__PURE__ */ new Date()).toISOString(), trend: 12 },
        { name: "iPhone 15 Pro", family: "iPhone", clicks: 289, orders: 24, conversionRate: 8.3, lastClicked: (/* @__PURE__ */ new Date()).toISOString(), trend: 8 },
        { name: "Samsung Galaxy S24 Ultra", family: "Samsung", clicks: 198, orders: 15, conversionRate: 7.6, lastClicked: (/* @__PURE__ */ new Date()).toISOString(), trend: -3 },
        { name: "iPhone 14 Pro Max", family: "iPhone", clicks: 176, orders: 14, conversionRate: 8, lastClicked: (/* @__PURE__ */ new Date()).toISOString(), trend: -5 },
        { name: "Google Pixel 8 Pro", family: "Google", clicks: 124, orders: 9, conversionRate: 7.3, lastClicked: (/* @__PURE__ */ new Date()).toISOString(), trend: 15 }
      ];
      let filtered = family !== "all" ? devices.filter((d) => d.family === family) : devices;
      if (sortBy === "conversion") filtered.sort((a, b) => b.conversionRate - a.conversionRate);
      else if (sortBy === "orders") filtered.sort((a, b) => b.orders - a.orders);
      const totalClicks = filtered.reduce((sum, d) => sum + d.clicks, 0);
      const totalOrders = filtered.reduce((sum, d) => sum + d.orders, 0);
      const avgConversion = totalClicks > 0 ? (totalOrders / totalClicks * 100).toFixed(1) : "0";
      res.json({
        metrics: {
          totalClicks,
          uniqueDevices: filtered.length,
          conversionRate: avgConversion
        },
        devices: filtered
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch click data" });
    }
  });
  app2.post("/api/admin/emails/send", requireAdmin, async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      const { sendRawEmail: sendRawEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      await sendRawEmail2(to, subject, body);
      res.json({ success: true, sentAt: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });
  app2.get("/api/admin/emails/history", requireAdmin, async (req, res) => {
    try {
      const emails = [
        { id: "1", to: "customer@example.com", subject: "Order Status Update", sentAt: (/* @__PURE__ */ new Date()).toISOString(), status: "sent" },
        { id: "2", to: "user@example.com", subject: "Payment Confirmation", sentAt: new Date(Date.now() - 864e5).toISOString(), status: "sent" }
      ];
      res.json({ emails });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email history" });
    }
  });
  const stateNameToAbbr = (stateName) => {
    const states = {
      "alabama": "AL",
      "alaska": "AK",
      "arizona": "AZ",
      "arkansas": "AR",
      "california": "CA",
      "colorado": "CO",
      "connecticut": "CT",
      "delaware": "DE",
      "florida": "FL",
      "georgia": "GA",
      "hawaii": "HI",
      "idaho": "ID",
      "illinois": "IL",
      "indiana": "IN",
      "iowa": "IA",
      "kansas": "KS",
      "kentucky": "KY",
      "louisiana": "LA",
      "maine": "ME",
      "maryland": "MD",
      "massachusetts": "MA",
      "michigan": "MI",
      "minnesota": "MN",
      "mississippi": "MS",
      "missouri": "MO",
      "montana": "MT",
      "nebraska": "NE",
      "nevada": "NV",
      "new hampshire": "NH",
      "new jersey": "NJ",
      "new mexico": "NM",
      "new york": "NY",
      "north carolina": "NC",
      "north dakota": "ND",
      "ohio": "OH",
      "oklahoma": "OK",
      "oregon": "OR",
      "pennsylvania": "PA",
      "rhode island": "RI",
      "south carolina": "SC",
      "south dakota": "SD",
      "tennessee": "TN",
      "texas": "TX",
      "utah": "UT",
      "vermont": "VT",
      "virginia": "VA",
      "washington": "WA",
      "west virginia": "WV",
      "wisconsin": "WI",
      "wyoming": "WY",
      "district of columbia": "DC",
      "puerto rico": "PR"
    };
    const normalized = stateName.toLowerCase().trim();
    if (stateName.length === 2 && stateName === stateName.toUpperCase()) {
      return stateName;
    }
    return states[normalized] || stateName;
  };
  app2.post("/api/admin/orders/:id/shipment", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getSellOrder(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      let toAddress = {};
      let customerEmail = "";
      if (order.notesCustomer) {
        const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
        const addressMatch = order.notesCustomer.match(/Address:\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+)/);
        const phoneMatch = order.notesCustomer.match(/Phone:\s*([^\s,]+)/);
        if (emailMatch) customerEmail = emailMatch[1];
        if (addressMatch) {
          const stateProv = addressMatch[3].trim();
          toAddress = {
            name: customerEmail.split("@")[0] || "Customer",
            address_line1: addressMatch[1].trim(),
            city_locality: addressMatch[2].trim(),
            state_province: stateNameToAbbr(stateProv),
            postal_code: addressMatch[4].trim(),
            country_code: "US",
            phone: phoneMatch ? phoneMatch[1] : "",
            email: customerEmail
          };
        } else {
          return res.status(400).json({ error: "Missing shipping address in order" });
        }
      } else {
        return res.status(400).json({ error: "No customer information found" });
      }
      const label = await createShippingLabel(toAddress, order.orderNumber, {
        weight: 16,
        // Default 1 lb for phones
        serviceCode: "usps_ground_advantage"
        // USPS Ground Advantage
      });
      const shipment = await storage.createShipment({
        sellOrderId: orderId,
        carrierName: label.carrier,
        serviceLevel: label.serviceCode,
        trackingNumber: label.trackingNumber,
        labelUrl: label.labelUrl,
        labelCost: label.cost,
        labelPaidBy: "company",
        shipFromAddressJson: JSON.stringify(toAddress),
        shipToAddressJson: JSON.stringify(toAddress)
      });
      await storage.updateSellOrder(orderId, { status: "awaiting_device" });
      if (customerEmail) {
        await sendShippingLabel(customerEmail, order.orderNumber, label.labelUrl);
      }
      res.json({
        ...shipment,
        labelDownloadUrl: label.labelUrl,
        labelPdfUrl: label.labelPdfUrl
      });
    } catch (error) {
      console.error("Shipment error:", error);
      res.status(500).json({ error: error.message || "Failed to generate label" });
    }
  });
  app2.get("/api/orders/:id/shipment", async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });
  app2.get("/api/admin/orders/:id/shipment", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });
  app2.post("/api/admin/orders/:id/shipment/void", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      if (shipment.labelUrl) {
        try {
          const labelId = shipment.trackingNumber || shipment.id;
          await voidLabel(labelId);
        } catch (voidError) {
          console.error("Error voiding label with ShipEngine:", voidError);
        }
      }
      await storage.updateShipment(shipment.id, {
        labelUrl: null,
        trackingNumber: null,
        lastTrackingStatus: "voided"
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to void label" });
    }
  });
  app2.post("/api/admin/orders/:id/shipment/refresh", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      if (!shipment.trackingNumber) return res.status(400).json({ error: "No tracking number" });
      const trackingInfo = await trackShipment(
        shipment.carrierName.toLowerCase(),
        shipment.trackingNumber
      );
      await storage.updateShipment(shipment.id, {
        lastTrackingStatus: trackingInfo.status_description || trackingInfo.status
      });
      res.json({
        status: trackingInfo.status_description || trackingInfo.status,
        trackingInfo
      });
    } catch (error) {
      console.error("Tracking refresh error:", error);
      res.status(500).json({ error: error.message || "Failed to refresh tracking" });
    }
  });
  app2.post("/api/imei/check", async (req, res) => {
    try {
      const { imei } = req.body;
      if (!imei) {
        return res.status(400).json({ error: "IMEI is required" });
      }
      if (!isValidIMEI(imei)) {
        return res.status(400).json({ error: "Invalid IMEI format" });
      }
      const result = await checkIMEI(imei);
      res.json(result);
    } catch (error) {
      console.error("IMEI check error:", error);
      res.status(500).json({ error: error.message || "Failed to check IMEI" });
    }
  });
  app2.get("/api/imei/:imei/device", async (req, res) => {
    try {
      const imei = req.params.imei;
      if (!isValidIMEI(imei)) {
        return res.status(400).json({ error: "Invalid IMEI format" });
      }
      const deviceInfo = await getDeviceInfoFromIMEI(imei);
      res.json(deviceInfo);
    } catch (error) {
      console.error("IMEI device info error:", error);
      res.status(500).json({ error: error.message || "Failed to get device info" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings = await getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      let logoUrl = req.body.logoUrl || "";
      await updateSiteLogo(logoUrl);
      res.json({ success: true, logoUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const registrationSchema = z2.object({
        email: z2.string().email(),
        password: z2.string().min(8),
        firstName: z2.string().min(1),
        lastName: z2.string().min(1),
        phoneNumber: z2.string().optional(),
        marketingOptIn: z2.boolean().optional()
      });
      const validation = registrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid user data",
          details: fromError(validation.error).toString()
        });
      }
      const existing = await storage.getUserByEmail(validation.data.email);
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const hashedPassword = await hashPassword(validation.data.password);
      const user = await storage.createUser({
        email: validation.data.email,
        passwordHash: hashedPassword,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        phoneNumber: validation.data.phoneNumber ?? void 0,
        marketingOptIn: validation.data.marketingOptIn ?? false,
        role: "customer",
        // Force customer role
        isEmailVerified: false,
        // Email not verified on registration
        isActive: true
      });
      req.session.userId = user.id;
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z2.object({
        email: z2.string().email(),
        password: z2.string().min(1)
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid credentials format"
        });
      }
      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(403).json({
          error: "Account is deactivated. Please contact support."
        });
      }
      if (!user.isEmailVerified) {
        return res.status(403).json({
          error: "Please verify your email before logging in."
        });
      }
      req.session.userId = user.id;
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });
  app2.get("/api/brands/:slug", async (req, res) => {
    try {
      const brand = await storage.getBrandBySlug(req.params.slug);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  });
  app2.get("/api/models", async (req, res) => {
    try {
      const brandId = req.query.brandId;
      if (brandId) {
        const models = await storage.getModelsByBrand(brandId);
        res.json(models);
      } else {
        const models = await storage.getAllModels();
        res.json(models);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });
  app2.get("/api/models/:slug", async (req, res) => {
    try {
      const model = await storage.getModelBySlug(req.params.slug);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      const variants = await storage.getVariantsByModel(model.id);
      res.json({ ...model, variants });
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });
  app2.get("/api/variants/:id", async (req, res) => {
    try {
      const variant = await storage.getVariant(req.params.id);
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }
      res.json(variant);
    } catch (error) {
      console.error("Error fetching variant:", error);
      res.status(500).json({ error: "Failed to fetch variant" });
    }
  });
  app2.get("/api/models/:modelId/variants", async (req, res) => {
    try {
      const variants = await storage.getVariantsByModel(req.params.modelId);
      res.json(variants);
    } catch (error) {
      console.error("Error fetching variants:", error);
      res.status(500).json({ error: "Failed to fetch variants" });
    }
  });
  app2.get("/api/conditions", async (req, res) => {
    try {
      const profiles = await storage.getAllConditionProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching condition profiles:", error);
      res.status(500).json({ error: "Failed to fetch condition profiles" });
    }
  });
  app2.get("/api/pricing/:variantId/:conditionId", async (req, res) => {
    try {
      const { variantId, conditionId } = req.params;
      const rule = await storage.getPricingRuleByVariantAndCondition(variantId, conditionId);
      if (!rule) {
        return res.status(404).json({ error: "Pricing rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  });
  app2.post("/api/pricing/calculate", async (req, res) => {
    try {
      const schema = z2.object({
        deviceVariantId: z2.string(),
        conditionProfileId: z2.string(),
        claimedIssues: z2.object({
          isFinanced: z2.boolean().optional(),
          noPower: z2.boolean().optional(),
          functionalIssue: z2.boolean().optional(),
          crackedGlass: z2.boolean().optional(),
          activationLock: z2.boolean().optional()
        }).optional()
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid pricing data",
          details: fromError(validation.error).toString()
        });
      }
      console.log("[Pricing] Calculating offer for:", {
        variantId: validation.data.deviceVariantId,
        conditionId: validation.data.conditionProfileId,
        issues: validation.data.claimedIssues
      });
      const result = await calculateDeviceOffer(validation.data);
      if (!result) {
        console.log("[Pricing] No pricing rule found for variant:", validation.data.deviceVariantId, "condition:", validation.data.conditionProfileId);
        return res.status(404).json({
          error: "No pricing rule found for this device variant and condition"
        });
      }
      console.log("[Pricing] Calculated offer:", result.finalOffer);
      res.json(result);
    } catch (error) {
      console.error("Error calculating price:", error);
      res.status(500).json({ error: "Failed to calculate price" });
    }
  });
  app2.get("/api/quotes/my-quotes", requireAuth, async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequestsByUser(req.session.userId);
      const quotesWithItems = await Promise.all(
        quotes.map(async (quote) => {
          const lineItems = await storage.getQuoteLineItemsByQuote(quote.id);
          const itemsWithDetails = await Promise.all(
            lineItems.map(async (item) => {
              const model = item.deviceModelId ? await storage.getModel(item.deviceModelId) : null;
              const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
              return {
                ...item,
                deviceModel: model,
                deviceVariant: variant
              };
            })
          );
          return { ...quote, items: itemsWithDetails };
        })
      );
      res.json(quotesWithItems);
    } catch (error) {
      console.error("Error fetching user quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });
  app2.post("/api/quotes", async (req, res) => {
    try {
      const validation = insertQuoteRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid quote data",
          details: fromError(validation.error).toString()
        });
      }
      const quoteNumber = `SHC-Q-${Date.now().toString().slice(-6)}`;
      const quote = await storage.createQuoteRequest({
        ...validation.data,
        quoteNumber
      });
      res.status(201).json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });
  app2.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuoteRequest(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const lineItems = await storage.getQuoteLineItemsByQuote(quote.id);
      res.json({ ...quote, lineItems });
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });
  app2.get("/api/quotes/by-number/:quoteNumber", async (req, res) => {
    try {
      const quote = await storage.getQuoteRequestByNumber(req.params.quoteNumber);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      const lineItems = await storage.getQuoteLineItemsByQuote(quote.id);
      res.json({ ...quote, lineItems });
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });
  app2.post("/api/quotes/:quoteId/items", async (req, res) => {
    try {
      const validation = insertQuoteLineItemSchema.safeParse({
        ...req.body,
        quoteRequestId: req.params.quoteId
      });
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid line item data",
          details: fromError(validation.error).toString()
        });
      }
      const item = await storage.createQuoteLineItem(validation.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating line item:", error);
      res.status(500).json({ error: "Failed to create line item" });
    }
  });
  app2.patch("/api/quotes/:id", async (req, res) => {
    try {
      const updateSchema = insertQuoteRequestSchema.partial();
      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid update data",
          details: fromError(validation.error).toString()
        });
      }
      const quote = await storage.updateQuoteRequest(req.params.id, validation.data);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });
  app2.get("/api/users/:userId/quotes", requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.userId) {
        const user = await storage.getUser(req.session.userId);
        if (!user || user.role !== "admin" && user.role !== "super_admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const quotes = await storage.getQuoteRequestsByUser(req.params.userId);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching user quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderNumber = `SHC-S-${Date.now().toString().slice(-6)}`;
      const validation = insertSellOrderSchema.safeParse({
        ...req.body,
        orderNumber
      });
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid order data",
          details: fromError(validation.error).toString()
        });
      }
      const order = await storage.createSellOrder(validation.data);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.post("/api/orders/:orderId/items", async (req, res) => {
    try {
      const validation = insertSellOrderItemSchema.safeParse({
        ...req.body,
        sellOrderId: req.params.orderId
      });
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid order item data",
          details: fromError(validation.error).toString()
        });
      }
      console.log("Creating order item with data:", JSON.stringify(validation.data, null, 2));
      const item = await storage.createSellOrderItem(validation.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating order item:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        data: req.body
      });
      res.status(500).json({
        error: "Failed to create order item",
        details: error.message
      });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getSellOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getSellOrderItemsByOrder(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.get("/api/orders/by-number/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getSellOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getSellOrderItemsByOrder(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders/:id/generate-label", async (req, res) => {
    try {
      const orderId = req.params.id;
      const { name, email, phone, address, city, state, zipCode } = req.body;
      console.log("[Label Gen] Starting for order:", orderId);
      const order = await storage.getSellOrder(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      console.log("[Label Gen] Order data:", {
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddressLine1: order.shippingAddressLine1,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostalCode: order.shippingPostalCode
      });
      const customerEmail = email || order.customerEmail;
      const customerPhone = phone || order.customerPhone;
      const customerName = name || customerEmail?.split("@")[0] || "Customer";
      const shippingAddress = address || order.shippingAddressLine1;
      const shippingCity = city || order.shippingCity;
      const shippingState = state || order.shippingState;
      const shippingZip = zipCode || order.shippingPostalCode;
      if (!customerEmail || !shippingAddress || !shippingCity || !shippingState || !shippingZip) {
        console.log("[Label Gen] Missing fields:", {
          customerEmail: !!customerEmail,
          shippingAddress: !!shippingAddress,
          shippingCity: !!shippingCity,
          shippingState: !!shippingState,
          shippingZip: !!shippingZip
        });
        return res.status(400).json({
          error: "Missing shipping information",
          details: "Order must have complete shipping address to generate label"
        });
      }
      const toAddress = {
        name: customerName,
        address_line1: shippingAddress,
        city_locality: shippingCity,
        state_province: stateNameToAbbr(shippingState),
        postal_code: shippingZip,
        country_code: "US",
        phone: customerPhone || "",
        email: customerEmail
      };
      console.log("[Label Gen] Calling ShipEngine with address:", toAddress.city_locality, toAddress.state_province);
      const label = await createShippingLabel(toAddress, order.orderNumber, {
        weight: 16,
        // Default 1 lb for phones
        serviceCode: "usps_ground_advantage"
      });
      console.log("[Label Gen] Label created:", { trackingNumber: label.trackingNumber, labelUrl: label.labelUrl?.substring(0, 50) });
      const shipment = await storage.createShipment({
        sellOrderId: orderId,
        carrierName: label.carrier,
        serviceLevel: label.serviceCode,
        trackingNumber: label.trackingNumber,
        labelUrl: label.labelUrl,
        labelCost: label.cost,
        labelPaidBy: "company",
        shipFromAddressJson: JSON.stringify(toAddress),
        shipToAddressJson: JSON.stringify(toAddress)
      });
      console.log("[Label Gen] Shipment saved:", shipment.id);
      await storage.updateSellOrder(orderId, {
        shipmentId: shipment.id,
        status: "awaiting_device"
      });
      console.log("[Label Gen] Order updated with shipment ID");
      if (email) {
        await sendShippingLabel(email, order.orderNumber, label.labelUrl);
      }
      res.json({
        ...shipment,
        labelDownloadUrl: label.labelUrl,
        labelPdfUrl: label.labelPdfUrl
      });
    } catch (error) {
      console.error("[Label Gen] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate label" });
    }
  });
  app2.patch("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const oldOrder = await storage.getSellOrder(req.params.id);
      if (!oldOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      const updateSchema = insertSellOrderSchema.partial();
      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid update data",
          details: fromError(validation.error).toString()
        });
      }
      const order = await storage.updateSellOrder(req.params.id, validation.data);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (req.body.status && req.body.status !== oldOrder.status) {
        const emailMatch = order.notesCustomer?.match(/Email:\s*([^\s,]+)/);
        const email = emailMatch ? emailMatch[1] : null;
        if (email) {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          const firstItem = items[0];
          let deviceName = "Your device";
          if (firstItem) {
            const model = await storage.getModel(firstItem.deviceModelId);
            if (model) deviceName = model.name;
          }
          switch (req.body.status) {
            case "received":
              await sendDeviceReceived(email, order.orderNumber, deviceName);
              break;
            case "payout_pending":
              const payoutPendingAmount = order.totalFinalOffer || order.totalOriginalOffer;
              const pendingAmount = typeof payoutPendingAmount === "number" ? payoutPendingAmount : parseFloat(payoutPendingAmount || "0");
              await sendInspectionComplete(email, order.orderNumber, pendingAmount, true);
              break;
            case "completed":
              if (order.payoutStatus === "sent") {
                const payoutAmount = order.totalFinalOffer || order.totalOriginalOffer;
                const amount = typeof payoutAmount === "number" ? payoutAmount : parseFloat(payoutAmount || "0");
                await sendPaymentConfirmation(email, order.orderNumber, amount, order.payoutMethod || "selected method");
              }
              break;
            case "reoffer_pending":
            case "customer_decision_pending":
              if (order.totalFinalOffer) {
                const finalOffer = typeof order.totalFinalOffer === "number" ? order.totalFinalOffer : parseFloat(order.totalFinalOffer);
                await sendInspectionComplete(email, order.orderNumber, finalOffer, false);
              }
              break;
          }
        }
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  app2.get("/api/orders/my-orders", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const orders = await storage.getSellOrdersByUser(userId);
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const model = await storage.getModel(item.deviceModelId);
              const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
              return {
                ...item,
                deviceModel: model,
                deviceVariant: variant
              };
            })
          );
          return {
            ...order,
            items: itemsWithDetails
          };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders/accept-offer", requireAuth, async (req, res) => {
    try {
      const schema = z2.object({
        deviceModelId: z2.string(),
        deviceVariantId: z2.string(),
        conditionProfileId: z2.string(),
        claimedIssues: z2.object({
          isFinanced: z2.boolean(),
          noPower: z2.boolean(),
          functionalIssue: z2.boolean(),
          crackedGlass: z2.boolean(),
          activationLock: z2.boolean()
        }),
        imei: z2.string().optional(),
        serialNumber: z2.string().optional()
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid offer data",
          details: fromError(validation.error).toString()
        });
      }
      const variant = await storage.getVariant(validation.data.deviceVariantId);
      if (!variant) {
        return res.status(404).json({ error: "Device variant not found" });
      }
      if (variant.modelId !== validation.data.deviceModelId) {
        return res.status(400).json({ error: "Variant does not belong to specified model" });
      }
      const condition = await storage.getConditionProfile(validation.data.conditionProfileId);
      if (!condition) {
        return res.status(404).json({ error: "Condition profile not found" });
      }
      const pricingResult = await calculateDeviceOffer({
        deviceVariantId: validation.data.deviceVariantId,
        conditionProfileId: validation.data.conditionProfileId,
        claimedIssues: validation.data.claimedIssues
      });
      if (!pricingResult) {
        return res.status(404).json({
          error: "No pricing available for this device and condition"
        });
      }
      const userId = req.session.userId;
      const orderNumber = `SHC-O-${Date.now().toString().slice(-6)}`;
      const order = await storage.createSellOrder({
        orderNumber,
        userId,
        status: "label_pending",
        totalOriginalOffer: pricingResult.finalOffer,
        currency: pricingResult.currency
      });
      await storage.createSellOrderItem({
        sellOrderId: order.id,
        deviceModelId: validation.data.deviceModelId,
        deviceVariantId: validation.data.deviceVariantId,
        claimedConditionProfileId: validation.data.conditionProfileId,
        claimedIssuesJson: JSON.stringify(validation.data.claimedIssues),
        originalOfferAmount: pricingResult.finalOffer,
        pricingRuleId: pricingResult.pricingRuleId,
        basePrice: pricingResult.basePrice,
        totalPenalty: pricingResult.totalPenalty,
        penaltyBreakdownJson: JSON.stringify(pricingResult.penalties),
        imei: validation.data.imei,
        serialNumber: validation.data.serialNumber
      });
      res.status(201).json({ order, pricing: pricingResult });
    } catch (error) {
      console.error("Error accepting offer:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.get("/api/users/:userId/orders", requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.userId) {
        const user = await storage.getUser(req.session.userId);
        if (!user || user.role !== "admin" && user.role !== "super_admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const orders = await storage.getSellOrdersByUser(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const model = await storage.getModel(item.deviceModelId);
              const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
              return {
                ...item,
                deviceModel: model,
                deviceVariant: variant
              };
            })
          );
          return {
            ...order,
            items: itemsWithDetails
          };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.post("/api/admin/brands", requireAdmin, async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ error: "Failed to create brand" });
    }
  });
  app2.patch("/api/admin/brands/:id", requireAdmin, async (req, res) => {
    try {
      const brand = await storage.updateBrand(req.params.id, req.body);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      res.json(brand);
    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(500).json({ error: "Failed to update brand" });
    }
  });
  app2.post("/api/admin/models", requireAdmin, async (req, res) => {
    try {
      const model = await storage.createModel(req.body);
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating model:", error);
      res.status(500).json({ error: "Failed to create model" });
    }
  });
  app2.patch("/api/admin/models/:id", requireAdmin, async (req, res) => {
    app2.delete("/api/admin/models/:id", requireAdmin, async (req2, res2) => {
      try {
        const deleted = await storage.deleteModel(req2.params.id);
        if (!deleted) {
          return res2.status(404).json({ error: "Model not found" });
        }
        res2.status(204).end();
      } catch (error) {
        console.error("Error deleting model:", error);
        res2.status(500).json({ error: "Failed to delete model" });
      }
    });
    try {
      const model = await storage.updateModel(req.params.id, req.body);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      console.error("Error updating model:", error);
      res.status(500).json({ error: "Failed to update model" });
    }
  });
  app2.post("/api/admin/variants", requireAdmin, async (req, res) => {
    try {
      const variant = await storage.createVariant(req.body);
      res.status(201).json(variant);
    } catch (error) {
      console.error("Error creating variant:", error);
      res.status(500).json({ error: "Failed to create variant" });
    }
  });
  app2.patch("/api/admin/variants/:id", requireAdmin, async (req, res) => {
    try {
      const variant = await storage.updateVariant(req.params.id, req.body);
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }
      res.json(variant);
    } catch (error) {
      console.error("Error updating variant:", error);
      res.status(500).json({ error: "Failed to update variant" });
    }
  });
  app2.post("/api/admin/pricing", requireAdmin, async (req, res) => {
    try {
      const rule = await storage.createPricingRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      res.status(500).json({ error: "Failed to create pricing rule" });
    }
  });
  app2.patch("/api/admin/pricing/:id", requireAdmin, async (req, res) => {
    try {
      const rule = await storage.updatePricingRule(req.params.id, req.body);
      if (!rule) {
        return res.status(404).json({ error: "Pricing rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error updating pricing rule:", error);
      res.status(500).json({ error: "Failed to update pricing rule" });
    }
  });
  app2.get("/api/admin/devices", requireAdmin, async (req, res) => {
    try {
      const models = await storage.getAllModels();
      const enriched = await Promise.all(
        models.map(async (model) => ({
          ...model,
          variants: await storage.getVariantsByModel(model.id)
        }))
      );
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });
  let upload;
  async function getUploadMiddleware() {
    if (!upload) {
      const multer = (await import("multer")).default;
      upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } });
    }
    return upload;
  }
  app2.post("/api/admin/devices/import", requireAdmin, async (req, res, next) => {
    const upload2 = await getUploadMiddleware();
    upload2.single("xmlFile")(req, res, async (err) => {
      if (err) return next(err);
      try {
        let xmlContent = req.body.xmlContent;
        if (req.file) {
          xmlContent = req.file.buffer.toString();
        }
        if (!xmlContent) {
          return res.status(400).json({ error: "XML content or file is required" });
        }
        const { parseDeviceXML: parseDeviceXML2 } = await Promise.resolve().then(() => (init_xml_parser(), xml_parser_exports));
        const parsedDevices = await parseDeviceXML2(xmlContent);
        const results = [];
        for (const device of parsedDevices) {
          try {
            let canonicalBrand = device.brand.trim().toLowerCase();
            if (["iphone", "apple", "ios"].includes(canonicalBrand)) {
              canonicalBrand = "apple";
            } else if (["samsung", "sumsung", "galaxy"].includes(canonicalBrand)) {
              canonicalBrand = "samsung";
            }
            let brand = await storage.getBrandBySlug(canonicalBrand);
            if (!brand) {
              brand = await storage.createBrand({
                name: canonicalBrand.charAt(0).toUpperCase() + canonicalBrand.slice(1),
                slug: canonicalBrand,
                isActive: true
              });
            }
            let model = await storage.getModelBySlug(device.slug);
            if (!model) {
              model = await storage.createModel({
                brandId: brand.id,
                familyId: null,
                name: device.name,
                marketingName: device.name,
                sku: null,
                slug: device.slug,
                imageUrl: device.imageUrl || null,
                year: device.year || null,
                networkTechnology: null,
                isActive: true
              });
            }
            const conditionProfiles = await storage.getAllConditionProfiles();
            const conditions = new Map(conditionProfiles.map((c) => [c.code, c.id]));
            for (const variant of device.variants) {
              let dbVariant = await storage.createVariant({
                modelId: model.id,
                storageGb: parseInt(variant.storage),
                color: variant.color || null,
                networkCarrier: variant.carrier || "unlocked",
                hasEsim: false,
                isActive: true
              });
              for (const price of variant.pricing) {
                const conditionCode = price.condition === "flawless" ? "A" : price.condition === "good" ? "B" : "C";
                const conditionId = conditions.get(conditionCode);
                if (conditionId && price.price > 0) {
                  await storage.createPricingRule({
                    deviceVariantId: dbVariant.id,
                    conditionProfileId: conditionId,
                    basePrice: parseFloat(price.price.toString()),
                    currency: "USD",
                    isBlacklistedEligible: false,
                    isActive: true
                  });
                }
              }
            }
            results.push({
              success: true,
              device: device.name,
              message: `Successfully imported ${device.name}`
            });
          } catch (error) {
            results.push({
              success: false,
              device: device.name,
              message: `Failed to import ${device.name}: ${error.message}`
            });
          }
        }
        res.status(200).json({
          totalDevices: parsedDevices.length,
          results
        });
      } catch (error) {
        console.error("Error importing devices:", error);
        res.status(500).json({ error: "Failed to import devices" });
      }
    });
  });
  app2.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.id) {
        const user2 = await storage.getUser(req.session.userId);
        if (!user2 || user2.role !== "admin" && user2.role !== "super_admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.id) {
        const user2 = await storage.getUser(req.session.userId);
        if (!user2 || user2.role !== "admin" && user2.role !== "super_admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      const { passwordHash, ...updates } = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server-api-only.js
var app = express();
var PORT = process.env.PORT || 8032;
var allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["https://toratyosef.github.io", "https://beta.secondhandcell.com"];
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
}));
var Store = SQLiteStore(session);
app.use(
  session({
    store: new Store({
      db: "sessions.db",
      dir: "./",
      clear_expired: true,
      checkExpirationInterval: 9e5
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var server = await registerRoutes(app);
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API server running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message}`, err);
  res.status(status).json({ message });
});
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\u2705 API server running on port ${PORT}`);
});

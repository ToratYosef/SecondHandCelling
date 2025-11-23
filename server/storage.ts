// DatabaseStorage implementation from blueprint:javascript_database
import { db } from "./db";
import { eq, and, or, isNull, lte, gte } from "drizzle-orm";
import {
  users,
  deviceBrands,
  deviceModels,
  deviceVariants,
  buybackConditionProfiles,
  buybackPricingRules,
  quoteRequests,
  quoteLineItems,
  sellOrders,
  sellOrderItems,
  type User,
  type InsertUser,
  type DeviceBrand,
  type InsertDeviceBrand,
  type DeviceModel,
  type InsertDeviceModel,
  type DeviceVariant,
  type InsertDeviceVariant,
  type BuybackConditionProfile,
  type InsertBuybackConditionProfile,
  type BuybackPricingRule,
  type InsertBuybackPricingRule,
  type QuoteRequest,
  type InsertQuoteRequest,
  type QuoteLineItem,
  type InsertQuoteLineItem,
  type SellOrder,
  type InsertSellOrder,
  type SellOrderItem,
  type InsertSellOrderItem,
} from "@shared/schema";

export interface IStorage {
    // Shipments
    getShipment(id: string): Promise<any>;
    getShipmentByOrder(orderId: string): Promise<any>;
    createShipment(shipment: any): Promise<any>;
    updateShipment(id: string, updates: Partial<any>): Promise<any>;
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Device Brands
  getAllBrands(): Promise<DeviceBrand[]>;
  getBrand(id: string): Promise<DeviceBrand | undefined>;
  getBrandBySlug(slug: string): Promise<DeviceBrand | undefined>;
  createBrand(brand: InsertDeviceBrand): Promise<DeviceBrand>;
  updateBrand(id: string, updates: Partial<DeviceBrand>): Promise<DeviceBrand | undefined>;

  // Device Models
  getAllModels(): Promise<DeviceModel[]>;
  getModel(id: string): Promise<DeviceModel | undefined>;
  getModelBySlug(slug: string): Promise<DeviceModel | undefined>;
  getModelsByBrand(brandId: string): Promise<DeviceModel[]>;
  createModel(model: InsertDeviceModel): Promise<DeviceModel>;
  updateModel(id: string, updates: Partial<DeviceModel>): Promise<DeviceModel | undefined>;

  // Device Variants
  getVariant(id: string): Promise<DeviceVariant | undefined>;
  getVariantsByModel(modelId: string): Promise<DeviceVariant[]>;
  createVariant(variant: InsertDeviceVariant): Promise<DeviceVariant>;
  updateVariant(id: string, updates: Partial<DeviceVariant>): Promise<DeviceVariant | undefined>;

  // Buyback Condition Profiles
  getAllConditionProfiles(): Promise<BuybackConditionProfile[]>;
  getConditionProfile(id: string): Promise<BuybackConditionProfile | undefined>;
  getConditionProfileByCode(code: string): Promise<BuybackConditionProfile | undefined>;
  createConditionProfile(profile: InsertBuybackConditionProfile): Promise<BuybackConditionProfile>;

  // Buyback Pricing Rules
  getPricingRule(id: string): Promise<BuybackPricingRule | undefined>;
  getPricingRulesByVariant(variantId: string): Promise<BuybackPricingRule[]>;
  getPricingRuleByVariantAndCondition(variantId: string, conditionId: string): Promise<BuybackPricingRule | undefined>;
  createPricingRule(rule: InsertBuybackPricingRule): Promise<BuybackPricingRule>;
  updatePricingRule(id: string, updates: Partial<BuybackPricingRule>): Promise<BuybackPricingRule | undefined>;

  // Quote Requests
  getQuoteRequest(id: string): Promise<QuoteRequest | undefined>;
  getQuoteRequestByNumber(quoteNumber: string): Promise<QuoteRequest | undefined>;
  getQuoteRequestsByUser(userId: string): Promise<QuoteRequest[]>;
  getQuoteRequestsByEmail(email: string): Promise<QuoteRequest[]>;
  createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;

  // Quote Line Items
  getQuoteLineItem(id: string): Promise<QuoteLineItem | undefined>;
  getQuoteLineItemsByQuote(quoteRequestId: string): Promise<QuoteLineItem[]>;
  createQuoteLineItem(item: InsertQuoteLineItem): Promise<QuoteLineItem>;

  // Sell Orders
  getSellOrder(id: string): Promise<SellOrder | undefined>;
  getSellOrderByNumber(orderNumber: string): Promise<SellOrder | undefined>;
  getSellOrdersByUser(userId: string): Promise<SellOrder[]>;
  getAllSellOrders(): Promise<SellOrder[]>;
  createSellOrder(order: InsertSellOrder): Promise<SellOrder>;
  updateSellOrder(id: string, updates: Partial<SellOrder>): Promise<SellOrder | undefined>;

  // Sell Order Items
  getSellOrderItem(id: string): Promise<SellOrderItem | undefined>;
  getSellOrderItemsByOrder(sellOrderId: string): Promise<SellOrderItem[]>;
  createSellOrderItem(item: InsertSellOrderItem): Promise<SellOrderItem>;
  updateSellOrderItem(id: string, updates: Partial<SellOrderItem>): Promise<SellOrderItem | undefined>;
}

export class DatabaseStorage implements IStorage {
      // Shipments
      async getShipment(id: string): Promise<any> {
        const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
        return shipment || undefined;
      }
      async getShipmentByOrder(orderId: string): Promise<any> {
        const [shipment] = await db.select().from(shipments).where(eq(shipments.sellOrderId, orderId));
        return shipment || undefined;
      }
      async createShipment(shipment: any): Promise<any> {
        const [newShipment] = await db.insert(shipments).values(shipment).returning();
        return newShipment;
      }
      async updateShipment(id: string, updates: Partial<any>): Promise<any> {
        const [shipment] = await db.update(shipments).set({ ...updates, updatedAt: new Date() }).where(eq(shipments.id, id)).returning();
        return shipment || undefined;
      }
    async deleteModel(id: string): Promise<boolean> {
      const result = await db.delete(deviceModels).where(eq(deviceModels.id, id));
      return result.changes > 0;
    }
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Device Brands
  async getAllBrands(): Promise<DeviceBrand[]> {
    return await db.select().from(deviceBrands).where(eq(deviceBrands.isActive, true));
  }

  async getBrand(id: string): Promise<DeviceBrand | undefined> {
    const [brand] = await db.select().from(deviceBrands).where(eq(deviceBrands.id, id));
    return brand || undefined;
  }

  async getBrandBySlug(slug: string): Promise<DeviceBrand | undefined> {
    const [brand] = await db.select().from(deviceBrands).where(eq(deviceBrands.slug, slug));
    return brand || undefined;
  }

  async createBrand(brand: InsertDeviceBrand): Promise<DeviceBrand> {
    const [newBrand] = await db.insert(deviceBrands).values(brand).returning();
    return newBrand;
  }

  async updateBrand(id: string, updates: Partial<DeviceBrand>): Promise<DeviceBrand | undefined> {
    const [brand] = await db
      .update(deviceBrands)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deviceBrands.id, id))
      .returning();
    return brand || undefined;
  }

  // Device Models
  async getAllModels(): Promise<DeviceModel[]> {
    return await db.select().from(deviceModels).where(eq(deviceModels.isActive, true));
  }

  async getModel(id: string): Promise<DeviceModel | undefined> {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.id, id));
    return model || undefined;
  }

  async getModelBySlug(slug: string): Promise<DeviceModel | undefined> {
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.slug, slug));
    return model || undefined;
  }

  async getModelsByBrand(brandId: string): Promise<DeviceModel[]> {
    return await db
      .select()
      .from(deviceModels)
      .where(and(eq(deviceModels.brandId, brandId), eq(deviceModels.isActive, true)));
  }

  async createModel(model: InsertDeviceModel): Promise<DeviceModel> {
    const [newModel] = await db.insert(deviceModels).values(model).returning();
    return newModel;
  }

  async updateModel(id: string, updates: Partial<DeviceModel>): Promise<DeviceModel | undefined> {
    const [model] = await db
      .update(deviceModels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deviceModels.id, id))
      .returning();
    return model || undefined;
  }

  // Device Variants
  async getVariant(id: string): Promise<DeviceVariant | undefined> {
    const [variant] = await db.select().from(deviceVariants).where(eq(deviceVariants.id, id));
    return variant || undefined;
  }

  async getVariantsByModel(modelId: string): Promise<DeviceVariant[]> {
    return await db
      .select()
      .from(deviceVariants)
      .where(and(eq(deviceVariants.modelId, modelId), eq(deviceVariants.isActive, true)));
  }

  async createVariant(variant: InsertDeviceVariant): Promise<DeviceVariant> {
    const [newVariant] = await db.insert(deviceVariants).values(variant).returning();
    return newVariant;
  }

  async updateVariant(id: string, updates: Partial<DeviceVariant>): Promise<DeviceVariant | undefined> {
    const [variant] = await db
      .update(deviceVariants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deviceVariants.id, id))
      .returning();
    return variant || undefined;
  }

  // Buyback Condition Profiles
  async getAllConditionProfiles(): Promise<BuybackConditionProfile[]> {
    return await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.isActive, true));
  }

  async getConditionProfile(id: string): Promise<BuybackConditionProfile | undefined> {
    const [profile] = await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.id, id));
    return profile || undefined;
  }

  async getConditionProfileByCode(code: string): Promise<BuybackConditionProfile | undefined> {
    const [profile] = await db.select().from(buybackConditionProfiles).where(eq(buybackConditionProfiles.code, code));
    return profile || undefined;
  }

  async createConditionProfile(profile: InsertBuybackConditionProfile): Promise<BuybackConditionProfile> {
    const [newProfile] = await db.insert(buybackConditionProfiles).values(profile).returning();
    return newProfile;
  }

  // Buyback Pricing Rules
  async getPricingRule(id: string): Promise<BuybackPricingRule | undefined> {
    const [rule] = await db.select().from(buybackPricingRules).where(eq(buybackPricingRules.id, id));
    return rule || undefined;
  }

  async getPricingRulesByVariant(variantId: string): Promise<BuybackPricingRule[]> {
    const now = new Date();
    return await db
      .select()
      .from(buybackPricingRules)
      .where(
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

  async getPricingRuleByVariantAndCondition(
    variantId: string,
    conditionId: string
  ): Promise<BuybackPricingRule | undefined> {
    const now = new Date();
    const [rule] = await db
      .select()
      .from(buybackPricingRules)
      .where(
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
    return rule || undefined;
  }

  async createPricingRule(rule: InsertBuybackPricingRule): Promise<BuybackPricingRule> {
    const [newRule] = await db.insert(buybackPricingRules).values(rule).returning();
    return newRule;
  }

  async updatePricingRule(id: string, updates: Partial<BuybackPricingRule>): Promise<BuybackPricingRule | undefined> {
    const [rule] = await db
      .update(buybackPricingRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(buybackPricingRules.id, id))
      .returning();
    return rule || undefined;
  }

  // Quote Requests
  async getQuoteRequest(id: string): Promise<QuoteRequest | undefined> {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quote || undefined;
  }

  async getQuoteRequestByNumber(quoteNumber: string): Promise<QuoteRequest | undefined> {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.quoteNumber, quoteNumber));
    return quote || undefined;
  }

  async getQuoteRequestsByUser(userId: string): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));
  }

  async getQuoteRequestsByEmail(email: string): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).where(eq(quoteRequests.email, email));
  }

  async createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest> {
    const [newQuote] = await db.insert(quoteRequests).values(quote).returning();
    return newQuote;
  }

  async updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const [quote] = await db
      .update(quoteRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning();
    return quote || undefined;
  }

  // Quote Line Items
  async getQuoteLineItem(id: string): Promise<QuoteLineItem | undefined> {
    const [item] = await db.select().from(quoteLineItems).where(eq(quoteLineItems.id, id));
    return item || undefined;
  }

  async getQuoteLineItemsByQuote(quoteRequestId: string): Promise<QuoteLineItem[]> {
    return await db.select().from(quoteLineItems).where(eq(quoteLineItems.quoteRequestId, quoteRequestId));
  }

  async createQuoteLineItem(item: InsertQuoteLineItem): Promise<QuoteLineItem> {
    const [newItem] = await db.insert(quoteLineItems).values(item).returning();
    return newItem;
  }

  // Sell Orders
  async getSellOrder(id: string): Promise<SellOrder | undefined> {
    const [order] = await db.select().from(sellOrders).where(eq(sellOrders.id, id));
    return order || undefined;
  }

  async getSellOrderByNumber(orderNumber: string): Promise<SellOrder | undefined> {
    const [order] = await db.select().from(sellOrders).where(eq(sellOrders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getSellOrdersByUser(userId: string): Promise<SellOrder[]> {
    return await db.select().from(sellOrders).where(eq(sellOrders.userId, userId));
  }

  async getAllSellOrders(): Promise<SellOrder[]> {
    return await db.select().from(sellOrders);
  }

  async createSellOrder(order: InsertSellOrder): Promise<SellOrder> {
    const [newOrder] = await db.insert(sellOrders).values(order).returning();
    return newOrder;
  }

  async updateSellOrder(id: string, updates: Partial<SellOrder>): Promise<SellOrder | undefined> {
    const [order] = await db
      .update(sellOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sellOrders.id, id))
      .returning();
    return order || undefined;
  }

  // Sell Order Items
  async getSellOrderItem(id: string): Promise<SellOrderItem | undefined> {
    const [item] = await db.select().from(sellOrderItems).where(eq(sellOrderItems.id, id));
    return item || undefined;
  }

  async getSellOrderItemsByOrder(sellOrderId: string): Promise<SellOrderItem[]> {
    return await db.select().from(sellOrderItems).where(eq(sellOrderItems.sellOrderId, sellOrderId));
  }

  async createSellOrderItem(item: InsertSellOrderItem): Promise<SellOrderItem> {
    const [newItem] = await db.insert(sellOrderItems).values(item).returning();
    return newItem;
  }

  async updateSellOrderItem(id: string, updates: Partial<SellOrderItem>): Promise<SellOrderItem | undefined> {
    const [item] = await db
      .update(sellOrderItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sellOrderItems.id, id))
      .returning();
    return item || undefined;
  }
}

export const storage = new DatabaseStorage();

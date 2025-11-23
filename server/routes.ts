import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuoteRequestSchema, 
  insertQuoteLineItemSchema, 
  insertSellOrderSchema, 
  insertUserSchema,
  insertSellOrderItemSchema 
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { hashPassword, comparePassword, requireAuth, requireAdmin } from "./auth";
import { z } from "zod";
import { calculateDeviceOffer } from "./pricing";
import { getSiteSettings, updateSiteLogo } from "./siteSettings";

export async function registerRoutes(app: Express): Promise<Server> {
    // ==========================================================================
    // ADMIN ANALYTICS & AGING ORDERS
    // ==========================================================================
    app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
      try {
        // Aging orders: group by status, show oldest orders
        const orders = await storage.getAllSellOrders();
        const now = Date.now();
        const aging = orders
          .filter(o => ["label_pending","awaiting_device","in_transit","received","under_inspection","reoffer_pending","customer_decision_pending","payout_pending"].includes(o.status))
          .map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            ageDays: Math.floor((now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          }))
          .sort((a, b) => b.ageDays - a.ageDays);
        // Basic metrics
        const metrics = {
          totalOrders: orders.length,
          completedOrders: orders.filter(o => o.status === "completed").length,
          pendingOrders: orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length,
          avgProcessingTime: (orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()), 0) / Math.max(1, orders.filter(o => o.status === "completed").length) / (1000 * 60 * 60 * 24)).toFixed(1),
        };
        res.json({ aging, metrics });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    });
  // ==========================================================================
  // SHIPMENT & LABEL ROUTES
  // ==========================================================================

  // Generate shipping label for an order
  app.post("/api/admin/orders/:id/shipment", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      // TODO: Integrate with real carrier API. For now, generate a fake label URL.
      const labelUrl = `/labels/label-${orderId}.pdf`;
      const shipment = await storage.createShipment({
        sellOrderId: orderId,
        carrierName: "USPS",
        serviceLevel: "Priority",
        trackingNumber: `TRACK${Math.floor(Math.random() * 1000000)}`,
        labelUrl,
        labelCost: 0,
        labelPaidBy: "company",
        shipFromAddressJson: "{}",
        shipToAddressJson: "{}",
      });
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate label" });
    }
  });

  // Get shipment info (label, tracking)
  app.get("/api/admin/orders/:id/shipment", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });

  // Void label
  app.post("/api/admin/orders/:id/shipment/void", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      await storage.updateShipment(shipment.id, { labelUrl: null, trackingNumber: null, lastTrackingStatus: "voided" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to void label" });
    }
  });

  // Refresh tracking status (placeholder)
  app.post("/api/admin/orders/:id/shipment/refresh", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      // TODO: Integrate with carrier API for real tracking
      await storage.updateShipment(shipment.id, { lastTrackingStatus: "In Transit" });
      res.json({ success: true, status: "In Transit" });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh tracking" });
    }
  });

    app.get("/api/settings", async (req, res) => {
      try {
        const settings = await getSiteSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
      }
    });

    app.post("/api/admin/settings", requireAdmin, async (req, res) => {
      try {
        let logoUrl = req.body.logoUrl || "";
        // If file upload, handle it (TODO: implement file upload logic)
        // For now, just use URL
        await updateSiteLogo(logoUrl);
        res.json({ success: true, logoUrl });
      } catch (error) {
        res.status(500).json({ error: "Failed to update settings" });
      }
    });
  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Create registration schema that only allows safe fields
      const registrationSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phoneNumber: z.string().optional(),
        marketingOptIn: z.boolean().optional(),
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
      
      // Hard-code safe defaults for server-managed fields
      const user = await storage.createUser({
        email: validation.data.email,
        passwordHash: hashedPassword,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        phoneNumber: validation.data.phoneNumber ?? undefined,
        marketingOptIn: validation.data.marketingOptIn ?? false,
        role: "customer", // Force customer role
        isEmailVerified: false, // Email not verified on registration
        isActive: true,
      });

      req.session.userId = user.id;

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
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

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ 
          error: "Account is deactivated. Please contact support." 
        });
      }

      // Check if email is verified (optional enforcement - can be disabled for MVP)
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

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
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

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
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

  // ============================================================================
  // DEVICE CATALOG ROUTES (PUBLIC)
  // ============================================================================

  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:slug", async (req, res) => {
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

  app.get("/api/models", async (req, res) => {
    try {
      const brandId = req.query.brandId as string | undefined;
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

  app.get("/api/models/:slug", async (req, res) => {
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

  app.get("/api/variants/:id", async (req, res) => {
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

  app.get("/api/models/:modelId/variants", async (req, res) => {
    try {
      const variants = await storage.getVariantsByModel(req.params.modelId);
      res.json(variants);
    } catch (error) {
      console.error("Error fetching variants:", error);
      res.status(500).json({ error: "Failed to fetch variants" });
    }
  });

  app.get("/api/conditions", async (req, res) => {
    try {
      const profiles = await storage.getAllConditionProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching condition profiles:", error);
      res.status(500).json({ error: "Failed to fetch condition profiles" });
    }
  });

  app.get("/api/pricing/:variantId/:conditionId", async (req, res) => {
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

  // ============================================================================
  // QUOTE MANAGEMENT ROUTES (PUBLIC for creation, PROTECTED for user quotes)
  // ============================================================================

  // Calculate device offer (used during quote builder)
  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const schema = z.object({
        deviceVariantId: z.string(),
        conditionProfileId: z.string(),
        claimedIssues: z.object({
          isFinanced: z.boolean().optional(),
          noPower: z.boolean().optional(),
          functionalIssue: z.boolean().optional(),
          crackedGlass: z.boolean().optional(),
          activationLock: z.boolean().optional(),
        }).optional(),
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

  app.get("/api/quotes/my-quotes", requireAuth, async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequestsByUser(req.session.userId!);
      
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
                deviceVariant: variant,
              };
            })
          );
          
          return { ...quote, items: itemsWithDetails };
        })
      );
      
      res.json(quotesWithItems);
    } catch (error: any) {
      console.error("Error fetching user quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
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
        quoteNumber,
      });

      res.status(201).json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
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

  app.get("/api/quotes/by-number/:quoteNumber", async (req, res) => {
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

  app.post("/api/quotes/:quoteId/items", async (req, res) => {
    try {
      const validation = insertQuoteLineItemSchema.safeParse({
        ...req.body,
        quoteRequestId: req.params.quoteId,
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

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      // Validate update data
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

  // Get user's quotes - PROTECTED
  app.get("/api/users/:userId/quotes", requireAuth, async (req, res) => {
    try {
      // Users can only view their own quotes (unless admin)
      if (req.session.userId !== req.params.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
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

  // ============================================================================
  // SELL ORDERS ROUTES (MIXED: creation can be public, viewing is protected)
  // ============================================================================

  app.post("/api/orders", async (req, res) => {
    try {
      // Inject orderNumber before validation
      const orderNumber = `SHC-S-${Date.now().toString().slice(-6)}`;
      const validation = insertSellOrderSchema.safeParse({
        ...req.body,
        orderNumber,
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

  app.post("/api/orders/:orderId/items", async (req, res) => {
    try {
      const validation = insertSellOrderItemSchema.safeParse({
        ...req.body,
        sellOrderId: req.params.orderId,
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid order item data",
          details: fromError(validation.error).toString()
        });
      }

      const item = await storage.createSellOrderItem(validation.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(500).json({ error: "Failed to create order item" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
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

  app.get("/api/orders/by-number/:orderNumber", async (req, res) => {
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

  app.patch("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      // Validate update data
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
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Get all orders for the logged-in user
  app.get("/api/orders/my-orders", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const orders = await storage.getSellOrdersByUser(userId);
      
      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          
          // Fetch device details for each item
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const model = await storage.getModel(item.deviceModelId);
              const variant = item.deviceVariantId 
                ? await storage.getVariant(item.deviceVariantId)
                : null;
              
              return {
                ...item,
                deviceModel: model,
                deviceVariant: variant,
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithDetails,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Accept offer and create order from pricing result
  app.post("/api/orders/accept-offer", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        deviceModelId: z.string(),
        deviceVariantId: z.string(),
        conditionProfileId: z.string(),
        claimedIssues: z.object({
          isFinanced: z.boolean(),
          noPower: z.boolean(),
          functionalIssue: z.boolean(),
          crackedGlass: z.boolean(),
          activationLock: z.boolean(),
        }),
        imei: z.string().optional(),
        serialNumber: z.string().optional(),
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid offer data",
          details: fromError(validation.error).toString()
        });
      }

      // Validate that variant exists and belongs to the model
      const variant = await storage.getVariant(validation.data.deviceVariantId);
      if (!variant) {
        return res.status(404).json({ error: "Device variant not found" });
      }
      if (variant.modelId !== validation.data.deviceModelId) {
        return res.status(400).json({ error: "Variant does not belong to specified model" });
      }

      // Validate that condition profile exists
      const condition = await storage.getConditionProfile(validation.data.conditionProfileId);
      if (!condition) {
        return res.status(404).json({ error: "Condition profile not found" });
      }

      // Recalculate pricing server-side to prevent fraud
      const pricingResult = await calculateDeviceOffer({
        deviceVariantId: validation.data.deviceVariantId,
        conditionProfileId: validation.data.conditionProfileId,
        claimedIssues: validation.data.claimedIssues,
      });

      if (!pricingResult) {
        return res.status(404).json({ 
          error: "No pricing available for this device and condition" 
        });
      }

      const userId = req.session.userId!;
      const orderNumber = `SHC-O-${Date.now().toString().slice(-6)}`;

      // Create order with server-calculated pricing
      const order = await storage.createSellOrder({
        orderNumber,
        userId,
        status: "label_pending",
        totalOriginalOffer: pricingResult.finalOffer.toString(),
        currency: pricingResult.currency,
      });

      // Create order item with full pricing details and audit data
      await storage.createSellOrderItem({
        sellOrderId: order.id,
        deviceModelId: validation.data.deviceModelId,
        deviceVariantId: validation.data.deviceVariantId,
        claimedConditionProfileId: validation.data.conditionProfileId,
        claimedIssuesJson: validation.data.claimedIssues,
        originalOfferAmount: pricingResult.finalOffer.toString(),
        pricingRuleId: pricingResult.pricingRuleId,
        basePrice: pricingResult.basePrice.toString(),
        totalPenalty: pricingResult.totalPenalty.toString(),
        penaltyBreakdownJson: pricingResult.penalties,
        imei: validation.data.imei,
        serialNumber: validation.data.serialNumber,
      });

      res.status(201).json({ order, pricing: pricingResult });
    } catch (error) {
      console.error("Error accepting offer:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get user's orders - PROTECTED
  app.get("/api/users/:userId/orders", requireAuth, async (req, res) => {
    try {
      // Users can only view their own orders (unless admin)
      if (req.session.userId !== req.params.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
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

  // Get all orders - ADMIN ONLY
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllSellOrders();
      
      // Fetch items for each order with device details
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const model = await storage.getModel(item.deviceModelId);
              const variant = item.deviceVariantId 
                ? await storage.getVariant(item.deviceVariantId)
                : null;
              
              return {
                ...item,
                deviceModel: model,
                deviceVariant: variant,
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithDetails,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES - Device Catalog Management
  // ============================================================================

  app.post("/api/admin/brands", requireAdmin, async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ error: "Failed to create brand" });
    }
  });

  app.patch("/api/admin/brands/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/models", requireAdmin, async (req, res) => {
    try {
      const model = await storage.createModel(req.body);
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating model:", error);
      res.status(500).json({ error: "Failed to create model" });
    }
  });

  app.patch("/api/admin/models/:id", requireAdmin, async (req, res) => {
      app.delete("/api/admin/models/:id", requireAdmin, async (req, res) => {
        try {
          const deleted = await storage.deleteModel(req.params.id);
          if (!deleted) {
            return res.status(404).json({ error: "Model not found" });
          }
          res.status(204).end();
        } catch (error) {
          console.error("Error deleting model:", error);
          res.status(500).json({ error: "Failed to delete model" });
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

  app.post("/api/admin/variants", requireAdmin, async (req, res) => {
    try {
      const variant = await storage.createVariant(req.body);
      res.status(201).json(variant);
    } catch (error) {
      console.error("Error creating variant:", error);
      res.status(500).json({ error: "Failed to create variant" });
    }
  });

  app.patch("/api/admin/variants/:id", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/pricing", requireAdmin, async (req, res) => {
    try {
      const rule = await storage.createPricingRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      res.status(500).json({ error: "Failed to create pricing rule" });
    }
  });

  app.patch("/api/admin/pricing/:id", requireAdmin, async (req, res) => {
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

  app.get("/api/admin/devices", requireAdmin, async (req, res) => {
    try {
      const models = await storage.getAllModels();
      const enriched = await Promise.all(
        models.map(async (model) => ({
          ...model,
          variants: await storage.getVariantsByModel(model.id),
        }))
      );
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  let upload;
  // ESM-compatible dynamic import for multer
  async function getUploadMiddleware() {
    if (!upload) {
      const multer = (await import("multer")).default;
      upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } });
    }
    return upload;
  }

  app.post("/api/admin/devices/import", requireAdmin, async (req, res, next) => {
    const upload = await getUploadMiddleware();
    upload.single("xmlFile")(req, res, async (err) => {
      if (err) return next(err);
      try {
        let xmlContent = req.body.xmlContent;
        // If file was uploaded, use its contents
        if (req.file) {
          xmlContent = req.file.buffer.toString();
        }
        if (!xmlContent) {
          return res.status(400).json({ error: "XML content or file is required" });
        }

        const { parseDeviceXML } = await import("./xml-parser");
        const parsedDevices = await parseDeviceXML(xmlContent);

        const results = [];

        for (const device of parsedDevices) {
          try {
            // Normalize brand names
            let canonicalBrand = device.brand.trim().toLowerCase();
            if (["iphone", "apple", "ios"].includes(canonicalBrand)) {
              canonicalBrand = "apple";
            } else if (["samsung", "sumsung", "galaxy"].includes(canonicalBrand)) {
              canonicalBrand = "samsung";
            }
            // Get or create brand
            let brand = await storage.getBrandBySlug(canonicalBrand);
            if (!brand) {
              brand = await storage.createBrand({
                name: canonicalBrand.charAt(0).toUpperCase() + canonicalBrand.slice(1),
                slug: canonicalBrand,
                isActive: true,
              });
            }

            // Get or create model
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
                isActive: true,
              });
            }

            // Create variants and pricing rules
            const conditionProfiles = await storage.getAllConditionProfiles();
            const conditions = new Map(conditionProfiles.map((c) => [c.code, c.id]));

            for (const variant of device.variants) {
              let dbVariant = await storage.createVariant({
                modelId: model.id,
                storageGb: parseInt(variant.storage),
                color: variant.color || null,
                networkCarrier: variant.carrier || "unlocked",
                hasEsim: false,
                isActive: true,
              });

              // Create pricing rules for each condition
              for (const price of variant.pricing) {
                const conditionCode = price.condition === "flawless" ? "A" : price.condition === "good" ? "B" : "C";
                const conditionId = conditions.get(conditionCode);

                if (conditionId && price.price > 0) {
                  await storage.createPricingRule({
                    deviceVariantId: dbVariant.id,
                    conditionProfileId: conditionId,
                    basePrice: price.price.toString(),
                    currency: "USD",
                    isBlacklistedEligible: false,
                    isActive: true,
                  });
                }
              }
            }

            results.push({
              success: true,
              device: device.name,
              message: `Successfully imported ${device.name}`,
            });
          } catch (error) {
            results.push({
              success: false,
              device: device.name,
              message: `Failed to import ${device.name}: ${(error as any).message}`,
            });
          }
        }

        res.status(200).json({
          totalDevices: parsedDevices.length,
          results,
        });
      } catch (error) {
        console.error("Error importing devices:", error);
        res.status(500).json({ error: "Failed to import devices" });
      }
    });
    });

  // ============================================================================
  // USER MANAGEMENT ROUTES
  // ============================================================================

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Users can only view their own profile (unless admin)
      if (req.session.userId !== req.params.id) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
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

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Users can only update their own profile (unless admin)
      if (req.session.userId !== req.params.id) {
        const user = await storage.getUser(req.session.userId!);
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      // Don't allow changing password through this endpoint
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

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}

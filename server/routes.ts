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
import { 
  sendOrderConfirmation, 
  sendShippingLabel, 
  sendDeviceReceived, 
  sendInspectionComplete, 
  sendPaymentConfirmation,
  sendStatusUpdate 
} from "./email";
import { checkIMEI, isValidIMEI, getDeviceInfoFromIMEI } from "./phonecheck";
import { createShippingLabel, trackShipment, voidLabel, getRateEstimates } from "./shipengine";

export async function registerRoutes(app: Express): Promise<Server> {
    // ==========================================================================
    // ADMIN QUICK STATS (for top bar)
    // ==========================================================================
    app.get("/api/admin/quick-stats", requireAdmin, async (req, res) => {
      try {
        const orders = await storage.getAllSellOrders();
        const today = new Date().toISOString().split('T')[0];
        
        const todayOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          try {
            const created = typeof o.createdAt === 'string' ? o.createdAt : new Date(o.createdAt).toISOString();
            return created.startsWith(today);
          } catch {
            return false;
          }
        }).length;
        const pending = orders.filter(o => ['label_pending', 'awaiting_device', 'in_transit'].includes(o.status)).length;
        const needsPrinting = orders.filter(o => o.status === 'label_pending').length;
        
        res.json({ todayOrders, pending, needsPrinting });
      } catch (error) {
        console.error('Quick stats error:', error);
        res.status(500).json({ error: "Failed to fetch quick stats" });
      }
    });

    // ==========================================================================
    // ADMIN DASHBOARD STATS (for dashboard cards)
    // ==========================================================================
    app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
      try {
        const orders = await storage.getAllSellOrders();
        const now = new Date();
        const thisMonth = orders.filter(o => {
          const createdDate = new Date(o.createdAt);
          return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        });
        const today = now.toISOString().split('T')[0];
        
        const totalOrders = orders.length;
        const monthOrders = thisMonth.length;
        const pendingOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
        const needsPrinting = orders.filter(o => o.status === 'label_pending').length;
        const receivedToday = orders.filter(o => {
          if (!o.updatedAt || o.status !== 'received') return false;
          try {
            const updated = typeof o.updatedAt === 'string' ? o.updatedAt : new Date(o.updatedAt).toISOString();
            return updated.startsWith(today);
          } catch {
            return false;
          }
        }).length;
        const avgOrderValue = orders.length > 0 
          ? (orders.reduce((sum, o) => sum + (typeof o.totalOriginalOffer === 'number' ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || '0')), 0) / orders.length).toFixed(2)
          : '0.00';
        
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

    // ==========================================================================
    // ADMIN ORDERS LIST (with filters, pagination, search)
    // ==========================================================================
    app.get("/api/admin/orders", requireAdmin, async (req, res) => {
      try {
        const { search, status, dateRange, page = '1', pageSize = '20' } = req.query;
        let orders = await storage.getAllSellOrders();
        
        // Apply filters
        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          orders = orders.filter(o => 
            o.orderNumber.toLowerCase().includes(searchLower) ||
            (o.notesCustomer && o.notesCustomer.toLowerCase().includes(searchLower))
          );
        }
        
        if (status && status !== 'all') {
          orders = orders.filter(o => o.status === status);
        }
        
        if (dateRange && dateRange !== 'all') {
          const now = new Date();
          const ranges: Record<string, number> = {
            today: 0,
            week: 7,
            month: 30,
          };
          const daysAgo = ranges[dateRange as string];
          if (daysAgo !== undefined) {
            const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            orders = orders.filter(o => new Date(o.createdAt) >= cutoffDate);
          }
        }
        
        // Sort by created date (newest first)
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Pagination
        const pageNum = parseInt(page as string);
        const pageSizeNum = parseInt(pageSize as string);
        const total = orders.length;
        const paginatedOrders = orders.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
        
        // Enrich with customer info and items
        const enrichedOrders = await Promise.all(paginatedOrders.map(async (order) => {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const model = item.deviceModelId ? await storage.getModel(item.deviceModelId) : null;
            const variant = item.deviceVariantId ? await storage.getVariant(item.deviceVariantId) : null;
            return { ...item, deviceModel: model, deviceVariant: variant };
          }));
          
          // Extract customer info from notes
          let customerName = 'Guest';
          let customerEmail = '';
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
            labelStatus: order.shipmentId ? 'generated' : 'none',
          };
        }));
        
        res.json({ orders: enrichedOrders, total, page: pageNum, pageSize: pageSizeNum });
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
      }
    });

    // ==========================================================================
    // ADMIN GET SINGLE ORDER DETAILS
    // ==========================================================================
    app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
      try {
        const order = await storage.getSellOrder(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Get order items with device details
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

        // Extract customer info from notes
        let customerName = 'Guest';
        let customerEmail = '';
        let customerPhone = '';
        let customerAddress = '';
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

        // Get shipment info if exists
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
          labelStatus: order.shipmentId ? 'generated' : 'none',
        });
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        res.status(500).json({ error: "Failed to fetch order details" });
      }
    });

    // ==========================================================================
    // ADMIN ORDER STATUS UPDATE
    // ==========================================================================
    app.post("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
      try {
        const { status } = req.body;
        const order = await storage.updateSellOrder(req.params.id, { status });
        
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        
        // Send status update email if customer email is available
        if (order.notesCustomer) {
          const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
          if (emailMatch) {
            await sendStatusUpdate(emailMatch[1], order.orderNumber, status, `Your order status has been updated to: ${status.replace('_', ' ')}`);
          }
        }
        
        res.json(order);
      } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
      }
    });

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
    // ADMIN ANALYTICS FULL (for analytics dashboard)
    // ==========================================================================
    app.get("/api/admin/analytics/full", requireAdmin, async (req, res) => {
      try {
        const { range = 'month' } = req.query;
        const orders = await storage.getAllSellOrders();
        const now = new Date();
        
        // Calculate date range
        let startDate = new Date();
        if (range === 'week') startDate.setDate(now.getDate() - 7);
        else if (range === 'month') startDate.setDate(now.getDate() - 30);
        else if (range === 'quarter') startDate.setDate(now.getDate() - 90);
        else if (range === 'year') startDate.setDate(now.getDate() - 365);
        
        const filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
        
        // Orders over time
        const ordersOverTime = filteredOrders.reduce((acc: any[], o) => {
          const date = (typeof o.createdAt === 'string' ? o.createdAt : o.createdAt.toISOString()).split('T')[0];
          const existing = acc.find(d => d.date === date);
          if (existing) {
            existing.orders++;
            existing.value += typeof o.totalOriginalOffer === 'number' ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || '0');
          } else {
            acc.push({ date, orders: 1, value: typeof o.totalOriginalOffer === 'number' ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || '0') });
          }
          return acc;
        }, []).sort((a, b) => a.date.localeCompare(b.date));
        
        // Status distribution
        const statusDistribution = filteredOrders.reduce((acc: any[], o) => {
          const existing = acc.find(s => s.status === o.status);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ status: o.status, count: 1 });
          }
          return acc;
        }, []);
        
        // Top devices
        const allOrders = await storage.getAllSellOrders();
        const allItems = await Promise.all(allOrders.map(o => storage.getSellOrderItemsByOrder(o.id)));
        const items = allItems.flat();
        const deviceMap = new Map();
        for (const item of items.filter((i: any) => filteredOrders.find(o => o.id === i.sellOrderId))) {
          const order = filteredOrders.find(o => o.id === item.sellOrderId);
          if (!order) continue;
          
          const model = await storage.getModel(item.deviceModelId);
          const key = model?.name || 'Unknown Device';
          const amount = typeof item.originalOfferAmount === 'number' ? item.originalOfferAmount : parseFloat(item.originalOfferAmount || '0');
          
          if (deviceMap.has(key)) {
            const d = deviceMap.get(key);
            d.count++;
            d.totalAmount += amount;
          } else {
            deviceMap.set(key, { model: key, count: 1, totalAmount: amount });
          }
        }
        const topDevices = Array.from(deviceMap.values())
          .map(d => ({ ...d, avgAmount: d.totalAmount / d.count }))
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);
        
        // Revenue metrics
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (typeof o.totalOriginalOffer === 'number' ? o.totalOriginalOffer : parseFloat(o.totalOriginalOffer || '0')), 0);
        const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
        
        // Conversion funnel
        const quotes = filteredOrders.length;
        const labeled = filteredOrders.filter(o => ['awaiting_device', 'in_transit', 'received', 'inspecting', 'completed'].includes(o.status)).length;
        const shipped = filteredOrders.filter(o => ['in_transit', 'received', 'inspecting', 'completed'].includes(o.status)).length;
        const received = filteredOrders.filter(o => ['received', 'inspecting', 'completed'].includes(o.status)).length;
        const inspected = filteredOrders.filter(o => ['inspecting', 'completed'].includes(o.status)).length;
        const completed = filteredOrders.filter(o => o.status === 'completed').length;
        
        res.json({
          ordersOverTime,
          statusDistribution,
          topDevices,
          revenue: { totalPaidOut: totalRevenue, avgOrderValue, totalOrders: filteredOrders.length },
          funnel: { quotes, labeled, shipped, received, inspected, completed },
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    });

    // ==========================================================================
    // PRINT QUEUE ROUTES
    // ==========================================================================
    app.get("/api/admin/orders/needs-printing", requireAdmin, async (req, res) => {
      try {
        const orders = await storage.getAllSellOrders();
        const needsPrinting = orders.filter(o => o.status === 'label_pending');
        res.json(needsPrinting);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch print queue" });
      }
    });

    app.post("/api/admin/orders/needs-printing/bundle", requireAdmin, async (req, res) => {
      try {
        const { orderIds } = req.body;
        // In production, you'd generate a combined PDF here
        // For now, return success with placeholder URL
        res.json({ 
          success: true, 
          bundleUrl: `/api/admin/print-bundle/${orderIds.join('-')}.pdf` 
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to create bundle" });
      }
    });

    app.post("/api/admin/orders/:id/mark-kit-sent", requireAdmin, async (req, res) => {
      try {
        const orderId = req.params.id;
        await storage.updateSellOrder(orderId, { status: 'awaiting_device' });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: "Failed to mark kit sent" });
      }
    });

    // ==========================================================================
    // CLICKS ANALYTICS ROUTES
    // ==========================================================================
    app.get("/api/admin/clicks", requireAdmin, async (req, res) => {
      try {
        const { family = 'all', range = 'month', sortBy = 'clicks' } = req.query;
        
        // Mock click data - in production, track this in database
        const devices = [
          { name: "iPhone 15 Pro Max", family: "iPhone", clicks: 342, orders: 28, conversionRate: 8.2, lastClicked: new Date().toISOString(), trend: 12 },
          { name: "iPhone 15 Pro", family: "iPhone", clicks: 289, orders: 24, conversionRate: 8.3, lastClicked: new Date().toISOString(), trend: 8 },
          { name: "Samsung Galaxy S24 Ultra", family: "Samsung", clicks: 198, orders: 15, conversionRate: 7.6, lastClicked: new Date().toISOString(), trend: -3 },
          { name: "iPhone 14 Pro Max", family: "iPhone", clicks: 176, orders: 14, conversionRate: 8.0, lastClicked: new Date().toISOString(), trend: -5 },
          { name: "Google Pixel 8 Pro", family: "Google", clicks: 124, orders: 9, conversionRate: 7.3, lastClicked: new Date().toISOString(), trend: 15 },
        ];
        
        let filtered = family !== 'all' ? devices.filter(d => d.family === family) : devices;
        
        if (sortBy === 'conversion') filtered.sort((a, b) => b.conversionRate - a.conversionRate);
        else if (sortBy === 'orders') filtered.sort((a, b) => b.orders - a.orders);
        
        const totalClicks = filtered.reduce((sum, d) => sum + d.clicks, 0);
        const totalOrders = filtered.reduce((sum, d) => sum + d.orders, 0);
        const avgConversion = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : '0';
        
        res.json({
          metrics: {
            totalClicks,
            uniqueDevices: filtered.length,
            conversionRate: avgConversion,
          },
          devices: filtered,
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch click data" });
      }
    });

    // ==========================================================================
    // EMAIL MANAGEMENT ROUTES
    // ==========================================================================
    app.post("/api/admin/emails/send", requireAdmin, async (req, res) => {
      try {
        const { to, subject, body } = req.body;
        
        // Use sendRawEmail for custom emails
        const { sendRawEmail } = await import('./email');
        await sendRawEmail(to, subject, body);
        
        // In production, save to email history table
        res.json({ success: true, sentAt: new Date().toISOString() });
      } catch (error: any) {
        console.error("Email send error:", error);
        res.status(500).json({ error: error.message || "Failed to send email" });
      }
    });

    app.get("/api/admin/emails/history", requireAdmin, async (req, res) => {
      try {
        // Mock email history - in production, query from email_logs table
        const emails = [
          { id: '1', to: 'customer@example.com', subject: 'Order Status Update', sentAt: new Date().toISOString(), status: 'sent' },
          { id: '2', to: 'user@example.com', subject: 'Payment Confirmation', sentAt: new Date(Date.now() - 86400000).toISOString(), status: 'sent' },
        ];
        res.json({ emails });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch email history" });
      }
    });

  // ==========================================================================
  // SHIPMENT & LABEL ROUTES
  // ==========================================================================

  // Helper function to convert state names to abbreviations
  const stateNameToAbbr = (stateName: string): string => {
    const states: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
      'district of columbia': 'DC', 'puerto rico': 'PR'
    };
    
    const normalized = stateName.toLowerCase().trim();
    // If already 2 characters and uppercase, return as-is
    if (stateName.length === 2 && stateName === stateName.toUpperCase()) {
      return stateName;
    }
    // Otherwise, look up the abbreviation
    return states[normalized] || stateName;
  };

  // Generate shipping label for an order
  app.post("/api/admin/orders/:id/shipment", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getSellOrder(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      
      // Extract shipping info from order notes
      let toAddress: any = {};
      let customerEmail = '';
      
      if (order.notesCustomer) {
        const emailMatch = order.notesCustomer.match(/Email:\s*([^\s,]+)/);
        const addressMatch = order.notesCustomer.match(/Address:\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+)/);
        const phoneMatch = order.notesCustomer.match(/Phone:\s*([^\s,]+)/);
        
        if (emailMatch) customerEmail = emailMatch[1];
        
        if (addressMatch) {
          const stateProv = addressMatch[3].trim();
          toAddress = {
            name: customerEmail.split('@')[0] || 'Customer',
            address_line1: addressMatch[1].trim(),
            city_locality: addressMatch[2].trim(),
            state_province: stateNameToAbbr(stateProv),
            postal_code: addressMatch[4].trim(),
            country_code: 'US',
            phone: phoneMatch ? phoneMatch[1] : '',
            email: customerEmail,
          };
        } else {
          return res.status(400).json({ error: "Missing shipping address in order" });
        }
      } else {
        return res.status(400).json({ error: "No customer information found" });
      }
      
      // Generate shipping label using ShipEngine
      const label = await createShippingLabel(toAddress, order.orderNumber, {
        weight: 16, // Default 1 lb for phones
        serviceCode: 'usps_ground_advantage', // USPS Ground Advantage
      });
      
      // Save shipment info
      const shipment = await storage.createShipment({
        sellOrderId: orderId,
        carrierName: label.carrier,
        serviceLevel: label.serviceCode,
        trackingNumber: label.trackingNumber,
        labelUrl: label.labelUrl,
        labelCost: label.cost,
        labelPaidBy: "company",
        shipFromAddressJson: JSON.stringify(toAddress),
        shipToAddressJson: JSON.stringify(toAddress),
      });
      
      // Update order status to awaiting_device
      await storage.updateSellOrder(orderId, { status: "awaiting_device" });
      
      // Send shipping label email
      if (customerEmail) {
        await sendShippingLabel(customerEmail, order.orderNumber, label.labelUrl);
      }
      
      res.json({
        ...shipment,
        labelDownloadUrl: label.labelUrl,
        labelPdfUrl: label.labelPdfUrl,
      });
    } catch (error: any) {
      console.error("Shipment error:", error);
      res.status(500).json({ error: error.message || "Failed to generate label" });
    }
  });

  // Get shipment info (label, tracking) - PUBLIC for order confirmation page
  app.get("/api/orders/:id/shipment", async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });

  // Get shipment info (label, tracking) - ADMIN
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
      
      // Void label with ShipEngine if we have label ID
      if (shipment.labelUrl) {
        try {
          // Extract label ID from URL or use tracking number as fallback
          const labelId = shipment.trackingNumber || shipment.id;
          await voidLabel(labelId);
        } catch (voidError) {
          console.error("Error voiding label with ShipEngine:", voidError);
          // Continue anyway to update local database
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

  // Refresh tracking status
  app.post("/api/admin/orders/:id/shipment/refresh", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const shipment = await storage.getShipmentByOrder(orderId);
      if (!shipment) return res.status(404).json({ error: "Shipment not found" });
      if (!shipment.trackingNumber) return res.status(400).json({ error: "No tracking number" });
      
      // Fetch tracking from ShipEngine
      const trackingInfo = await trackShipment(
        shipment.carrierName.toLowerCase(), 
        shipment.trackingNumber
      );
      
      // Update shipment with latest tracking status
      await storage.updateShipment(shipment.id, {
        lastTrackingStatus: trackingInfo.status_description || trackingInfo.status,
      });
      
      res.json({ 
        status: trackingInfo.status_description || trackingInfo.status,
        trackingInfo 
      });
    } catch (error: any) {
      console.error("Tracking refresh error:", error);
      res.status(500).json({ error: error.message || "Failed to refresh tracking" });
    }
  });

  // ==========================================================================
  // IMEI CHECK ROUTES
  // ==========================================================================
  
  // Check IMEI using PhoneCheck API
  app.post("/api/imei/check", async (req, res) => {
    try {
      const { imei } = req.body;
      
      if (!imei) {
        return res.status(400).json({ error: "IMEI is required" });
      }
      
      // Validate IMEI format
      if (!isValidIMEI(imei)) {
        return res.status(400).json({ error: "Invalid IMEI format" });
      }
      
      // Check IMEI with PhoneCheck
      const result = await checkIMEI(imei);
      
      res.json(result);
    } catch (error: any) {
      console.error("IMEI check error:", error);
      res.status(500).json({ error: error.message || "Failed to check IMEI" });
    }
  });
  
  // Get device info from IMEI (quick lookup)
  app.get("/api/imei/:imei/device", async (req, res) => {
    try {
      const imei = req.params.imei;
      
      if (!isValidIMEI(imei)) {
        return res.status(400).json({ error: "Invalid IMEI format" });
      }
      
      const deviceInfo = await getDeviceInfoFromIMEI(imei);
      res.json(deviceInfo);
    } catch (error: any) {
      console.error("IMEI device info error:", error);
      res.status(500).json({ error: error.message || "Failed to get device info" });
    }
  });

  // ==========================================================================
  // SITE SETTINGS ROUTES
  // ==========================================================================

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

      console.log("Creating order item with data:", JSON.stringify(validation.data, null, 2));
      const item = await storage.createSellOrderItem(validation.data);
      res.status(201).json(item);
    } catch (error: any) {
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

  // Generate shipping label for a new order (public route)
  app.post("/api/orders/:id/generate-label", async (req, res) => {
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
        shippingPostalCode: order.shippingPostalCode,
      });
      
      // Use provided data or fall back to order data
      const customerEmail = email || order.customerEmail;
      const customerPhone = phone || order.customerPhone;
      const customerName = name || customerEmail?.split('@')[0] || 'Customer';
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
          shippingZip: !!shippingZip,
        });
        return res.status(400).json({ 
          error: "Missing shipping information",
          details: "Order must have complete shipping address to generate label"
        });
      }
      
      // Build shipping address
      const toAddress: any = {
        name: customerName,
        address_line1: shippingAddress,
        city_locality: shippingCity,
        state_province: stateNameToAbbr(shippingState),
        postal_code: shippingZip,
        country_code: 'US',
        phone: customerPhone || '',
        email: customerEmail,
      };
      
      console.log("[Label Gen] Calling ShipEngine with address:", toAddress.city_locality, toAddress.state_province);
      
      // Generate shipping label using ShipEngine
      const label = await createShippingLabel(toAddress, order.orderNumber, {
        weight: 16, // Default 1 lb for phones
        serviceCode: 'usps_ground_advantage',
      });
      
      console.log("[Label Gen] Label created:", { trackingNumber: label.trackingNumber, labelUrl: label.labelUrl?.substring(0, 50) });
      
      // Save shipment info
      const shipment = await storage.createShipment({
        sellOrderId: orderId,
        carrierName: label.carrier,
        serviceLevel: label.serviceCode,
        trackingNumber: label.trackingNumber,
        labelUrl: label.labelUrl,
        labelCost: label.cost,
        labelPaidBy: "company",
        shipFromAddressJson: JSON.stringify(toAddress),
        shipToAddressJson: JSON.stringify(toAddress),
      });
      
      console.log("[Label Gen] Shipment saved:", shipment.id);
      
      // Update order with shipment ID and status
      await storage.updateSellOrder(orderId, { 
        shipmentId: shipment.id,
        status: "awaiting_device" 
      });
      
      console.log("[Label Gen] Order updated with shipment ID");
      
      // Send shipping label email
      if (email) {
        await sendShippingLabel(email, order.orderNumber, label.labelUrl);
      }
      
      res.json({
        ...shipment,
        labelDownloadUrl: label.labelUrl,
        labelPdfUrl: label.labelPdfUrl,
      });
    } catch (error: any) {
      console.error("[Label Gen] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate label" });
    }
  });

  app.patch("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const oldOrder = await storage.getSellOrder(req.params.id);
      if (!oldOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
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
      
      // Send email notifications on status changes
      if (req.body.status && req.body.status !== oldOrder.status) {
        const emailMatch = order.notesCustomer?.match(/Email:\s*([^\s,]+)/);
        const email = emailMatch ? emailMatch[1] : null;
        
        if (email) {
          const items = await storage.getSellOrderItemsByOrder(order.id);
          const firstItem = items[0];
          let deviceName = 'Your device';
          
          if (firstItem) {
            const model = await storage.getModel(firstItem.deviceModelId);
            if (model) deviceName = model.name;
          }
          
          switch (req.body.status) {
            case 'received':
              await sendDeviceReceived(email, order.orderNumber, deviceName);
              break;
            case 'payout_pending':
              const payoutPendingAmount = order.totalFinalOffer || order.totalOriginalOffer;
              const pendingAmount = typeof payoutPendingAmount === 'number' ? payoutPendingAmount : parseFloat(payoutPendingAmount || '0');
              await sendInspectionComplete(email, order.orderNumber, pendingAmount, true);
              break;
            case 'completed':
              if (order.payoutStatus === 'sent') {
                const payoutAmount = order.totalFinalOffer || order.totalOriginalOffer;
                const amount = typeof payoutAmount === 'number' ? payoutAmount : parseFloat(payoutAmount || '0');
                await sendPaymentConfirmation(email, order.orderNumber, amount, order.payoutMethod || 'selected method');
              }
              break;
            case 'reoffer_pending':
            case 'customer_decision_pending':
              if (order.totalFinalOffer) {
                const finalOffer = typeof order.totalFinalOffer === 'number' ? order.totalFinalOffer : parseFloat(order.totalFinalOffer);
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
        totalOriginalOffer: pricingResult.finalOffer,
        currency: pricingResult.currency,
      });

      // Create order item with full pricing details and audit data
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

  let upload: any;
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
    upload.single("xmlFile")(req, res, async (err: any) => {
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
                    basePrice: parseFloat(price.price.toString()),
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

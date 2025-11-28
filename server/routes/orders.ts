import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import * as schema from '@shared/schema';

export function createOrdersRouter() {
  const router = Router();

  // Endpoint to download label PDF for an order
  router.get('/label/:orderNumber', async (req: Request, res: Response) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);
      if (!order) return res.status(404).send('Order not found');
      
      // Get shipment for this order
      const shipments = await storage.getShipmentsByOrderId(order.id);
      if (!shipments.length || !shipments[0].shippingLabelUrl) {
        return res.status(404).send('No label found for this order');
      }
      
      // Download label from ShipEngine
      const { shipEngineService } = require('../services/shipengine');
      const pdfBuffer = await shipEngineService.downloadLabelPdf(shipments[0].shippingLabelUrl);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ShippingLabel-${orderNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading label PDF:', error);
      res.status(500).send('Failed to download label PDF');
    }
  });

  // Fetch PDF content
  router.post('/fetch-pdf', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      
      // TODO: Implement PDF fetching logic
      res.json({ message: 'PDF fetched successfully' });
    } catch (error) {
      console.error('Error fetching PDF:', error);
      res.status(500).json({ error: 'Failed to fetch PDF' });
    }
  });

  // Get all orders
  router.get('/orders', async (req: Request, res: Response) => {
    try {
      // TODO: Implement order listing with filters
      res.json({ orders: [] });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Get orders that need printing
  router.get('/orders/needs-printing', async (req: Request, res: Response) => {
    try {
      // TODO: Query orders with status in PRINT_QUEUE_STATUSES
      res.json({ orders: [] });
    } catch (error) {
      console.error('Error fetching orders needing printing:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create print bundle for orders needing printing
  router.post('/orders/needs-printing/bundle', async (req: Request, res: Response) => {
    try {
      // TODO: Generate bundled PDF for printing
      res.json({ message: 'Print bundle created' });
    } catch (error) {
      console.error('Error creating print bundle:', error);
      res.status(500).json({ error: 'Failed to create print bundle' });
    }
  });

  // Merge PDFs for printing
  router.post('/merge-print', async (req: Request, res: Response) => {
    try {
      const { orderIds } = req.body;
      
      // TODO: Merge PDFs for specified orders
      res.json({ message: 'PDFs merged successfully' });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      res.status(500).json({ error: 'Failed to merge PDFs' });
    }
  });

  // Get merged print by order IDs
  router.get('/merge-print/:orderIds', async (req: Request, res: Response) => {
    try {
      const { orderIds } = req.params;
      
      // TODO: Generate merged PDF for comma-separated order IDs
      res.json({ message: 'Merged print generated' });
    } catch (error) {
      console.error('Error generating merged print:', error);
      res.status(500).json({ error: 'Failed to generate merged print' });
    }
  });

  // Get single order by ID
  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Fetch order by ID from database
      res.json({ order: null });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Order not found' });
    }
  });

  // Find orders by query parameters
  router.get('/orders/find', async (req: Request, res: Response) => {
    try {
      const { trackingNumber, email, orderId } = req.query;
      
      // TODO: Search orders by various criteria
      res.json({ orders: [] });
    } catch (error) {
      console.error('Error finding orders:', error);
      res.status(500).json({ error: 'Failed to find orders' });
    }
  });

  // Get orders by user ID
  router.get('/orders/by-user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // TODO: Fetch all orders for a specific user
      res.json({ orders: [] });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  });

  // Submit new order (public guest flow)
  router.post('/submit-order', async (req: Request, res: Response) => {
    try {
      const OrderSchema = z.object({
        customerInfo: z.object({
          email: z.string().email(),
          name: z.string().min(1),
          phone: z.string().min(7).optional(),
        }),
        devices: z.array(z.object({
          modelId: z.string(),
          storage: z.string().optional(),
          carrier: z.string().optional(),
          condition: z.record(z.string()).optional(),
          price: z.number(),
          quantity: z.number().int().positive().default(1),
        })).min(1),
        shippingAddress: z.object({
          street1: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          contactName: z.string(),
          phone: z.string().optional(),
        }).optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      });

      const parsed = OrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid order payload', details: parsed.error.message });
      }

      const { customerInfo, devices, shippingAddress, paymentMethod, notes } = parsed.data;

      console.log('[submit-order] Received request:', {
        customerEmail: customerInfo.email,
        devicesCount: devices.length,
        hasShippingAddress: !!shippingAddress,
        shippingAddress: shippingAddress
      });

      // Ensure guest user exists
      let guestUser = await storage.getUserByEmail(customerInfo.email);
      if (!guestUser) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        guestUser = await storage.createUser({
          email: customerInfo.email,
          name: customerInfo.name || customerInfo.email.split('@')[0],
          passwordHash,
          role: 'buyer',
          isActive: true,
        });
      }

      // Ensure guest company exists
      let guestCompany = await storage.getCompanyByName('Guest Orders');
      if (!guestCompany) {
        guestCompany = await storage.createCompany({
          name: 'Guest Orders',
          legalName: 'Guest Orders',
          slug: 'guest-orders',
          status: 'pending_review',
          type: 'supplier',
          isActive: true,
        } as any);
      }

      // Calculate totals
      const subtotal = devices.reduce((sum, d) => sum + d.price * (d.quantity ?? 1), 0);
      const shippingCost = 0;
      const taxAmount = 0;
      const discountAmount = 0;
      const total = subtotal + shippingCost + taxAmount - discountAmount;

      // Generate order number (incremental SHC-<number>)
      const orderNumber = await storage.getNextOrderNumber();

      // Create order
      const order = await storage.createOrder({
        orderNumber,
        companyId: guestCompany.id,
        createdByUserId: guestUser.id,
        status: 'label_pending',
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2),
        currency: 'USD',
        notesInternal: notes,
      } as any);

      // Create order items
      for (const d of devices) {
        console.log('[submit-order] Resolving variant for device payload:', {
          modelId: d.modelId,
          storage: d.storage,
          carrier: d.carrier,
          quantity: d.quantity,
          price: d.price,
        });
        // Resolve a real device variant for this model/storage/carrier
        let variants = await storage.getDeviceVariantsByModelId(d.modelId);
        console.log('[submit-order] Found variants:', variants.map(v => ({ id: v.id, storage: v.storage })));
        let match = variants.find(v => (
          (!d.storage || v.storage === d.storage)
        )) || variants[0];

        if (!match) {
          console.log('[submit-order] No variant matched; creating variant on the fly');
          const created = await storage.createDeviceVariant({
            deviceModelId: d.modelId,
            storage: d.storage || 'Unknown',
            color: 'Unknown',
            carrier: d.carrier || 'Unlocked',
            conditionGrade: 'A',
          } as any);
          match = created;
          variants = [created];
        }
        console.log('[submit-order] Using variant:', { id: match.id, storage: match.storage });
        await storage.createOrderItem({
          orderId: order.id,
          deviceVariantId: match.id,
          quantity: d.quantity ?? 1,
          unitPrice: d.price,
          lineTotal: d.price * (d.quantity ?? 1),
        } as any);
        console.log('Created order item payload:', {
          orderId: order.id,
          deviceVariantId: match.id,
          quantity: d.quantity ?? 1,
          unitPrice: d.price,
          lineTotal: d.price * (d.quantity ?? 1),
        });
      }

      // Optional shipping address
      let savedShippingAddress;
      if (shippingAddress) {
        savedShippingAddress = await storage.createShippingAddress({
          companyId: guestCompany.id,
          contactName: shippingAddress.contactName || customerInfo.name || customerInfo.email,
          phone: shippingAddress.phone || customerInfo.phone || "",
          street1: shippingAddress.street1,
          street2: (shippingAddress as any).street2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: "USA",
          isDefault: true,
        } as any);
      }

      // Generate shipping label via ShipEngine
      const { shipEngineService } = require('../services/shipengine');
      const { sendOrderConfirmationEmail } = require('../services/email');
      
      let labelPdfBuffer: Buffer | null = null;
      let trackingNumber: string | null = null;
      let trackingUrl: string | null = null;

      if (shippingAddress) {
        try {
          // For buyback: customer ships TO us, so customer address is ship_from
          // Validate all required fields are present
          const shipFromAddress = {
            name: shippingAddress.contactName || customerInfo.name || customerInfo.email || 'Customer',
            phone: shippingAddress.phone || customerInfo.phone || '0000000000',
            street1: shippingAddress.street1 || shippingAddress.address1 || '',
            street2: (shippingAddress as any).street2 || (shippingAddress as any).address2,
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postalCode || shippingAddress.zipCode || shippingAddress.zip || '',
            country: 'US',
          };

          // Validate required fields before calling ShipEngine
          if (!shipFromAddress.street1 || !shipFromAddress.city || !shipFromAddress.state || !shipFromAddress.postalCode) {
            console.error('[Order] Missing required shipping address fields:', {
              hasStreet1: !!shipFromAddress.street1,
              hasCity: !!shipFromAddress.city,
              hasState: !!shipFromAddress.state,
              hasPostalCode: !!shipFromAddress.postalCode,
              receivedAddress: shippingAddress
            });
            throw new Error('Incomplete shipping address - missing required fields');
          }

          const labelResponse = await shipEngineService.createLabel({
            shipFrom: shipFromAddress,
          });

          trackingNumber = labelResponse.tracking_number;
          trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;

          // Create shipment record
          await storage.createShipment({
            orderId: order.id,
            carrier: labelResponse.carrier_code || 'USPS',
            serviceLevel: labelResponse.service_code || 'usps_priority_mail',
            trackingNumber: trackingNumber,
            shippingLabelUrl: labelResponse.label_download?.pdf || labelResponse.label_download?.href,
          } as any);

          // Download label PDF from ShipEngine
          if (labelResponse.label_download?.pdf) {
            labelPdfBuffer = await shipEngineService.downloadLabelPdf(labelResponse.label_download.pdf);
          }

          console.log('[Order] ShipEngine label created:', {
            orderId: order.id,
            trackingNumber,
            labelUrl: labelResponse.label_download?.pdf,
          });
        } catch (error) {
          console.error('[Order] Failed to create ShipEngine label:', error);
          // Continue without label - admin can generate later
        }
      }

      // Send confirmation email with label PDF
      await sendOrderConfirmationEmail({
        to: customerInfo.email,
        order,
        orderNumber,
        labelPdf: labelPdfBuffer,
        trackingNumber,
        trackingUrl,
        shippingAddress,
      });

      return res.json({ orderNumber, order });
    } catch (error: any) {
      console.error('Error submitting order:', error);
      res.status(500).json({ error: 'Failed to submit order', details: error.message });
    }
  });

  // Get promo code details
  router.get('/promo-codes/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      // TODO: Fetch promo code details and validate
      res.json({ valid: false });
    } catch (error) {
      console.error('Error fetching promo code:', error);
      res.status(500).json({ error: 'Promo code not found' });
    }
  });

  // Generate label for order
  router.post('/generate-label/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Generate shipping label via ShipEngine
      // - Fetch order
      // - Create label
      // - Update order with tracking info
      
      res.json({ message: 'Label generated successfully' });
    } catch (error) {
      console.error('Error generating label:', error);
      res.status(500).json({ error: 'Failed to generate label' });
    }
  });

  // Void shipping label
  router.post('/orders/:id/void-label', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Void label via ShipEngine
      // - Fetch order
      // - Void label
      // - Update order status
      
      res.json({ message: 'Label voided successfully' });
    } catch (error) {
      console.error('Error voiding label:', error);
      res.status(500).json({ error: 'Failed to void label' });
    }
  });

  // Get packing slip for order
  router.get('/packing-slip/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Generate packing slip PDF
      res.json({ message: 'Packing slip generated' });
    } catch (error) {
      console.error('Error generating packing slip:', error);
      res.status(500).json({ error: 'Failed to generate packing slip' });
    }
  });

  // Get print bundle for order
  router.get('/print-bundle/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Generate complete print bundle (labels + packing slip)
      res.json({ message: 'Print bundle generated' });
    } catch (error) {
      console.error('Error generating print bundle:', error);
      res.status(500).json({ error: 'Failed to generate print bundle' });
    }
  });

  // Repair label_generated status orders
  router.post('/repair-label-generated', async (req: Request, res: Response) => {
    try {
      // TODO: Find and fix orders stuck in label_generated status
      res.json({ processedCount: 0, updatedCount: 0 });
    } catch (error) {
      console.error('Failed to repair label-generated orders:', error);
      res.status(500).json({ error: 'Unable to repair label-generated orders' });
    }
  });

  // Alias for repair endpoint
  router.post('/orders/repair-label-generated', async (req: Request, res: Response) => {
    try {
      // TODO: Find and fix orders stuck in label_generated status
      res.json({ processedCount: 0, updatedCount: 0 });
    } catch (error) {
      console.error('Failed to repair label-generated orders:', error);
      res.status(500).json({ error: 'Unable to repair label-generated orders' });
    }
  });

  return router;
}

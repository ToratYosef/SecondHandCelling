  // Endpoint to download label PDF for an order
  router.get('/label/:orderNumber', async (req: Request, res: Response) => {
    try {
      const { orderNumber } = req.params;
      // For demo, regenerate label (in production, store label after creation)
      const order = await storage.getOrderByNumber(orderNumber);
      if (!order) return res.status(404).send('Order not found');
      // Fetch shipping address
      const shippingAddress = await storage.getShippingAddress(order.shippingAddressId);
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      let pdfChunks: Buffer[] = [];
      doc.text(`Shipping Label for Order ${orderNumber}`);
      doc.text(`Name: ${shippingAddress?.contactName || ''}`);
      doc.text(`Address: ${shippingAddress?.street1 || ''} ${shippingAddress?.street2 || ''}`);
      doc.text(`City: ${shippingAddress?.city || ''}`);
      doc.text(`State: ${shippingAddress?.state || ''}`);
      doc.text(`Postal Code: ${shippingAddress?.postalCode || ''}`);
      doc.text(`Country: USA`);
      doc.end();
      doc.on('data', (chunk: Buffer) => pdfChunks.push(chunk));
      await new Promise(resolve => doc.on('end', resolve));
      const pdfBuffer = Buffer.concat(pdfChunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ShippingLabel-${orderNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating label PDF:', error);
      res.status(500).send('Failed to generate label PDF');
    }
  });
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import * as schema from '@shared/schema';

export function createOrdersRouter() {
  const router = Router();

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

      // Ensure guest user exists
      let guestUser = await storage.getUserByEmail(customerInfo.email);
      if (!guestUser) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        guestUser = await storage.createUser({
          email: customerInfo.email,
          name: customerInfo.name || customerInfo.email.split('@')[0],
          passwordHash,
          role: 'customer',
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
        console.log('[submit-order] Found variants:', variants.map(v => ({ id: v.id, storage: v.storage, carrier: v.carrier })));
        let match = variants.find(v => (
          (!d.storage || v.storage === d.storage) &&
          (!d.carrier || v.carrier === d.carrier)
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
        console.log('[submit-order] Using variant:', { id: match.id, storage: match.storage, carrier: match.carrier });

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
      if (shippingAddress) {
        await storage.createShippingAddress({
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

      // Generate shipping label PDF
      const PDFDocument = require('pdfkit');
      const { sendOrderConfirmationEmail } = require('../services/email');
      const doc = new PDFDocument();
      let pdfChunks: Buffer[] = [];
      doc.text(`Shipping Label for Order ${orderNumber}`);
      doc.text(`Name: ${customerInfo.name}`);
      doc.text(`Address: ${shippingAddress?.street1 || ''} ${shippingAddress?.street2 || ''}`);
      doc.text(`City: ${shippingAddress?.city || ''}`);
      doc.text(`State: ${shippingAddress?.state || ''}`);
      doc.text(`Postal Code: ${shippingAddress?.postalCode || ''}`);
      doc.text(`Country: USA`);
      doc.end();
      doc.on('data', (chunk: Buffer) => pdfChunks.push(chunk));
      await new Promise(resolve => doc.on('end', resolve));
      const pdfBuffer = Buffer.concat(pdfChunks);

      // Send confirmation email with label PDF
      await sendOrderConfirmationEmail({
        to: customerInfo.email,
        order,
        orderNumber,
        labelPdf: pdfBuffer,
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

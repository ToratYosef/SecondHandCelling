import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'SecondHandCell <noreply@secondhandcell.com>';

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: EMAIL_USER && EMAIL_PASS ? {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      } : undefined,
    });
  }
  return transporter;
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, deviceName: string, offerAmount: number) => ({
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
        
        <p>Track your order status anytime at: <a href="${process.env.APP_URL || 'http://localhost:5000'}/track">Track Your Order</a></p>
        
        <p style="color: #666; font-size: 14px; margin-top: 40px;">
          Questions? Contact us at support@secondhandcell.com
        </p>
      </div>
    `,
  }),

  shippingLabelReady: (orderNumber: string, labelUrl: string) => ({
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
    `,
  }),

  deviceReceived: (orderNumber: string, deviceName: string) => ({
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
          Track your order: <a href="${process.env.APP_URL || 'http://localhost:5000'}/track">View Status</a>
        </p>
      </div>
    `,
  }),

  inspectionComplete: (orderNumber: string, finalOffer: number, matched: boolean) => ({
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
            <a href="${process.env.APP_URL || 'http://localhost:5000'}/account/orders" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Offer
            </a>
          </div>
        `}
      </div>
    `,
  }),

  paymentSent: (orderNumber: string, amount: number, method: string) => ({
    subject: `Payment Sent - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Payment Sent! 💰</h1>
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
    `,
  }),

  statusUpdate: (orderNumber: string, status: string, message: string) => ({
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
          <a href="${process.env.APP_URL || 'http://localhost:5000'}/account/orders/${orderNumber}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Order Details
          </a>
        </div>
      </div>
    `,
  }),
};

// Send email function with template object
export async function sendEmail(to: string, template: { subject: string; html: string }, attachments?: any[]) {
  try {
    const transporter = getTransporter();
    
    // In development, log instead of sending
    if (process.env.NODE_ENV === 'development' && !EMAIL_USER) {
      console.log('\n📧 EMAIL (DEV MODE - NOT SENT):');
      console.log('To:', to);
      console.log('Subject:', template.subject);
      console.log('HTML Preview:', template.html.substring(0, 200) + '...');
      if (attachments?.length) {
        console.log('Attachments:', attachments.length);
      }
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      attachments: attachments || [],
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
}

// Send email function with separate parameters (for custom emails)
export async function sendRawEmail(to: string, subject: string, text: string, html?: string, attachments?: any[]) {
  return sendEmail(to, { subject, html: html || text }, attachments);
}

// Convenience functions for common emails
export async function sendOrderConfirmation(email: string, orderNumber: string, deviceName: string, offerAmount: number) {
  return sendEmail(email, emailTemplates.orderConfirmation(orderNumber, deviceName, offerAmount));
}

export async function sendShippingLabel(email: string, orderNumber: string, labelUrl: string, labelPdf?: Buffer) {
  const attachments = labelPdf ? [{
    filename: `shipping-label-${orderNumber}.pdf`,
    content: labelPdf,
    contentType: 'application/pdf',
  }] : [];
  
  return sendEmail(email, emailTemplates.shippingLabelReady(orderNumber, labelUrl), attachments);
}

export async function sendDeviceReceived(email: string, orderNumber: string, deviceName: string) {
  return sendEmail(email, emailTemplates.deviceReceived(orderNumber, deviceName));
}

export async function sendInspectionComplete(email: string, orderNumber: string, finalOffer: number, matched: boolean = true) {
  return sendEmail(email, emailTemplates.inspectionComplete(orderNumber, finalOffer, matched));
}

export async function sendPaymentConfirmation(email: string, orderNumber: string, amount: number, method: string) {
  return sendEmail(email, emailTemplates.paymentSent(orderNumber, amount, method));
}

export async function sendStatusUpdate(email: string, orderNumber: string, status: string, message: string) {
  return sendEmail(email, emailTemplates.statusUpdate(orderNumber, status, message));
}

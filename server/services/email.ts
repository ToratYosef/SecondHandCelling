import { buildEmailLayout } from '../helpers/emailTemplates';

export async function sendOrderConfirmationEmail({ to, order, orderNumber, labelPdf, trackingNumber, trackingUrl, shippingAddress }: {
  to: string;
  order: any;
  orderNumber: string;
  labelPdf: Buffer | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingAddress: any;
}) {
  const trackingHtml = trackingNumber ? `
    <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
    ${trackingUrl ? `<p><a href="${trackingUrl}" style="color: #16a34a;">Track Your Package</a></p>` : ''}
  ` : '';

  const labelHtml = labelPdf ? `
    <p>Your shipping label is attached as a PDF. Please print and attach it to your package.</p>
  ` : `
    <p>Your shipping label will be available soon. We'll send you another email once it's ready.</p>
  `;

  const html = buildEmailLayout({
    title: `Order Confirmation: ${orderNumber}`,
    bodyHtml: `
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      ${trackingHtml}
      <p><strong>Shipping Address:</strong><br>
        ${shippingAddress?.contactName || ''}<br>
        ${shippingAddress?.street1 || ''} ${shippingAddress?.street2 || ''}<br>
        ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.postalCode || ''}<br>
        USA
      </p>
      ${labelHtml}
    `,
    accentColor: '#16a34a',
    includeTrustpilot: true,
  });

  const attachments = labelPdf ? [
    {
      filename: `ShippingLabel-${orderNumber}.pdf`,
      content: labelPdf,
      contentType: 'application/pdf',
    },
  ] : [];

  await sendEmail({
    to,
    subject: `Your SecondHandCell Order ${orderNumber}`,
    html,
    attachments,
  });
}
import nodemailer from 'nodemailer';

// Email transporter singleton
let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
}

export interface MailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(mailOptions: MailOptions): Promise<void> {
  try {
    const transporter = getEmailTransporter();
    const defaultFrom = process.env.EMAIL_FROM || `SecondHandCell <${process.env.EMAIL_USER}>`;
    
    await transporter.sendMail({
      from: mailOptions.from || defaultFrom,
      ...mailOptions,
    });
    console.log('Email sent successfully to:', mailOptions.to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

# Email Setup Guide

The application uses Nodemailer to send transactional emails to customers for order confirmations, shipping labels, status updates, and payment notifications.

## Email Configuration

### Environment Variables

Add these to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SecondHandCell <noreply@secondhandcell.com>
APP_URL=http://localhost:5000
```

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. **Update `.env`:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=yourname@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### SendGrid (Recommended for Production)

1. **Sign up** at [SendGrid](https://sendgrid.com/)
2. **Create API Key:** Settings → API Keys → Create API Key
3. **Update `.env`:**
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=SG.your_api_key_here
   EMAIL_FROM=Your Name <noreply@yourdomain.com>
   ```

### Other SMTP Providers

- **AWS SES**: `email-smtp.us-east-1.amazonaws.com:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Postmark**: `smtp.postmarkapp.com:587`

## Email Types

The system automatically sends emails for:

### 1. Order Confirmation
- **Trigger:** When order is created
- **Includes:** Order number, device details, offer amount, next steps

### 2. Shipping Label Ready
- **Trigger:** Admin generates shipping label
- **Includes:** Label download link, shipping instructions
- **Attachment:** PDF shipping label (if available)

### 3. Device Received
- **Trigger:** Order status changes to `received`
- **Includes:** Confirmation of receipt, inspection timeline

### 4. Inspection Complete
- **Trigger:** Order status changes to `payout_pending` or `reoffer_pending`
- **Includes:** 
  - If matched: Final offer confirmation, payment timeline
  - If not matched: Revised offer, action required link

### 5. Payment Sent
- **Trigger:** Order status changes to `completed` with payout sent
- **Includes:** Payment amount, method, expected arrival time

### 6. Status Updates
- **Trigger:** Manual status updates from admin
- **Includes:** Custom message about order status

## Development Mode

If `EMAIL_USER` and `EMAIL_PASS` are not set in development, emails will be logged to the console instead of being sent:

```
📧 EMAIL (DEV MODE - NOT SENT):
To: customer@example.com
Subject: Order Confirmation - SHC-S-123456
HTML Preview: <div style="font-family: Arial...
```

## Testing

### Test Email Sending

```javascript
// In server/routes.ts or a test file
import { sendOrderConfirmation } from './email';

await sendOrderConfirmation(
  'test@example.com',
  'SHC-S-123456',
  'iPhone 13 Pro',
  450.00
);
```

### Check Email Logs

Monitor the server console for email send confirmations:
```
✅ Email sent: <message-id@server>
```

Or errors:
```
❌ Email error: [error details]
```

## Customizing Email Templates

Email templates are in `server/email.ts`. Each template function returns:

```typescript
{
  subject: string;
  html: string;
}
```

### Example: Modify Order Confirmation

```typescript
export const emailTemplates = {
  orderConfirmation: (orderNumber, deviceName, offerAmount) => ({
    subject: `✅ Your order ${orderNumber} is confirmed!`,
    html: `
      <div style="...">
        <!-- Your custom HTML here -->
      </div>
    `,
  }),
  // ... other templates
};
```

## Adding New Email Types

1. **Create template in `server/email.ts`:**
```typescript
export const emailTemplates = {
  // ... existing templates
  customNotification: (param1: string, param2: number) => ({
    subject: `Custom Subject - ${param1}`,
    html: `<div>Your HTML with ${param2}</div>`,
  }),
};
```

2. **Create convenience function:**
```typescript
export async function sendCustomNotification(email: string, param1: string, param2: number) {
  return sendEmail(email, emailTemplates.customNotification(param1, param2));
}
```

3. **Use in routes:**
```typescript
import { sendCustomNotification } from './email';

// In your route handler
await sendCustomNotification(customerEmail, 'value1', 100);
```

## Email Best Practices

1. **Include Order Number:** Always reference the order number
2. **Clear CTAs:** Use prominent buttons for required actions
3. **Mobile-Friendly:** Use simple layouts that work on all devices
4. **Unsubscribe Link:** Include for marketing emails (not required for transactional)
5. **Plain Text Alternative:** Consider adding `text` field for email clients that don't support HTML

## Troubleshooting

### Emails Not Sending

1. **Check environment variables are set**
2. **Verify SMTP credentials**
3. **Check firewall/network allows outbound SMTP**
4. **Review server console for error messages**
5. **Test with a simple send:**
   ```bash
   curl -X POST http://localhost:5000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com"}'
   ```

### Gmail "Less Secure Apps" Error

Gmail no longer supports "less secure apps". You MUST use an App Password with 2FA enabled.

### Rate Limiting

Most SMTP providers have rate limits:
- **Gmail:** ~500 emails/day
- **SendGrid Free:** 100 emails/day
- **Production:** Use a paid plan with higher limits

## Production Checklist

- [ ] Use a dedicated email service (SendGrid, AWS SES, Mailgun)
- [ ] Set up proper domain authentication (SPF, DKIM, DMARC)
- [ ] Use a custom domain for sender email
- [ ] Monitor email delivery rates
- [ ] Set up bounce and complaint handling
- [ ] Enable email analytics/tracking if needed
- [ ] Test all email templates thoroughly
- [ ] Set up email queue for high volume (optional)

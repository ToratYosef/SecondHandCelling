# API Integration Guide

## ShipEngine & PhoneCheck Integration

This application integrates with ShipEngine for shipping label generation and PhoneCheck for IMEI validation.

## Environment Configuration

Copy the provided credentials to your `.env` file:

```env
# Email
EMAIL_USER=sales@secondhandcell.com
EMAIL_PASS="pvqk evbh nzvs bbkf"

# ShipEngine (Shipping Labels)
SHIPENGINE_KEY=Q7cyM4/5AR2F089lka6UZoGusShNsF7qWUws6pqYzdw
SHIPENGINE_KEY_TEST=TEST_iJPMlpSPT8POEAyoWfBdWogjv6uf8qjtN71VIMdzQM0
SHIPENGINE_FROM_NAME=SHC
SHIPENGINE_FROM_COMPANY=SecondHandCell
SHIPENGINE_FROM_ADDRESS1=1206 McDonald Ave
SHIPENGINE_FROM_ADDRESS2=Ste Rear
SHIPENGINE_FROM_CITY=Brooklyn
SHIPENGINE_FROM_STATE=NY
SHIPENGINE_FROM_POSTAL=11230
SHIPENGINE_FROM_PHONE=2015551234

# PhoneCheck (IMEI Validation)
IMEI_API=308b6790-b767-4b43-9065-2c00e13cdbf7
IMEI_USERNAME=aecells1
IMEI_BASE_URL=https://clientapiv2.phonecheck.com

# Frontend URL
APP_FRONTEND_URL=https://buyback-a0f05.web.app

# Stripe (if needed)
STRIPE_SECRET_KEY="sk_test_51RZEPeCMmspEQNuYocbevinHQf6Npcuwnq9wVKh667n4IucBHUZWPeAeBVYcRKZjutgHp1Gpy5uJ5oac9rmILnU700AaQSRTdJ"
STRIPE_PUBLISHABLE_KEY="pk_test_51RZEPeCMmspEQNuYXLdVBGpSSPewOBaH5d4eSIwrSDBeEsW9pBh7WAyDwFn8IzNyrYIY2SuV3pDXiNTmvJnr7YpC00JPzJh1lP"
```

---

## ShipEngine Integration

### Features

- **Automated Label Generation**: Creates USPS shipping labels
- **USPS Ground Advantage**: Default carrier service (Hazmat compatible)
- **Email Delivery**: Labels automatically sent to customers
- **Tracking Integration**: Real-time shipment tracking
- **Label Management**: Void and regenerate labels

### API Endpoints

#### Generate Shipping Label
```http
POST /api/admin/orders/:id/shipment
Authorization: Admin required
```

**Response:**
```json
{
  "id": "shipment-id",
  "trackingNumber": "9400111899562941186490",
  "labelUrl": "https://api.shipengine.com/v1/downloads/...",
  "labelPdfUrl": "https://api.shipengine.com/v1/downloads/...pdf",
  "cost": 4.50,
  "carrier": "usps",
  "serviceCode": "usps_ground_advantage"
}
```

#### Void Shipping Label
```http
POST /api/admin/orders/:id/shipment/void
Authorization: Admin required
```

#### Track Shipment
```http
POST /api/admin/orders/:id/shipment/refresh
Authorization: Admin required
```

**Response:**
```json
{
  "status": "In Transit",
  "trackingInfo": {
    "status_description": "Your package is in transit",
    "events": [...]
  }
}
```

### Label Configuration

The system uses:
- **Carrier**: USPS
- **Service**: Ground Advantage (supports Hazmat)
- **Label Format**: PDF (4x6 inches)
- **Default Weight**: 16 oz (1 lb) for phones
- **Dimensions**: 8" × 6" × 4"

### Testing

Use `SHIPENGINE_KEY_TEST` for test labels that don't actually ship.

---

## PhoneCheck API Integration

### Features

- **IMEI Validation**: Verify IMEI format using Luhn algorithm
- **Device Information**: Get make, model, storage from IMEI
- **Blacklist Check**: Check if device is reported lost/stolen
- **iCloud/FMI Status**: Detect activation lock status
- **Battery Health**: Get battery capacity percentage
- **Carrier Information**: Identify original carrier

### API Endpoints

#### Check IMEI
```http
POST /api/imei/check
Content-Type: application/json

{
  "imei": "123456789012345"
}
```

**Response:**
```json
{
  "imei": "123456789012345",
  "make": "Apple",
  "model": "iPhone 13 Pro",
  "carrier": "Verizon",
  "isBlacklisted": false,
  "icloudStatus": "OFF",
  "batteryHealth": 87,
  "storageCapacity": 256,
  "rawData": {...}
}
```

#### Get Device Info from IMEI
```http
GET /api/imei/:imei/device
```

**Response:**
```json
{
  "make": "Apple",
  "model": "iPhone 13 Pro",
  "storage": 256
}
```

### IMEI Validation

The system validates IMEI using:
1. **Format Check**: Must be exactly 15 digits
2. **Luhn Algorithm**: Checksum validation
3. **API Verification**: PhoneCheck API confirmation

### Error Handling

If PhoneCheck credentials are not configured, the system returns mock data in development mode:

```json
{
  "imei": "123456789012345",
  "make": "Apple",
  "model": "iPhone",
  "carrier": "Unknown",
  "isBlacklisted": false,
  "icloudStatus": "UNKNOWN",
  "rawData": { "mock": true }
}
```

---

## Email Integration

Emails are automatically sent when:

1. **Shipping Label Generated** → Customer receives label via email
2. **Device Received** → Confirmation email sent
3. **Inspection Complete** → Results emailed
4. **Payment Sent** → Payment confirmation

All emails use templates in `server/email.ts` with professional HTML formatting.

---

## Usage Examples

### Frontend: Check IMEI Before Quote

```typescript
const checkIMEI = async (imei: string) => {
  const response = await fetch('/api/imei/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imei }),
  });
  
  const result = await response.json();
  
  if (result.isBlacklisted) {
    alert('Device is blacklisted - cannot accept');
    return false;
  }
  
  if (result.icloudStatus === 'ON') {
    alert('Please disable Find My iPhone before selling');
    return false;
  }
  
  return true;
};
```

### Admin: Generate Label

```typescript
const generateLabel = async (orderId: string) => {
  const response = await fetch(`/api/admin/orders/${orderId}/shipment`, {
    method: 'POST',
    credentials: 'include',
  });
  
  const shipment = await response.json();
  
  console.log('Label URL:', shipment.labelUrl);
  console.log('Tracking:', shipment.trackingNumber);
  
  // Label is automatically emailed to customer
};
```

### Admin: Track Package

```typescript
const refreshTracking = async (orderId: string) => {
  const response = await fetch(`/api/admin/orders/${orderId}/shipment/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  
  const { status, trackingInfo } = await response.json();
  console.log('Current Status:', status);
};
```

---

## Testing Checklist

### ShipEngine
- [ ] Generate test label with TEST API key
- [ ] Verify label PDF downloads correctly
- [ ] Check email delivery of shipping label
- [ ] Test tracking status updates
- [ ] Void a label and verify it's cancelled

### PhoneCheck
- [ ] Validate correct IMEI (15 digits, passes Luhn)
- [ ] Reject invalid IMEI format
- [ ] Check blacklisted device detection
- [ ] Verify iCloud status detection
- [ ] Test device info extraction

### Email
- [ ] Order confirmation sends
- [ ] Shipping label email includes PDF attachment
- [ ] Status update emails trigger correctly
- [ ] Payment confirmation sends

---

## Production Considerations

### ShipEngine
- Use production API key (remove TEST_ prefix)
- Monitor label costs and usage
- Set up webhook for tracking updates
- Enable address validation
- Consider insurance for high-value items

### PhoneCheck
- Monitor API usage and limits
- Cache IMEI lookups to reduce API calls
- Handle API downtime gracefully
- Set up alerts for blacklisted devices

### Security
- Never expose API keys in frontend code
- Validate all inputs server-side
- Rate limit IMEI checks to prevent abuse
- Log all label generations for audit trail

---

## Support & Documentation

- **ShipEngine Docs**: https://www.shipengine.com/docs/
- **PhoneCheck API**: Contact support@phonecheck.com
- **Email Setup**: See `EMAIL_SETUP.md`

## Troubleshooting

### ShipEngine Errors

**"Invalid address"**
- Verify all address fields are complete
- Check state abbreviation is 2 letters
- Ensure postal code is valid

**"Carrier service unavailable"**
- Try different service code
- Check ShipEngine service status
- Verify API key has correct permissions

### PhoneCheck Errors

**"Invalid IMEI"**
- Clean IMEI (remove spaces/dashes)
- Verify 15 digit format
- Check Luhn algorithm validation

**"API timeout"**
- PhoneCheck API may be slow
- Implement retry logic
- Show loading state to user

### Email Not Sending

**Check logs for:**
- SMTP authentication errors
- Invalid email addresses
- Network/firewall blocking port 587

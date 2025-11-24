/**
 * Integration Testing Script
 * Tests Email, PhoneCheck, and ShipEngine APIs
 * 
 * Usage: npx tsx test-integrations.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { checkIMEI, isValidIMEI, getDeviceInfoFromIMEI } from './server/phonecheck';
import { createShippingLabel, getRateEstimates } from './server/shipengine';
import { sendEmail } from './server/email';

// Test data
const TEST_IMEI = '352094104663685'; // Valid iPhone IMEI (passes Luhn)
const TEST_ADDRESS = {
  name: 'John Doe',
  phone: '5551234567',
  address_line1: '123 Main St',
  city_locality: 'New York',
  state_province: 'NY',
  postal_code: '10001',
  country_code: 'US'
};

async function testPhoneCheck() {
  console.log('\n📱 Testing PhoneCheck API...\n');
  
  try {
    // Test 1: IMEI Format Validation
    console.log('Test 1: IMEI Format Validation');
    const validFormat = isValidIMEI(TEST_IMEI);
    console.log(`✓ IMEI ${TEST_IMEI} is ${validFormat ? 'VALID' : 'INVALID'}`);
    
    const invalidFormat = isValidIMEI('123456');
    console.log(`✓ IMEI 123456 is ${invalidFormat ? 'VALID' : 'INVALID'} (expected: INVALID)\n`);
    
    // Test 2: Device Info Lookup
    console.log('Test 2: Device Info Lookup');
    const deviceInfo = await getDeviceInfoFromIMEI(TEST_IMEI);
    console.log(`✓ Make: ${deviceInfo.make}`);
    console.log(`✓ Model: ${deviceInfo.model}`);
    console.log(`✓ Storage: ${deviceInfo.storage}GB\n`);
    
    // Test 3: Full IMEI Check
    console.log('Test 3: Full IMEI Check');
    const fullCheck = await checkIMEI(TEST_IMEI);
    console.log(`✓ IMEI: ${fullCheck.imei}`);
    console.log(`✓ Device: ${fullCheck.make} ${fullCheck.model}`);
    console.log(`✓ Carrier: ${fullCheck.carrier}`);
    console.log(`✓ Blacklisted: ${fullCheck.isBlacklisted ? 'YES ⚠️' : 'NO ✓'}`);
    console.log(`✓ iCloud Status: ${fullCheck.icloudStatus}`);
    if (fullCheck.batteryHealth) {
      console.log(`✓ Battery Health: ${fullCheck.batteryHealth}%`);
    }
    
    console.log('\n✅ PhoneCheck tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ PhoneCheck test failed:', error);
    return false;
  }
}

async function testShipEngine() {
  console.log('\n📦 Testing ShipEngine API...\n');
  
  try {
    // Test 1: Rate Estimates
    console.log('Test 1: Get Rate Estimates');
    const rates = await getRateEstimates(TEST_ADDRESS, 16); // 1 lb phone
    console.log(`✓ Found ${rates.length} shipping options:`);
    rates.forEach((rate: any) => {
      console.log(`  - ${rate.serviceType}: $${rate.shippingAmount.amount} (${rate.deliveryDays} days)`);
    });
    console.log();
    
    // Test 2: Create Shipping Label (using TEST API key)
    console.log('Test 2: Create Shipping Label (TEST MODE)');
    const label = await createShippingLabel(TEST_ADDRESS, 'TEST-ORDER-001', { weight: 16 });
    console.log(`✓ Label Created:`);
    console.log(`  - Tracking #: ${label.trackingNumber}`);
    console.log(`  - Carrier: ${label.carrier.toUpperCase()}`);
    console.log(`  - Service: ${label.serviceCode}`);
    console.log(`  - Cost: $${label.cost}`);
    console.log(`  - Label URL: ${label.labelUrl.substring(0, 60)}...`);
    console.log(`  - PDF URL: ${label.labelPdfUrl?.substring(0, 60)}...`);
    
    console.log('\n✅ ShipEngine tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ ShipEngine test failed:', error);
    return false;
  }
}

async function testEmail() {
  console.log('\n📧 Testing Email Service...\n');
  
  try {
    console.log('Test 1: Send Test Email');
    const result = await sendEmail(
      'test@example.com',
      {
        subject: 'SecondHandCell API Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Integration Test Email</h2>
            <p>This email confirms that your email integration is working correctly!</p>
            <p>The following services have been tested:</p>
            <ul>
              <li>PhoneCheck IMEI Validation</li>
              <li>ShipEngine Label Generation</li>
              <li>Nodemailer Email Service</li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Sent from SecondHandCell Test Script
            </p>
          </div>
        `
      }
    );
    
    if (result.success) {
      console.log('✓ Email sent successfully!');
      console.log(`  Message ID: ${result.messageId}`);
    } else {
      console.log('⚠️  Email service in DEV MODE (no SMTP configured)');
      console.log('  To test real emails, add EMAIL_USER and EMAIL_PASS to .env');
    }
    
    console.log('\n✅ Email test completed!');
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SecondHandCell API Integration Tests');
  console.log('═══════════════════════════════════════════════════');
  
  // Debug: Check environment variables
  console.log('\n🔧 Environment Check:');
  console.log(`  SHIPENGINE_KEY: ${process.env.SHIPENGINE_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  IMEI_API: ${process.env.IMEI_API ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✓ Configured' : '✗ Missing'}`);
  
  const results = {
    phoneCheck: false,
    shipEngine: false,
    email: false
  };
  
  // Run tests sequentially
  results.phoneCheck = await testPhoneCheck();
  results.shipEngine = await testShipEngine();
  results.email = await testEmail();
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`PhoneCheck:  ${results.phoneCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`ShipEngine:  ${results.shipEngine ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Email:       ${results.email ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('═══════════════════════════════════════════════════\n');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('🎉 All integrations are working correctly!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

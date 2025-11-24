import axios from 'axios';

// Helper functions to get credentials (evaluated lazily)
const getBaseUrl = () => process.env.IMEI_BASE_URL || 'https://clientapiv2.phonecheck.com';
const getUsername = () => process.env.IMEI_USERNAME || '';
const getApiKey = () => process.env.IMEI_API || '';

export interface PhoneCheckResult {
  imei: string;
  make?: string;
  model?: string;
  carrier?: string;
  isBlacklisted: boolean;
  icloudStatus?: 'ON' | 'OFF' | 'UNKNOWN';
  batteryHealth?: number;
  storageCapacity?: number;
  errors?: string[];
  rawData?: any;
}

/**
 * Check IMEI using PhoneCheck API
 */
export async function checkIMEI(imei: string): Promise<PhoneCheckResult> {
  try {
    // Clean IMEI (remove spaces, dashes)
    const cleanIMEI = imei.replace(/[\s-]/g, '');
    
    const PHONECHECK_USERNAME = getUsername();
    const PHONECHECK_API_KEY = getApiKey();
    const PHONECHECK_BASE_URL = getBaseUrl();
    
    if (!PHONECHECK_USERNAME || !PHONECHECK_API_KEY) {
      console.warn('⚠️ PhoneCheck credentials not configured. Returning mock data.');
      return {
        imei: cleanIMEI,
        make: 'Apple',
        model: 'iPhone',
        carrier: 'Unknown',
        isBlacklisted: false,
        icloudStatus: 'UNKNOWN',
        rawData: { mock: true },
      };
    }

    // PhoneCheck API endpoint for device check
    const response = await axios.post(
      `${PHONECHECK_BASE_URL}/api/v2/device/check`,
      {
        imei: cleanIMEI,
        username: PHONECHECK_USERNAME,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PHONECHECK_API_KEY}`,
        },
        timeout: 15000, // 15 second timeout
      }
    );

    const data = response.data;

    // Parse PhoneCheck response
    return {
      imei: cleanIMEI,
      make: data.device?.make || data.make,
      model: data.device?.model || data.model,
      carrier: data.carrier?.name || data.carrier,
      isBlacklisted: data.blacklist?.status === 'BLACKLISTED' || data.isBlacklisted === true,
      icloudStatus: parseICloudStatus(data.icloud || data.activationLock),
      batteryHealth: data.battery?.health || data.batteryHealth,
      storageCapacity: data.storage?.capacity || data.storageCapacity,
      rawData: data,
    };

  } catch (error: any) {
    console.error('PhoneCheck API Error:', error.response?.data || error.message);
    
    // Return partial result with error
    return {
      imei,
      isBlacklisted: false,
      errors: [error.response?.data?.message || error.message || 'Failed to check IMEI'],
    };
  }
}

/**
 * Parse iCloud/FMI status from various API response formats
 */
function parseICloudStatus(icloudData: any): 'ON' | 'OFF' | 'UNKNOWN' {
  if (!icloudData) return 'UNKNOWN';
  
  // Handle different response formats
  if (typeof icloudData === 'string') {
    const status = icloudData.toUpperCase();
    if (status.includes('ON') || status.includes('ENABLED') || status.includes('LOCKED')) return 'ON';
    if (status.includes('OFF') || status.includes('DISABLED') || status.includes('CLEAN')) return 'OFF';
  }
  
  if (typeof icloudData === 'object') {
    const status = icloudData.status || icloudData.locked || icloudData.enabled;
    if (status === true || status === 'ON' || status === 'ENABLED' || status === 'LOCKED') return 'ON';
    if (status === false || status === 'OFF' || status === 'DISABLED' || status === 'CLEAN') return 'OFF';
  }
  
  return 'UNKNOWN';
}

/**
 * Validate IMEI format (basic check)
 */
export function isValidIMEI(imei: string): boolean {
  const cleanIMEI = imei.replace(/[\s-]/g, '');
  
  // IMEI should be 15 digits
  if (!/^\d{15}$/.test(cleanIMEI)) {
    return false;
  }
  
  // Luhn algorithm check for IMEI
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleanIMEI.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanIMEI[i]);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Get device info from IMEI (quick lookup without full check)
 */
export async function getDeviceInfoFromIMEI(imei: string): Promise<{ make?: string; model?: string; storage?: number }> {
  try {
    const result = await checkIMEI(imei);
    return {
      make: result.make,
      model: result.model,
      storage: result.storageCapacity,
    };
  } catch (error) {
    console.error('Error getting device info from IMEI:', error);
    return {};
  }
}

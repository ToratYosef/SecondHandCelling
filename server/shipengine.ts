import axios from 'axios';

// Helper to get API key (evaluated lazily)
const getApiKey = () => process.env.SHIPENGINE_KEY || process.env.SHIPENGINE_KEY_TEST || '';
const SHIPENGINE_BASE_URL = 'https://api.shipengine.com/v1';

// Company shipping address from environment
const FROM_ADDRESS = {
  name: process.env.SHIPENGINE_FROM_NAME || 'SHC',
  company: process.env.SHIPENGINE_FROM_COMPANY || 'SecondHandCell',
  address_line1: process.env.SHIPENGINE_FROM_ADDRESS1 || '1206 McDonald Ave',
  address_line2: process.env.SHIPENGINE_FROM_ADDRESS2 || 'Ste Rear',
  city_locality: process.env.SHIPENGINE_FROM_CITY || 'Brooklyn',
  state_province: process.env.SHIPENGINE_FROM_STATE || 'NY',
  postal_code: process.env.SHIPENGINE_FROM_POSTAL || '11230',
  country_code: 'US',
  phone: process.env.SHIPENGINE_FROM_PHONE || '2015551234',
};

export interface ShippingAddress {
  name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city_locality: string;
  state_province: string;
  postal_code: string;
  country_code?: string;
  phone?: string;
  email?: string;
}

export interface ShippingLabelResponse {
  labelId: string;
  trackingNumber: string;
  labelUrl: string;
  labelPdfUrl?: string;
  labelDownload?: {
    pdf?: string;
    png?: string;
    zpl?: string;
  };
  cost: number;
  carrier: string;
  serviceCode: string;
  packageCode: string;
  shipDate: string;
  rawResponse?: any;
}

/**
 * Create a shipping label using ShipEngine
 */
export async function createShippingLabel(
  toAddress: ShippingAddress,
  orderNumber: string,
  options?: {
    weight?: number; // in ounces (default: 16 oz = 1 lb)
    carrier?: string;
    serviceCode?: string;
  }
): Promise<ShippingLabelResponse> {
  try {
    const SHIPENGINE_API_KEY = getApiKey();
    if (!SHIPENGINE_API_KEY) {
      throw new Error('ShipEngine API key not configured');
    }

    // Default to USPS Ground Advantage (formerly First Class Package)
    const carrier = options?.carrier || 'usps';
    const serviceCode = options?.serviceCode || 'usps_ground_advantage';
    const weight = options?.weight || 16; // Default 1 lb

    // Create label request
    const labelRequest = {
      shipment: {
        service_code: serviceCode,
        ship_to: {
          ...toAddress,
          country_code: toAddress.country_code || 'US',
        },
        ship_from: FROM_ADDRESS,
        packages: [
          {
            weight: {
              value: weight,
              unit: 'ounce',
            },
            dimensions: {
              unit: 'inch',
              length: 8,
              width: 6,
              height: 4,
            },
            package_code: 'package', // Standard package
            label_messages: {
              reference1: orderNumber,
            },
          },
        ],
      },
      label_format: 'pdf',
      label_layout: '4x6',
      test_label: SHIPENGINE_API_KEY.includes('TEST'), // Use test mode if test key
    };

    const response = await axios.post(
      `${SHIPENGINE_BASE_URL}/labels`,
      labelRequest,
      {
        headers: {
          'API-Key': SHIPENGINE_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const data = response.data;
    
    console.log('[ShipEngine] Response data:', JSON.stringify({
      label_id: data.label_id,
      tracking_number: data.tracking_number,
      label_download: data.label_download,
      label_download_url: data.label_download_url,
    }, null, 2));

    return {
      labelId: data.label_id,
      trackingNumber: data.tracking_number,
      labelUrl: data.label_download?.href || data.label_download_url || data.label_url,
      labelPdfUrl: data.label_download?.href || data.label_url,
      labelDownload: data.label_download,
      cost: data.shipment_cost?.amount || 0,
      carrier: data.carrier_id || carrier,
      serviceCode: data.service_code || serviceCode,
      packageCode: data.package_code || 'package',
      shipDate: data.ship_date || new Date().toISOString(),
      rawResponse: data,
    };

  } catch (error: any) {
    console.error('ShipEngine API Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errors?.[0]?.message || 
      error.response?.data?.message || 
      'Failed to create shipping label'
    );
  }
}

/**
 * Get carrier services (for displaying shipping options)
 */
export async function getCarrierServices(carrierCode: string = 'usps') {
  try {
    const SHIPENGINE_API_KEY = getApiKey();
    if (!SHIPENGINE_API_KEY) {
      return [];
    }

    const response = await axios.get(
      `${SHIPENGINE_BASE_URL}/carriers/${carrierCode}/services`,
      {
        headers: {
          'API-Key': SHIPENGINE_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching carrier services:', error);
    return [];
  }
}

/**
 * Track a shipment by tracking number
 */
export async function trackShipment(carrierCode: string, trackingNumber: string) {
  try {
    const SHIPENGINE_API_KEY = getApiKey();
    if (!SHIPENGINE_API_KEY) {
      throw new Error('ShipEngine API key not configured');
    }

    const response = await axios.get(
      `${SHIPENGINE_BASE_URL}/tracking`,
      {
        params: {
          carrier_code: carrierCode,
          tracking_number: trackingNumber,
        },
        headers: {
          'API-Key': SHIPENGINE_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Tracking Error:', error.response?.data || error.message);
    throw new Error('Failed to track shipment');
  }
}

/**
 * Void a shipping label
 */
export async function voidLabel(labelId: string) {
  try {
    const SHIPENGINE_API_KEY = getApiKey();
    if (!SHIPENGINE_API_KEY) {
      throw new Error('ShipEngine API key not configured');
    }

    const response = await axios.put(
      `${SHIPENGINE_BASE_URL}/labels/${labelId}/void`,
      {},
      {
        headers: {
          'API-Key': SHIPENGINE_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Void Label Error:', error.response?.data || error.message);
    throw new Error('Failed to void label');
  }
}

/**
 * Get rate estimates for a shipment
 */
export async function getRateEstimates(
  toAddress: ShippingAddress,
  weight: number = 16
) {
  try {
    const SHIPENGINE_API_KEY = getApiKey();
    if (!SHIPENGINE_API_KEY) {
      throw new Error('ShipEngine API key not configured');
    }

    const response = await axios.post(
      `${SHIPENGINE_BASE_URL}/rates`,
      {
        rate_options: {
          carrier_ids: [], // Get rates from all carriers
        },
        shipment: {
          ship_to: {
            ...toAddress,
            country_code: toAddress.country_code || 'US',
          },
          ship_from: FROM_ADDRESS,
          packages: [
            {
              weight: {
                value: weight,
                unit: 'ounce',
              },
            },
          ],
        },
      },
      {
        headers: {
          'API-Key': SHIPENGINE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.rate_response?.rates || [];
  } catch (error: any) {
    console.error('Rate Estimate Error:', error.response?.data || error.message);
    return [];
  }
}

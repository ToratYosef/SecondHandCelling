import axios from 'axios';

interface ShipToAddress {
  name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city_locality: string;
  state_province: string;
  postal_code: string;
  country_code: string;
}

interface Package {
  weight: {
    value: number;
    unit: 'ounce' | 'pound' | 'gram' | 'kilogram';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'inch' | 'centimeter';
  };
}

interface CreateLabelRequest {
  shipment: {
    service_code: string;
    ship_to: ShipToAddress;
    ship_from: ShipToAddress;
    packages: Package[];
  };
  test_label?: boolean;
}

interface CreateLabelResponse {
  label_id: string;
  status: string;
  shipment_id: string;
  ship_date: string;
  created_at: string;
  shipment_cost: {
    currency: string;
    amount: number;
  };
  insurance_cost: {
    currency: string;
    amount: number;
  };
  tracking_number: string;
  is_return_label: boolean;
  rma_number: string | null;
  is_international: boolean;
  batch_id: string;
  carrier_id: string;
  service_code: string;
  package_code: string;
  voided: boolean;
  voided_at: string | null;
  label_format: string;
  display_scheme: string;
  label_layout: string;
  trackable: boolean;
  label_image_id: string | null;
  carrier_code: string;
  tracking_status: string;
  label_download: {
    pdf?: string;
    png?: string;
    zpl?: string;
    href: string;
  };
  form_download: string | null;
  insurance_claim: string | null;
  packages: Array<{
    package_id: number;
    package_code: string;
    weight: {
      value: number;
      unit: string;
    };
    dimensions: {
      unit: string;
      length: number;
      width: number;
      height: number;
    };
    insured_value: {
      currency: string;
      amount: number;
    };
    tracking_number: string;
    label_messages: {
      reference1: string | null;
      reference2: string | null;
      reference3: string | null;
    };
    external_package_id: string | null;
    sequence: number;
  }>;
}

export class ShipEngineService {
  private apiKey: string;
  private baseUrl = 'https://api.shipengine.com/v1';
  private testMode: boolean;

  constructor() {
    // Use test key if available, otherwise production key
    this.apiKey = process.env.SHIPENGINE_KEY_TEST || process.env.SHIPENGINE_KEY || '';
    this.testMode = !!process.env.SHIPENGINE_KEY_TEST;
    
    if (!this.apiKey) {
      throw new Error('ShipEngine API key not configured');
    }
  }

  /**
   * Create a shipping label
   * For buyback: shipFrom = customer address, shipTo = company address (from env vars)
   */
  async createLabel(params: {
    shipFrom: {
      name: string;
      phone: string;
      street1: string;
      street2?: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
    };
    serviceCode?: string;
    weight?: number;
  }): Promise<CreateLabelResponse> {
    try {
      console.log('[ShipEngine] createLabel called with params:', JSON.stringify(params, null, 2));

      // Normalize state to 2-letter abbreviation
      const normalizeState = (state: string): string => {
        const stateMap: { [key: string]: string } = {
          'new york': 'NY',
          'california': 'CA',
          'texas': 'TX',
          'florida': 'FL',
          'illinois': 'IL',
          'pennsylvania': 'PA',
          'ohio': 'OH',
          'georgia': 'GA',
          'north carolina': 'NC',
          'michigan': 'MI',
        };
        const lower = state.toLowerCase().trim();
        return stateMap[lower] || state.toUpperCase().substring(0, 2);
      };

      // Build ship_to address (your company - receiving the device)
      const shipTo: ShipToAddress = {
        name: process.env.SHIPENGINE_FROM_NAME || 'SHC',
        phone: process.env.SHIPENGINE_FROM_PHONE || '2015551234',
        address_line1: process.env.SHIPENGINE_FROM_ADDRESS1 || '1206 McDonald Ave',
        address_line2: process.env.SHIPENGINE_FROM_ADDRESS2 || 'Ste Rear',
        city_locality: process.env.SHIPENGINE_FROM_CITY || 'Brooklyn',
        state_province: process.env.SHIPENGINE_FROM_STATE || 'NY',
        postal_code: process.env.SHIPENGINE_FROM_POSTAL || '11230',
        country_code: 'US',
      };

      // Build ship_from address (customer - sending the device)
      const shipFrom: ShipToAddress = {
        name: params.shipFrom.name || 'Customer',
        phone: params.shipFrom.phone || '0000000000',
        address_line1: params.shipFrom.street1 || '',
        address_line2: params.shipFrom.street2 || undefined,
        city_locality: params.shipFrom.city || '',
        state_province: normalizeState(params.shipFrom.state || 'NY'),
        postal_code: params.shipFrom.postalCode || '',
        country_code: params.shipFrom.country || 'US',
      };

      console.log('[ShipEngine] Built ship_from:', JSON.stringify(shipFrom, null, 2));
      console.log('[ShipEngine] Built ship_to:', JSON.stringify(shipTo, null, 2));

      // Default package weight (can be customized)
      const packageWeight = params.weight || 8; // default 8 oz for phones

      const requestBody: CreateLabelRequest = {
        shipment: {
          service_code: params.serviceCode || 'usps_priority_mail',
          ship_to: shipTo,
          ship_from: shipFrom,
          packages: [
            {
              weight: {
                value: packageWeight,
                unit: 'ounce',
              },
            },
          ],
        },
        test_label: this.testMode,
        // Prefer PDF format when available
        // @ts-ignore
        label_format: 'pdf',
      };

      console.log('[ShipEngine] Creating label with request:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post<CreateLabelResponse>(
        `${this.baseUrl}/labels`,
        requestBody,
        {
          headers: {
            'API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[ShipEngine] Label created successfully:', {
        label_id: response.data.label_id,
        tracking_number: response.data.tracking_number,
        pdf_url: response.data.label_download?.pdf,
        href: response.data.label_download?.href,
      });

      return response.data;
    } catch (error: any) {
      console.error('[ShipEngine] Error creating label:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        errors: error.response?.data?.errors,
      });
      
      // Log detailed error information if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any, idx: number) => {
          console.error(`[ShipEngine] Error ${idx + 1}:`, err);
        });
      }
      
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message;
      throw new Error(`ShipEngine API error: ${errorMsg}`);
    }
  }

  /**
   * Download label PDF from ShipEngine URL
   */
  async downloadLabelPdf(pdfUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        headers: {
          'API-Key': this.apiKey,
        },
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('[ShipEngine] Error downloading label PDF:', error.message);
      throw new Error(`Failed to download label PDF: ${error.message}`);
    }
  }

  /**
   * Void a shipping label
   */
  async voidLabel(labelId: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/labels/${labelId}/void`,
        {},
        {
          headers: {
            'API-Key': this.apiKey,
          },
        }
      );

      console.log(`[ShipEngine] Label ${labelId} voided successfully`);
    } catch (error: any) {
      console.error('[ShipEngine] Error voiding label:', error.message);
      throw new Error(`Failed to void label: ${error.message}`);
    }
  }
}

export const shipEngineService = new ShipEngineService();

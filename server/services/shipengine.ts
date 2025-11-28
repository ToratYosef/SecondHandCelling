import axios from 'axios';

interface ShipToAddress {
  name: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  cityLocality: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
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
        addressLine1: process.env.SHIPENGINE_FROM_ADDRESS1 || '1206 McDonald Ave',
        addressLine2: process.env.SHIPENGINE_FROM_ADDRESS2 || 'Ste Rear',
        cityLocality: process.env.SHIPENGINE_FROM_CITY || 'Brooklyn',
        stateProvince: process.env.SHIPENGINE_FROM_STATE || 'NY',
        postalCode: process.env.SHIPENGINE_FROM_POSTAL || '11230',
        countryCode: 'US',
      };

      // Build ship_from address (customer - sending the device)
      const shipFrom: ShipToAddress = {
        name: params.shipFrom.name,
        phone: params.shipFrom.phone,
        addressLine1: params.shipFrom.street1,
        addressLine2: params.shipFrom.street2,
        cityLocality: params.shipFrom.city,
        stateProvince: normalizeState(params.shipFrom.state),
        postalCode: params.shipFrom.postalCode,
        countryCode: params.shipFrom.country || 'US',
      };

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

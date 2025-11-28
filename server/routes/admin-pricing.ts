import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';

export function createAdminPricingRouter() {
  const router = Router();

  // Import XML feed to update models, variants, and pricing
  router.post('/import-xml', async (req: Request, res: Response) => {
    try {
      const { xml } = req.body;

      if (!xml || typeof xml !== 'string') {
        return res.status(400).json({ error: 'XML content is required' });
      }

      const result = await importXmlFeed(xml);
      return res.json(result);
    } catch (error: any) {
      console.error('Error importing XML:', error);
      return res.status(500).json({ 
        error: 'Failed to import XML', 
        message: error.message 
      });
    }
  });

  return router;
}

interface PriceData {
  storageSize: string;
  carriers: {
    [carrier: string]: {
      flawless: number;
      good: number;
      fair: number;
      broken: number;
    };
  };
}

interface ParsedModel {
  parentDevice: string;
  modelID: string;
  name: string;
  brand: string;
  slug: string;
  imageUrl: string;
  deeplink?: string;
  prices: PriceData[];
}

function extractTagValue(block: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = regex.exec(block);
  return match ? match[1].trim() : undefined;
}

function parseXmlModels(xml: string): ParsedModel[] {
  const models: ParsedModel[] = [];
  const modelRegex = /<model>([\s\S]*?)<\/model>/gi;
  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(xml)) !== null) {
    const block = match[1];
    
    const parentDevice = extractTagValue(block, 'parentDevice') || '';
    const modelID = extractTagValue(block, 'modelID') || '';
    const name = extractTagValue(block, 'name') || '';
    const brand = extractTagValue(block, 'brand') || parentDevice;
    const slug = extractTagValue(block, 'slug') || '';
    const imageUrl = extractTagValue(block, 'imageUrl') || '';
    const deeplink = extractTagValue(block, 'deeplink');

    // Parse price blocks
    const prices: PriceData[] = [];
    const pricesRegex = /<prices>([\s\S]*?)<\/prices>/gi;
    let priceMatch: RegExpExecArray | null;

    while ((priceMatch = pricesRegex.exec(block)) !== null) {
      const priceBlock = priceMatch[1];
      const storageSize = extractTagValue(priceBlock, 'storageSize') || '';
      
      // Parse carriers (att, verizon, tmobile, unlocked)
      const carriers: any = {};
      const carrierNames = ['att', 'verizon', 'tmobile', 'unlocked'];
      
      for (const carrierName of carrierNames) {
        const carrierRegex = new RegExp(`<${carrierName}>([\\s\\S]*?)<\\/${carrierName}>`, 'i');
        const carrierMatch = carrierRegex.exec(priceBlock);
        
        if (carrierMatch) {
          const carrierBlock = carrierMatch[1];
          carriers[carrierName] = {
            flawless: parseFloat(extractTagValue(carrierBlock, 'flawless') || '0'),
            good: parseFloat(extractTagValue(carrierBlock, 'good') || '0'),
            fair: parseFloat(extractTagValue(carrierBlock, 'fair') || '0'),
            broken: parseFloat(extractTagValue(carrierBlock, 'broken') || '0'),
          };
        }
      }

      if (storageSize && Object.keys(carriers).length > 0) {
        prices.push({ storageSize, carriers });
      }
    }

    if (modelID && name && slug) {
      models.push({
        parentDevice,
        modelID,
        name,
        brand,
        slug,
        imageUrl,
        deeplink,
        prices,
      });
    }
  }

  return models;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function formatBrand(brand: string): string {
  if (!brand) return brand;
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

function normalizeCarrier(carrier: string): string {
  const mapping: { [key: string]: string } = {
    'att': 'AT&T',
    'verizon': 'Verizon',
    'tmobile': 'T-Mobile',
    'unlocked': 'Unlocked',
  };
  return mapping[carrier.toLowerCase()] || carrier;
}

function normalizeCondition(condition: string): string {
  const mapping: { [key: string]: string } = {
    'flawless': 'Flawless',
    'good': 'Good',
    'fair': 'Fair',
    'broken': 'Broken',
  };
  return mapping[condition.toLowerCase()] || condition;
}

async function importXmlFeed(xml: string) {
  const models = parseXmlModels(xml);
  const errors: string[] = [];
  let modelsCreated = 0;
  let modelsUpdated = 0;
  let variantsCreated = 0;
  let priceTiersCreated = 0;

  // Ensure category exists
  let category = await storage.getCategoryBySlug('smartphones');
  if (!category) {
    category = await storage.createCategory({
      name: 'Smartphones',
      slug: 'smartphones',
    });
  }

  for (const model of models) {
    try {
      const modelSlug = slugify(`${model.brand}-${model.slug}`);
      
      // Check if model exists
      let deviceModel = await storage.getDeviceModelBySlug(modelSlug);
      
      if (!deviceModel) {
        // Create new model
        deviceModel = await storage.createDeviceModel({
          brand: formatBrand(model.brand),
          name: model.name.trim(),
          marketingName: model.name.trim(),
          sku: `${model.brand}-${model.modelID}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
          slug: modelSlug,
          categoryId: category.id,
          imageUrl: model.imageUrl,
          description: model.deeplink ? `Deeplink: ${model.deeplink}` : '',
          isActive: true,
        });
        modelsCreated++;
      } else {
        // Update existing model
        await storage.updateDeviceModel(deviceModel.id, {
          imageUrl: model.imageUrl,
          description: model.deeplink ? `Deeplink: ${model.deeplink}` : deviceModel.description,
        });
        modelsUpdated++;
      }

      // Process prices - create variants and price tiers
      for (const priceData of model.prices) {
        const storageValue = parseInt(priceData.storageSize.replace(/[^0-9]/g, '')) || 0;

        for (const [carrierKey, conditions] of Object.entries(priceData.carriers)) {
          const carrierName = normalizeCarrier(carrierKey);

          // Check if variant exists
          const existingVariants = await storage.getDeviceVariantsByModelId(deviceModel.id);
          let variant = existingVariants.find(v => 
            v.storage === priceData.storageSize && v.carrier === carrierName
          );

          if (!variant) {
            // Create variant
            variant = await storage.createDeviceVariant({
              deviceModelId: deviceModel.id,
              storage: priceData.storageSize,
              color: 'Various',
              carrier: carrierName,
              conditionGrade: 'A',
            } as any);
            variantsCreated++;
          }

          // Create price tiers for each condition
          for (const [conditionKey, price] of Object.entries(conditions)) {
            const conditionName = normalizeCondition(conditionKey);
            
            if (price > 0) {
              try {
                await storage.createPriceTier({
                  deviceVariantId: variant.id,
                  condition: conditionName,
                  minQuantity: 1,
                  maxQuantity: null,
                  pricePerUnit: price.toString(),
                  currency: 'USD',
                  effectiveFrom: new Date(),
                  effectiveTo: null,
                } as any);
                priceTiersCreated++;
              } catch (error: any) {
                // Price tier might already exist, skip silently
              }
            }
          }
        }
      }
    } catch (error: any) {
      errors.push(`Error processing model ${model.name}: ${error.message}`);
    }
  }

  return {
    modelsCreated,
    modelsUpdated,
    variantsCreated,
    priceTiersCreated,
    errors,
  };
}

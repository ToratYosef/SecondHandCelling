import { parseStringPromise } from "xml2js";

export interface ParsedDevice {
  brand: string;
  modelID: string;
  name: string;
  slug: string;
  imageUrl?: string;
  year?: number;
  variants: ParsedVariant[];
}

export interface ParsedVariant {
  storage: string;
  color?: string;
  carrier?: "locked" | "unlocked";
  pricing: {
    condition: "flawless" | "good" | "fair" | "broken";
    price: number;
  }[];
}

export async function parseDeviceXML(xmlContent: string): Promise<ParsedDevice[]> {
  try {
    const result = await parseStringPromise(xmlContent);
    const models: ParsedDevice[] = [];

    if (result.models && result.models.model) {
      const modelArray = Array.isArray(result.models.model) ? result.models.model : [result.models.model];

      for (const model of modelArray) {
        const parsedDevice: ParsedDevice = {
          brand: model.brand?.[0] || model.parentDevice?.[0] || "Unknown",
          modelID: model.modelID?.[0] || "",
          name: model.name?.[0] || "",
          slug: model.slug?.[0] || "",
          imageUrl: model.imageUrl?.[0],
          year: model.year?.[0] ? parseInt(model.year[0]) : undefined,
          variants: [],
        };

        // Parse variants (storage options)
        const pricesArray = Array.isArray(model.prices) ? model.prices : [model.prices];
        
        for (const priceGroup of pricesArray.filter(Boolean)) {
          const storage = priceGroup.storageSize?.[0] || "";
          const priceValue = priceGroup.priceValue?.[0];

          if (!priceValue) continue;

          // Parse locked prices
          if (priceValue.locked?.[0]) {
            const lockedPrices = priceValue.locked[0];
            const variant: ParsedVariant = {
              storage,
              carrier: "locked",
              pricing: [
                {
                  condition: "flawless",
                  price: parseFloat(lockedPrices.flawless?.[0] || "0"),
                },
                {
                  condition: "good",
                  price: parseFloat(lockedPrices.good?.[0] || "0"),
                },
                {
                  condition: "fair",
                  price: parseFloat(lockedPrices.fair?.[0] || "0"),
                },
                {
                  condition: "broken",
                  price: parseFloat(lockedPrices.broken?.[0] || "0"),
                },
              ],
            };
            parsedDevice.variants.push(variant);
          }

          // Parse unlocked prices
          if (priceValue.unlocked?.[0]) {
            const unlockedPrices = priceValue.unlocked[0];
            const variant: ParsedVariant = {
              storage,
              carrier: "unlocked",
              pricing: [
                {
                  condition: "flawless",
                  price: parseFloat(unlockedPrices.flawless?.[0] || "0"),
                },
                {
                  condition: "good",
                  price: parseFloat(unlockedPrices.good?.[0] || "0"),
                },
                {
                  condition: "fair",
                  price: parseFloat(unlockedPrices.fair?.[0] || "0"),
                },
                {
                  condition: "broken",
                  price: parseFloat(unlockedPrices.broken?.[0] || "0"),
                },
              ],
            };
            parsedDevice.variants.push(variant);
          }
        }

        if (parsedDevice.variants.length > 0) {
          models.push(parsedDevice);
        }
      }
    }

    return models;
  } catch (error) {
    console.error("Error parsing XML:", error);
    throw new Error("Failed to parse XML file");
  }
}

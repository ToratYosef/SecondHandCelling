import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { 
  users, 
  deviceBrands, 
  deviceModels, 
  deviceVariants, 
  buybackConditionProfiles, 
  buybackPricingRules,
  sellOrders,
  sellOrderItems,
  shipments,
  payments
} from "../shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Clear existing data in correct order (children first)
    console.log("Clearing existing data...");
    await db.delete(payments);
    await db.delete(shipments);
    await db.delete(sellOrderItems);
    await db.delete(sellOrders);
    await db.delete(buybackPricingRules);
    await db.delete(deviceVariants);
    await db.delete(deviceModels);
    await db.delete(deviceBrands);
    await db.delete(buybackConditionProfiles);
    await db.delete(users);
    console.log("✓ Cleared existing data");

    // Users
    const adminUser = await storage.createUser({
      email: "admin@secondhandcell.com",
      passwordHash: await hashPassword("admin123"),
      firstName: "Admin",
      lastName: "User",
      phoneNumber: "+1-555-0100",
      role: "admin",
      isEmailVerified: true,
    });

    const customerUser = await storage.createUser({
      email: "john.doe@example.com",
      passwordHash: await hashPassword("password123"),
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+1-555-0101",
      role: "customer",
      isEmailVerified: true,
    });

    console.log("✓ Created test users");

    // Condition profiles
    const conditionA = await storage.createConditionProfile({
      code: "A",
      label: "Flawless",
      description: "Like new, no visible wear",
      isBroken: false,
      isActive: true,
    });

    const conditionB = await storage.createConditionProfile({
      code: "B",
      label: "Good",
      description: "Minor signs of wear, fully functional",
      isBroken: false,
      isActive: true,
    });

    const conditionC = await storage.createConditionProfile({
      code: "C",
      label: "Fair",
      description: "Visible wear, minor functional issues",
      isBroken: false,
      isActive: true,
    });

    console.log("✓ Created condition profiles");

    // Brands
    const apple = await storage.createBrand({
      name: "Apple",
      slug: "apple",
      isActive: true,
    });

    const samsung = await storage.createBrand({
      name: "Samsung",
      slug: "samsung",
      isActive: true,
    });

    console.log("✓ Created device brands");

    // Device models
    const iphone15Pro = await storage.createModel({
      brandId: apple.id,
      familyId: null,
      name: "iPhone 15 Pro",
      marketingName: "iPhone 15 Pro",
      sku: null,
      slug: "iphone-15-pro",
      imageUrl: null,
      year: 2023,
      networkTechnology: "5G",
      isActive: true,
    });

    const iphone14Pro = await storage.createModel({
      brandId: apple.id,
      familyId: null,
      name: "iPhone 14 Pro",
      marketingName: "iPhone 14 Pro",
      sku: null,
      slug: "iphone-14-pro",
      imageUrl: null,
      year: 2022,
      networkTechnology: "5G",
      isActive: true,
    });

    const galaxyS23 = await storage.createModel({
      brandId: samsung.id,
      familyId: null,
      name: "Galaxy S23",
      marketingName: "Samsung Galaxy S23",
      sku: null,
      slug: "galaxy-s23",
      imageUrl: null,
      year: 2023,
      networkTechnology: "5G",
      isActive: true,
    });

    console.log("✓ Created device models");

    // Device variants
    const variant15Pro256 = await storage.createVariant({
      modelId: iphone15Pro.id,
      storageGb: 256,
      color: "Natural Titanium",
      networkCarrier: "unlocked",
      hasEsim: true,
      isActive: true,
    });

    const variant14Pro256 = await storage.createVariant({
      modelId: iphone14Pro.id,
      storageGb: 256,
      color: "Space Black",
      networkCarrier: "unlocked",
      hasEsim: true,
      isActive: true,
    });

    const variantS23256 = await storage.createVariant({
      modelId: galaxyS23.id,
      storageGb: 256,
      color: "Phantom Black",
      networkCarrier: "unlocked",
      hasEsim: false,
      isActive: true,
    });

    console.log("✓ Created device variants");

    // Pricing rules - for all variants x all conditions
    const pricingRulesData = [
      // iPhone 15 Pro 256GB
      { variant: variant15Pro256, condition: conditionA, price: "510.00" },
      { variant: variant15Pro256, condition: conditionB, price: "450.00" },
      { variant: variant15Pro256, condition: conditionC, price: "350.00" },
      // iPhone 14 Pro 256GB
      { variant: variant14Pro256, condition: conditionA, price: "445.00" },
      { variant: variant14Pro256, condition: conditionB, price: "385.00" },
      { variant: variant14Pro256, condition: conditionC, price: "285.00" },
      // Samsung Galaxy S23 256GB
      { variant: variantS23256, condition: conditionA, price: "385.00" },
      { variant: variantS23256, condition: conditionB, price: "320.00" },
      { variant: variantS23256, condition: conditionC, price: "240.00" },
    ];

    for (const rule of pricingRulesData) {
      await storage.createPricingRule({
        deviceVariantId: rule.variant.id,
        conditionProfileId: rule.condition.id,
        basePrice: parseFloat(rule.price),
        currency: "USD",
        isBlacklistedEligible: false,
        isActive: true,
      });
    }

    console.log("✓ Created pricing rules");

    console.log("\n" + "=".repeat(60));
    console.log("Database seeded successfully!");
    console.log("=".repeat(60));
    console.log("\nTest Credentials:");
    console.log("  Admin:    admin@secondhandcell.com / admin123");
    console.log("  Customer: john.doe@example.com / password123");
    console.log("=".repeat(60) + "\n");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env - same logic as db.ts
const envPaths = [
  resolve(__dirname, "../../.env"),   // From scripts/
  resolve(__dirname, "../.env"),      // Fallback
  resolve(process.cwd(), ".env"),     // Fallback to cwd
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(DATABASE_URL);

async function unseed() {
  console.log("🗑️  Starting database cleanup...\n");

  try {
    // Use TRUNCATE CASCADE to delete all data in correct order
    // This is more efficient and handles foreign keys automatically
    
    const tables = [
      'saved_list_items',
      'saved_lists',
      'audit_logs',
      'support_tickets',
      'cart_items',
      'carts',
      'quote_items',
      'quotes',
      'shipments',
      'payments',
      'order_items',
      'orders',
      'shipping_addresses',
      'billing_addresses',
      'price_tiers',
      'inventory_items',
      'device_variants',
      'device_models',
      'device_categories',
      'company_users',
      'companies',
      'users',
    ];

    for (const table of tables) {
      console.log(`Truncating ${table}...`);
      await sql.query(`TRUNCATE TABLE ${table} CASCADE`);
    }

    console.log("\n✅ Database cleanup completed successfully!");
    console.log("All seed data has been removed.");
    
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

unseed();

import { storage } from "../storage";
import bcrypt from "bcrypt";
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

async function seedAdmin() {
  console.log("🔐 Creating admin credentials...\n");

  try {
    // Check if admin already exists
    let existingAdmin;
    try {
      existingAdmin = await storage.getUserByEmail("admin@secondhandcell.com");
    } catch (err) {
      // Ignore query errors, continue with creation
    }
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("   Email: admin@secondhandcell.com");
      console.log("   Role: " + existingAdmin.role);
      console.log("\n💡 Tip: Use 'npm run unseed' first to clear existing data");
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    
    try {
      const adminUser = await storage.createUser({
        name: "Admin User",
        email: "admin@secondhandcell.com",
        passwordHash: adminPassword,
        role: "super_admin",
        phone: "+1-555-0100",
        isActive: true,
      });

      console.log("✅ Admin credentials created successfully!\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("  Email:    admin@secondhandcell.com");
      console.log("  Password: Admin123!");
      console.log("  Role:     super_admin");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (createError) {
      console.error("\n❌ Database error (Neon driver compatibility issue)");
      console.log("\n📋 Manual SQL to create admin:\n");
      console.log("INSERT INTO users (id, name, email, password_hash, role, phone, is_active, created_at, updated_at)");
      console.log("VALUES (");
      console.log("  gen_random_uuid(),");
      console.log("  'Admin User',");
      console.log("  'admin@secondhandcell.com',");
      console.log(`  '${adminPassword}',`);
      console.log("  'super_admin',");
      console.log("  '+1-555-0100',");
      console.log("  true,");
      console.log("  CURRENT_TIMESTAMP,");
      console.log("  CURRENT_TIMESTAMP");
      console.log(");\n");
      console.log("Or use existing admin credentials from production.");
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

seedAdmin();

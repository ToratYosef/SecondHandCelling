import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env - try multiple locations for bundled vs unbundled scenarios
const envPaths = [
  resolve(__dirname, "../.env"),      // When running from server/ (unbundled)
  resolve(__dirname, "../../.env"),   // When running from server/dist/ (bundled)
  resolve(process.cwd(), ".env"),     // Fallback to cwd
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Neon PostgreSQL connection
const sql = neon(process.env.DATABASE_URL);

// Drizzle ORM instance
export const db = drizzle(sql, { schema });

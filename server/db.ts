import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// Load .env from root directory
config({ path: resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Neon PostgreSQL connection
const sql = neon(process.env.DATABASE_URL);

// Drizzle ORM instance
export const db = drizzle(sql, { schema });

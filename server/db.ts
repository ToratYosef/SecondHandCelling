// Database client setup with SQLite
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const dbPath = 'sqlite.db';
export const sqlite = new Database(dbPath);
export const db = drizzle({ client: sqlite, schema });

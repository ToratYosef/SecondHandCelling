// migrate-all.js
require('dotenv').config();
const admin = require('firebase-admin');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ---- 1. Firebase Admin init ----
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(serviceAccountPath), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// ---- 2. Neon Postgres init ----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon usually needs SSL
});

// ---- 3. Helpers ----
function toTableName(collectionId) {
  // sanitize collection name into a safe table name
  return (
    'fs_' +
    collectionId
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
  );
}

async function migrateCollection(colRef) {
  const rawName = colRef.id;
  const tableName = toTableName(rawName);

  console.log(`\n=== Migrating collection "${rawName}" → table "${tableName}" ===`);

  const client = await pool.connect();
  try {
    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id   TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    const snapshot = await colRef.get();
    console.log(`  Found ${snapshot.size} docs in "${rawName}"`);

    let count = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();

      await client.query(
        `
        INSERT INTO "${tableName}" (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE
          SET data = EXCLUDED.data;
      `,
        [doc.id, data]
      );

      count++;
      if (count % 100 === 0) {
        console.log(`  Inserted/updated ${count} docs...`);
      }
    }

    console.log(`  ✅ Done: ${count} docs migrated for "${rawName}"`);
  } catch (err) {
    console.error(`  ❌ Error migrating "${rawName}":`, err.message);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('Listing root collections from Firestore...');
    const collections = await firestore.listCollections();
    console.log(`Found ${collections.length} root collections:`);

    for (const col of collections) {
      console.log(` - ${col.id}`);
    }

    for (const col of collections) {
      await migrateCollection(col);
    }

    console.log('\n🎉 All collections migrated.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

main();

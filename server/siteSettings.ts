// Sitewide settings storage and API helpers
import { db } from "./db";
import { eq } from "drizzle-orm";
import { siteSettings } from "@shared/schema";

export async function getSiteSettings() {
  const [settings] = await db.select().from(siteSettings);
  return settings || { logoUrl: "" };
}

export async function updateSiteLogo(logoUrl: string) {
  // Upsert logoUrl
  const [existing] = await db.select().from(siteSettings);
  if (existing) {
    await db.update(siteSettings).set({ logoUrl }).where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values({ logoUrl });
  }
}

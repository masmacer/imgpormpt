#!/usr/bin/env tsx

/**
 * Clean up expired session records
 * Can be run periodically via cron job or Vercel Cron Jobs
 */

import { db } from "../packages/auth/db";

async function cleanupExpiredSessions() {
  const now = new Date();
  
  try {
    // Delete expired sessions
    const result = await db
      .deleteFrom("Session")
      .where("expires", "<", now)
      .execute();
    
    console.log(`Cleaned up ${result.length} expired session records`);
    
    // Clean up VerificationTokens from 30 days ago
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const tokenResult = await db
      .deleteFrom("VerificationToken")
      .where("expires", "<", thirtyDaysAgo)
      .execute();
    
    console.log(`Cleaned up ${tokenResult.length} expired verification token records`);
    
    // Count current active sessions
    const activeSessionsCount = await db
      .selectFrom("Session")
      .select((eb) => [eb.fn.count("id").as("count")])
      .where("expires", ">", now)
      .executeTakeFirst();
    
    console.log(`Current active sessions count: ${activeSessionsCount?.count || 0}`);
    
  } catch (error) {
    console.error("Error during session cleanup:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.destroy();
  }
}

// If running this script directly
if (require.main === module) {
  cleanupExpiredSessions()
    .then(() => {
      console.log("Session cleanup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Session cleanup failed:", error);
      process.exit(1);
    });
}

export { cleanupExpiredSessions };
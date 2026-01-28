import dns from 'dns'
import 'dotenv/config'
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Force IPv4 resolution to avoid IPv6 connectivity issues
dns.setDefaultResultOrder('ipv4first')

/**
 * Database Client Configuration
 * Supports both local (Docker) and remote (Neon) databases
 */

// Support both DATABASE_URL and DB_URL
const connectionString =
  process.env.DATABASE_URL || process.env.DB_URL

if (!connectionString) {
  throw new Error("DATABASE_URL or DB_URL environment variable is not set")
}

// Determine if using local database (localhost)
const isLocalDb = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')

// Create connection pool with appropriate SSL settings
export const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: isLocalDb ? 5000 : 20000,
})

// Initialize Drizzle with node-postgres adapter
export const db = drizzle(pool, { schema })

/**
 * Test database connection
 * Call once during server startup
 */
export async function testConnection() {
  const client = await pool.connect()
  try {
    const result = await client.query("SELECT 1 as health_check, NOW() as server_time, version() as pg_version")
    console.log("✅ Database connection successful")
    console.log("📊 Server time:", result.rows[0]?.server_time)
    console.log("🗄️  Database:", isLocalDb ? "Local (Docker)" : "Remote (Neon)")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Gracefully close database connection pool
 * Call on server shutdown
 */
export async function closeConnection() {
  try {
    await pool.end()
    console.log("✅ Database connection pool closed")
  } catch (error) {
    console.error("❌ Error closing database pool:", error)
    throw error
  }
}

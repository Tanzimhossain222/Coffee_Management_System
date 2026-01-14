import dotenv from 'dotenv'

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

dotenv.config();

/**
 * Database Client Configuration
 * Singleton pattern for PostgreSQL connection pool
 */

// Support both DATABASE_URL and DB_URL for flexibility
const connectionString = process.env.DATABASE_URL || process.env.DB_URL

console.log("connectionString", connectionString)

if (!connectionString) {
    throw new Error("DATABASE_URL or DB_URL environment variable is not set")
}

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 seconds for cloud databases
})


export const db = drizzle(pool, { schema })

/**
 * Test database connection
 * Call this on server startup to verify database connectivity
 */
export async function testConnection() {
    try {
        const client = await pool.connect()
        await client.query("SELECT NOW()")
        client.release()
        console.log("✅ Database connection successful")
        return true
    } catch (error) {
        console.error("❌ Database connection failed:", error)
        throw error
    }
}

/**
 * Gracefully close database connection pool
 * Call this on server shutdown
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

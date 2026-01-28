import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/backend/database/schema/index.ts",
    out: "./src/backend/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || process.env.DB_URL || "",
    },
    verbose: true,
    strict: true,
})

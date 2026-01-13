import { relations } from "drizzle-orm"
import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { authUsers, userProfiles } from "./auth.schema"
import { deliveries } from "./delivery.schema"
import { orders } from "./order.schema"

// ============================================
// BRANCHES TABLE (Coffee shop branches)
// ============================================

export const branches = pgTable("branches", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(), // e.g., "Downtown Branch", "Airport Branch"
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    phoneNo: varchar("phone_no", { length: 20 }),
    email: varchar("email", { length: 255 }),
    managerId: uuid("manager_id").references(() => authUsers.id), // Branch manager
    isActive: boolean("is_active").default(true).notNull(),
    openingTime: varchar("opening_time", { length: 10 }), // e.g., "08:00"
    closingTime: varchar("closing_time", { length: 10 }), // e.g., "22:00"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const branchesRelations = relations(branches, ({ one, many }) => ({
    manager: one(authUsers, {
        fields: [branches.managerId],
        references: [authUsers.id],
    }),
    staff: many(userProfiles), // All staff (MANAGER, STAFF, DELIVERY) assigned to this branch
    orders: many(orders),
    deliveries: many(deliveries),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Branch = typeof branches.$inferSelect
export type NewBranch = typeof branches.$inferInsert

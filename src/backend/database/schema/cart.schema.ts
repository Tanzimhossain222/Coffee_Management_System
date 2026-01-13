import { relations } from "drizzle-orm"
import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { authUsers } from "./auth.schema"
import { coffees } from "./coffee.schema"

// ============================================
// CART TABLE
// ============================================

export const cart = pgTable("cart", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    coffeeId: uuid("coffee_id")
        .notNull()
        .references(() => coffees.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const cartRelations = relations(cart, ({ one }) => ({
    customer: one(authUsers, {
        fields: [cart.customerId],
        references: [authUsers.id],
    }),
    coffee: one(coffees, {
        fields: [cart.coffeeId],
        references: [coffees.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Cart = typeof cart.$inferSelect
export type NewCart = typeof cart.$inferInsert

import { relations } from "drizzle-orm"
import { boolean, decimal, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { cart } from "./cart.schema"
import { orderItems } from "./order.schema"
import { reviews } from "./review.schema"

// ============================================
// COFFEE CATEGORIES TABLE (Normalization of category)
// ============================================

export const coffeeCategories = pgTable("coffee_categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 50 }).unique().notNull(),
    description: text("description"),
})

// ============================================
// COFFEE ITEMS TABLE
// ============================================

export const coffees = pgTable("coffees", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }),
    categoryId: uuid("category_id").references(() => coffeeCategories.id),
    available: boolean("available").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const coffeeCategoriesRelations = relations(coffeeCategories, ({ many }) => ({
    coffees: many(coffees),
}))

export const coffeesRelations = relations(coffees, ({ one, many }) => ({
    category: one(coffeeCategories, {
        fields: [coffees.categoryId],
        references: [coffeeCategories.id],
    }),
    orderItems: many(orderItems),
    cartItems: many(cart),
    reviews: many(reviews),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type CoffeeCategory = typeof coffeeCategories.$inferSelect
export type NewCoffeeCategory = typeof coffeeCategories.$inferInsert

export type Coffee = typeof coffees.$inferSelect
export type NewCoffee = typeof coffees.$inferInsert

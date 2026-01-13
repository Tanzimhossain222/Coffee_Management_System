import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { authUsers } from "./auth.schema"
import { coffees } from "./coffee.schema"

// ============================================
// REVIEWS TABLE
// ============================================

export const reviews = pgTable("reviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    coffeeId: uuid("coffee_id")
        .notNull()
        .references(() => coffees.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5 stars
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const reviewsRelations = relations(reviews, ({ one }) => ({
    customer: one(authUsers, {
        fields: [reviews.customerId],
        references: [authUsers.id],
    }),
    coffee: one(coffees, {
        fields: [reviews.coffeeId],
        references: [coffees.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

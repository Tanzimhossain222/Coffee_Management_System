import { relations } from "drizzle-orm"
import { decimal, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { orderStatusEnum, orderTypeEnum } from "../enums"
import { authUsers } from "./auth.schema"
import { branches } from "./branch.schema"
import { coffees } from "./coffee.schema"
import { deliveries } from "./delivery.schema"
import { payments } from "./payment.schema"
import { supportTickets } from "./support.schema"

// ============================================
// ORDERS TABLE
// ============================================

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => authUsers.id),
    branchId: uuid("branch_id")
        .notNull()
        .references(() => branches.id), // Which branch handles this order
    orderType: orderTypeEnum("order_type").notNull(), // PICKUP or DELIVERY
    status: orderStatusEnum("status").default("CREATED").notNull(),
    deliveryAddress: text("delivery_address"), // Required only for DELIVERY orders
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// ORDER ITEMS TABLE (Junction table)
// ============================================

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    coffeeId: uuid("coffee_id")
        .notNull()
        .references(() => coffees.id),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const ordersRelations = relations(orders, ({ one, many }) => ({
    customer: one(authUsers, {
        fields: [orders.customerId],
        references: [authUsers.id],
    }),
    branch: one(branches, {
        fields: [orders.branchId],
        references: [branches.id],
    }),
    items: many(orderItems),
    delivery: one(deliveries, {
        fields: [orders.id],
        references: [deliveries.orderId],
    }),
    payment: one(payments, {
        fields: [orders.id],
        references: [payments.orderId],
    }),
    supportTickets: many(supportTickets),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    coffee: one(coffees, {
        fields: [orderItems.coffeeId],
        references: [coffees.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert

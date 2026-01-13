import { relations } from "drizzle-orm"
import { decimal, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { paymentMethodEnum, paymentStatusEnum } from "../enums"
import { authUsers } from "./auth.schema"
import { orders } from "./order.schema"

// ============================================
// PAYMENTS TABLE
// ============================================

export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .unique()
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => authUsers.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    status: paymentStatusEnum("status").default("PENDING").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
    customer: one(authUsers, {
        fields: [payments.customerId],
        references: [authUsers.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

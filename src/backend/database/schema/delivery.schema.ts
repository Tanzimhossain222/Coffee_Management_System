import { relations } from "drizzle-orm"
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { deliveryStatusEnum } from "../enums"
import { authUsers } from "./auth.schema"
import { branches } from "./branch.schema"
import { orders } from "./order.schema"

// ============================================
// DELIVERIES TABLE
// ============================================

export const deliveries = pgTable("deliveries", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .unique()
        .notNull()
        .references(() => orders.id),
    branchId: uuid("branch_id")
        .notNull()
        .references(() => branches.id), // Which branch this delivery is from
    deliveryAgentId: uuid("delivery_agent_id").references(() => authUsers.id),
    status: deliveryStatusEnum("status").default("PENDING").notNull(),
    assignedAt: timestamp("assigned_at"),
    pickedUpAt: timestamp("picked_up_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
    order: one(orders, {
        fields: [deliveries.orderId],
        references: [orders.id],
    }),
    branch: one(branches, {
        fields: [deliveries.branchId],
        references: [branches.id],
    }),
    deliveryAgent: one(authUsers, {
        fields: [deliveries.deliveryAgentId],
        references: [authUsers.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type Delivery = typeof deliveries.$inferSelect
export type NewDelivery = typeof deliveries.$inferInsert

import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { supportPriorityEnum, supportStatusEnum } from "../enums"
import { authUsers } from "./auth.schema"
import { orders } from "./order.schema"

// ============================================
// SUPPORT TICKETS TABLE
// ============================================

export const supportTickets = pgTable("support_tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: supportStatusEnum("status").default("OPEN").notNull(),
    priority: supportPriorityEnum("priority").default("MEDIUM").notNull(),
    assignedTo: uuid("assigned_to").references(() => authUsers.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
})

// ============================================
// RELATIONS
// ============================================

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
    customer: one(authUsers, {
        fields: [supportTickets.customerId],
        references: [authUsers.id],
    }),
    order: one(orders, {
        fields: [supportTickets.orderId],
        references: [orders.id],
    }),
    assignedAgent: one(authUsers, {
        fields: [supportTickets.assignedTo],
        references: [authUsers.id],
        relationName: "assignedTickets",
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type SupportTicket = typeof supportTickets.$inferSelect
export type NewSupportTicket = typeof supportTickets.$inferInsert

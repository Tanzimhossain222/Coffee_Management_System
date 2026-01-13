/**
 * Order Service
 * Handles order management with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import {
    authUsers,
    branches,
    cart,
    coffees,
    deliveries,
    orderItems,
    orders,
    payments,
    userProfiles
} from "@database/schema"
import type { NewDelivery } from "@database/schema/delivery.schema"
import type { NewOrder, NewOrderItem, Order } from "@database/schema/order.schema"
import type { NewPayment } from "@database/schema/payment.schema"
import { and, desc, eq, inArray, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export type OrderStatus = "CREATED" | "ACCEPTED" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED"
export type OrderType = "PICKUP" | "DELIVERY"
export type PaymentMethod = "CASH" | "CARD" | "MOBILE_BANKING" | "WALLET"

export interface OrderItemDetail {
    id: string
    coffeeId: string
    coffeeName: string
    quantity: number
    unitPrice: string
}

export interface OrderDetail {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    customerPhone: string | null
    branchId: string
    branchName: string
    orderType: OrderType
    status: OrderStatus
    deliveryAddress: string | null
    totalAmount: string
    notes: string | null
    createdAt: Date
    updatedAt: Date
    items: OrderItemDetail[]
    delivery: {
        id: string
        status: string
        agentId: string | null
        agentName: string | null
        assignedAt: Date | null
        pickedUpAt: Date | null
        deliveredAt: Date | null
    } | null
    payment: {
        id: string
        method: string
        status: string
        paidAt: Date | null
    } | null
}

export interface CreateOrderInput {
    customerId: string
    branchId: string
    orderType: OrderType
    deliveryAddress?: string
    notes?: string
    items: {
        coffeeId: string
        quantity: number
    }[]
    paymentMethod: PaymentMethod
}

export interface OrderFilters {
    customerId?: string
    branchId?: string
    status?: OrderStatus | OrderStatus[]
    deliveryAgentId?: string
}

// ============================================
// Order Service
// ============================================

export const orderService = {
    /**
     * Get orders with full details using multiple JOINs
     */
    async findAll(filters?: OrderFilters, limit = 50, offset = 0): Promise<OrderDetail[]> {
        // Build WHERE conditions
        const conditions = []

        if (filters?.customerId) {
            conditions.push(eq(orders.customerId, filters.customerId))
        }

        if (filters?.branchId) {
            conditions.push(eq(orders.branchId, filters.branchId))
        }

        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                conditions.push(inArray(orders.status, filters.status))
            } else {
                conditions.push(eq(orders.status, filters.status))
            }
        }

        if (filters?.deliveryAgentId) {
            conditions.push(eq(deliveries.deliveryAgentId, filters.deliveryAgentId))
        }

        // Get orders with customer and branch info
        const ordersResult = await db
            .select({
                id: orders.id,
                customerId: orders.customerId,
                customerName: userProfiles.name,
                customerEmail: authUsers.email,
                customerPhone: userProfiles.phoneNo,
                branchId: orders.branchId,
                branchName: branches.name,
                orderType: orders.orderType,
                status: orders.status,
                deliveryAddress: orders.deliveryAddress,
                totalAmount: orders.totalAmount,
                notes: orders.notes,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
            })
            .from(orders)
            .innerJoin(authUsers, eq(orders.customerId, authUsers.id))
            .innerJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .innerJoin(branches, eq(orders.branchId, branches.id))
            .leftJoin(deliveries, eq(orders.id, deliveries.orderId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(orders.createdAt))
            .limit(limit)
            .offset(offset)

        if (ordersResult.length === 0) {
            return []
        }

        const orderIds = ordersResult.map(o => o.id)

        // Get order items with coffee names
        const itemsResult = await db
            .select({
                id: orderItems.id,
                orderId: orderItems.orderId,
                coffeeId: orderItems.coffeeId,
                coffeeName: coffees.name,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
            })
            .from(orderItems)
            .innerJoin(coffees, eq(orderItems.coffeeId, coffees.id))
            .where(inArray(orderItems.orderId, orderIds))

        // Get delivery info
        const deliveriesResult = await db
            .select({
                id: deliveries.id,
                orderId: deliveries.orderId,
                status: deliveries.status,
                agentId: deliveries.deliveryAgentId,
                agentName: userProfiles.name,
                assignedAt: deliveries.assignedAt,
                pickedUpAt: deliveries.pickedUpAt,
                deliveredAt: deliveries.deliveredAt,
            })
            .from(deliveries)
            .leftJoin(userProfiles, eq(deliveries.deliveryAgentId, userProfiles.authUserId))
            .where(inArray(deliveries.orderId, orderIds))

        // Get payment info
        const paymentsResult = await db
            .select({
                id: payments.id,
                orderId: payments.orderId,
                method: payments.paymentMethod,
                status: payments.status,
                paidAt: payments.paidAt,
            })
            .from(payments)
            .where(inArray(payments.orderId, orderIds))

        // Map items, deliveries, and payments to orders
        const itemsByOrder = new Map<string, OrderItemDetail[]>()
        for (const item of itemsResult) {
            if (!itemsByOrder.has(item.orderId)) {
                itemsByOrder.set(item.orderId, [])
            }
            itemsByOrder.get(item.orderId)!.push({
                id: item.id,
                coffeeId: item.coffeeId,
                coffeeName: item.coffeeName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })
        }

        const deliveryByOrder = new Map(deliveriesResult.map(d => [d.orderId, d]))
        const paymentByOrder = new Map(paymentsResult.map(p => [p.orderId, p]))

        return ordersResult.map(order => ({
            ...order,
            items: itemsByOrder.get(order.id) || [],
            delivery: deliveryByOrder.get(order.id) ? {
                id: deliveryByOrder.get(order.id)!.id,
                status: deliveryByOrder.get(order.id)!.status,
                agentId: deliveryByOrder.get(order.id)!.agentId,
                agentName: deliveryByOrder.get(order.id)!.agentName,
                assignedAt: deliveryByOrder.get(order.id)!.assignedAt,
                pickedUpAt: deliveryByOrder.get(order.id)!.pickedUpAt,
                deliveredAt: deliveryByOrder.get(order.id)!.deliveredAt,
            } : null,
            payment: paymentByOrder.get(order.id) ? {
                id: paymentByOrder.get(order.id)!.id,
                method: paymentByOrder.get(order.id)!.method,
                status: paymentByOrder.get(order.id)!.status,
                paidAt: paymentByOrder.get(order.id)!.paidAt,
            } : null,
        }))
    },

    /**
     * Get single order by ID with full details
     */
    async findById(id: string): Promise<OrderDetail | null> {
        const result = await this.findAll({ customerId: undefined }, 1, 0)

        // Re-query for specific ID
        const orders = await this.findAll({} as OrderFilters, 1000, 0)
        const order = orders.find(o => o.id === id)

        return order || null
    },

    /**
     * Create new order from cart
     * TRANSACTION: Ensures atomicity of order creation with all related records
     */
    async create(input: CreateOrderInput): Promise<OrderDetail> {
        // Get coffee prices
        const coffeeIds = input.items.map(i => i.coffeeId)
        const coffeePrices = await db
            .select({
                id: coffees.id,
                name: coffees.name,
                price: coffees.price,
            })
            .from(coffees)
            .where(inArray(coffees.id, coffeeIds))

        const priceMap = new Map(coffeePrices.map(c => [c.id, c]))

        // Calculate total
        let totalAmount = 0
        const orderItemsData: { coffeeId: string; quantity: number; unitPrice: string; coffeeName: string }[] = []

        for (const item of input.items) {
            const coffee = priceMap.get(item.coffeeId)
            if (!coffee) {
                throw new Error(`Coffee ${item.coffeeId} not found`)
            }
            const unitPrice = parseFloat(coffee.price)
            totalAmount += unitPrice * item.quantity
            orderItemsData.push({
                coffeeId: item.coffeeId,
                quantity: item.quantity,
                unitPrice: coffee.price,
                coffeeName: coffee.name,
            })
        }

        // BEGIN TRANSACTION: Create order with all related records atomically
        const result = await db.transaction(async (tx) => {
            // 1. Create order
            const [newOrder] = await tx
                .insert(orders)
                .values({
                    customerId: input.customerId,
                    branchId: input.branchId,
                    orderType: input.orderType,
                    deliveryAddress: input.deliveryAddress,
                    totalAmount: totalAmount.toFixed(2),
                    notes: input.notes,
                    status: "CREATED",
                } satisfies NewOrder)
                .returning()

            // 2. Create order items
            await tx.insert(orderItems).values(
                orderItemsData.map(item => ({
                    orderId: newOrder.id,
                    coffeeId: item.coffeeId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                } satisfies NewOrderItem))
            )

            // 3. Create delivery record if delivery order
            if (input.orderType === "DELIVERY") {
                await tx.insert(deliveries).values({
                    orderId: newOrder.id,
                    branchId: input.branchId,
                    status: "PENDING",
                } satisfies NewDelivery)
            }

            // 4. Create payment record
            await tx.insert(payments).values({
                orderId: newOrder.id,
                customerId: input.customerId,
                amount: totalAmount.toFixed(2),
                paymentMethod: input.paymentMethod,
                status: "PENDING",
            } satisfies NewPayment)

            // 5. Clear cart after order
            await tx.delete(cart).where(eq(cart.customerId, input.customerId))

            return newOrder
        })
        // END TRANSACTION

        // Fetch and return full order details
        const orderDetail = await this.findById(result.id)
        if (!orderDetail) {
            throw new Error("Failed to fetch created order")
        }

        return orderDetail
    },

    /**
     * Update order status
     */
    async updateStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
        const [updated] = await db
            .update(orders)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning()

        // If cancelled, update delivery status too
        if (status === "CANCELLED") {
            await db
                .update(deliveries)
                .set({ status: "PENDING" })
                .where(eq(deliveries.orderId, orderId))
        }

        return updated || null
    },

    /**
     * Accept order (ADMIN/MANAGER)
     */
    async acceptOrder(orderId: string): Promise<Order | null> {
        return this.updateStatus(orderId, "ACCEPTED")
    },

    /**
     * Cancel order
     * TRANSACTION: Updates order, delivery, and payment status atomically
     */
    async cancelOrder(orderId: string): Promise<Order | null> {
        const result = await db.transaction(async (tx) => {
            // 1. Update order status to CANCELLED
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    status: "CANCELLED",
                    updatedAt: new Date()
                })
                .where(eq(orders.id, orderId))
                .returning()

            if (!updatedOrder) {
                throw new Error("Order not found")
            }

            // 2. Update delivery status if exists
            await tx
                .update(deliveries)
                .set({ status: "PENDING" })
                .where(eq(deliveries.orderId, orderId))

            // 3. Refund payment if exists and was completed
            await tx
                .update(payments)
                .set({ status: "REFUNDED" })
                .where(
                    and(
                        eq(payments.orderId, orderId),
                        eq(payments.status, "COMPLETED")
                    )
                )

            return updatedOrder
        })

        return result
    },

    /**
     * Assign delivery agent to order
     * TRANSACTION: Updates delivery and order status atomically
     */
    async assignDeliveryAgent(orderId: string, agentId: string): Promise<boolean> {
        try {
            await db.transaction(async (tx) => {
                // 1. Update delivery record
                const [delivery] = await tx
                    .update(deliveries)
                    .set({
                        deliveryAgentId: agentId,
                        assignedAt: new Date()
                    })
                    .where(eq(deliveries.orderId, orderId))
                    .returning()

                if (!delivery) {
                    throw new Error("Delivery record not found")
                }

                // 2. Update order status to ASSIGNED
                await tx
                    .update(orders)
                    .set({
                        status: "ASSIGNED",
                        updatedAt: new Date()
                    })
                    .where(eq(orders.id, orderId))
            })

            return true
        } catch (error) {
            console.error("Failed to assign delivery agent:", error)
            return false
        }
    },

    /**
     * Count orders with filters (for pagination)
     */
    async count(filters?: OrderFilters): Promise<number> {
        const conditions = []

        if (filters?.customerId) {
            conditions.push(eq(orders.customerId, filters.customerId))
        }

        if (filters?.branchId) {
            conditions.push(eq(orders.branchId, filters.branchId))
        }

        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                conditions.push(inArray(orders.status, filters.status))
            } else {
                conditions.push(eq(orders.status, filters.status))
            }
        }

        if (filters?.deliveryAgentId) {
            const result = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(orders)
                .innerJoin(deliveries, eq(orders.id, deliveries.orderId))
                .where(and(
                    ...conditions,
                    eq(deliveries.deliveryAgentId, filters.deliveryAgentId)
                ))
            return result[0]?.count || 0
        }

        const result = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(orders)
            .where(conditions.length > 0 ? and(...conditions) : undefined)

        return result[0]?.count || 0
    },

    /**
     * Get order statistics
     */
    async getStats(branchId?: string): Promise<{
        totalOrders: number
        pendingOrders: number
        completedOrders: number
        cancelledOrders: number
        totalRevenue: number
    }> {
        const conditions = branchId ? [eq(orders.branchId, branchId)] : []

        const stats = await db
            .select({
                totalOrders: sql<number>`count(*)::int`,
                pendingOrders: sql<number>`count(*) filter (where ${orders.status} in ('CREATED', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP'))::int`,
                completedOrders: sql<number>`count(*) filter (where ${orders.status} = 'DELIVERED')::int`,
                cancelledOrders: sql<number>`count(*) filter (where ${orders.status} = 'CANCELLED')::int`,
                totalRevenue: sql<number>`coalesce(sum(case when ${orders.status} = 'DELIVERED' then ${orders.totalAmount}::numeric else 0 end), 0)`,
            })
            .from(orders)
            .where(conditions.length > 0 ? and(...conditions) : undefined)

        return {
            totalOrders: stats[0]?.totalOrders || 0,
            pendingOrders: stats[0]?.pendingOrders || 0,
            completedOrders: stats[0]?.completedOrders || 0,
            cancelledOrders: stats[0]?.cancelledOrders || 0,
            totalRevenue: stats[0]?.totalRevenue || 0,
        }
    },
}

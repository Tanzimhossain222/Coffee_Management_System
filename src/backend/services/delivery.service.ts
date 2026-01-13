/**
 * Delivery Service
 * Handles delivery management with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import {
    branches,
    coffees,
    deliveries,
    orderItems,
    orders,
    userProfiles
} from "@database/schema"
import type { Delivery } from "@database/schema/delivery.schema"
import { and, desc, eq, inArray, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export type DeliveryStatus = "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED"

export interface DeliveryDetail {
    id: string
    orderId: string
    branchId: string
    branchName: string
    branchAddress: string
    deliveryAgentId: string | null
    deliveryAgentName: string | null
    deliveryAgentPhone: string | null
    status: DeliveryStatus
    assignedAt: Date | null
    pickedUpAt: Date | null
    deliveredAt: Date | null
    createdAt: Date
    // Order details
    customerName: string
    customerPhone: string | null
    deliveryAddress: string | null
    orderTotal: string
    orderStatus: string
    items: {
        coffeeName: string
        quantity: number
    }[]
}

export interface DeliveryFilters {
    agentId?: string
    branchId?: string
    status?: DeliveryStatus | DeliveryStatus[]
}

// ============================================
// Delivery Service
// ============================================

export const deliveryService = {
    /**
     * Get deliveries with full details using multiple JOINs
     */
    async findAll(filters?: DeliveryFilters, limit = 50, offset = 0): Promise<DeliveryDetail[]> {
        const conditions = []

        if (filters?.agentId) {
            conditions.push(eq(deliveries.deliveryAgentId, filters.agentId))
        }

        if (filters?.branchId) {
            conditions.push(eq(deliveries.branchId, filters.branchId))
        }

        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                conditions.push(inArray(deliveries.status, filters.status))
            } else {
                conditions.push(eq(deliveries.status, filters.status))
            }
        }

        // Get deliveries with branch and agent info
        const deliveriesResult = await db
            .select({
                id: deliveries.id,
                orderId: deliveries.orderId,
                branchId: deliveries.branchId,
                branchName: branches.name,
                branchAddress: branches.address,
                deliveryAgentId: deliveries.deliveryAgentId,
                status: deliveries.status,
                assignedAt: deliveries.assignedAt,
                pickedUpAt: deliveries.pickedUpAt,
                deliveredAt: deliveries.deliveredAt,
                createdAt: deliveries.createdAt,
                // Order info
                deliveryAddress: orders.deliveryAddress,
                orderTotal: orders.totalAmount,
                orderStatus: orders.status,
                customerId: orders.customerId,
            })
            .from(deliveries)
            .innerJoin(branches, eq(deliveries.branchId, branches.id))
            .innerJoin(orders, eq(deliveries.orderId, orders.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(deliveries.createdAt))
            .limit(limit)
            .offset(offset)

        if (deliveriesResult.length === 0) {
            return []
        }

        // Get customer info
        const customerIds = [...new Set(deliveriesResult.map(d => d.customerId))]
        const customersResult = await db
            .select({
                authUserId: userProfiles.authUserId,
                name: userProfiles.name,
                phoneNo: userProfiles.phoneNo,
            })
            .from(userProfiles)
            .where(inArray(userProfiles.authUserId, customerIds))

        const customerMap = new Map(customersResult.map(c => [c.authUserId, c]))

        // Get delivery agent info
        const agentIds = deliveriesResult
            .map(d => d.deliveryAgentId)
            .filter((id): id is string => id !== null)

        let agentMap = new Map<string, { name: string; phoneNo: string | null }>()
        if (agentIds.length > 0) {
            const agentsResult = await db
                .select({
                    authUserId: userProfiles.authUserId,
                    name: userProfiles.name,
                    phoneNo: userProfiles.phoneNo,
                })
                .from(userProfiles)
                .where(inArray(userProfiles.authUserId, agentIds))

            agentMap = new Map(agentsResult.map(a => [a.authUserId, a]))
        }

        // Get order items
        const orderIds = deliveriesResult.map(d => d.orderId)
        const itemsResult = await db
            .select({
                orderId: orderItems.orderId,
                coffeeName: coffees.name,
                quantity: orderItems.quantity,
            })
            .from(orderItems)
            .innerJoin(coffees, eq(orderItems.coffeeId, coffees.id))
            .where(inArray(orderItems.orderId, orderIds))

        const itemsByOrder = new Map<string, { coffeeName: string; quantity: number }[]>()
        for (const item of itemsResult) {
            if (!itemsByOrder.has(item.orderId)) {
                itemsByOrder.set(item.orderId, [])
            }
            itemsByOrder.get(item.orderId)!.push({
                coffeeName: item.coffeeName,
                quantity: item.quantity,
            })
        }

        return deliveriesResult.map(delivery => {
            const customer = customerMap.get(delivery.customerId)
            const agent = delivery.deliveryAgentId ? agentMap.get(delivery.deliveryAgentId) : null

            return {
                id: delivery.id,
                orderId: delivery.orderId,
                branchId: delivery.branchId,
                branchName: delivery.branchName,
                branchAddress: delivery.branchAddress,
                deliveryAgentId: delivery.deliveryAgentId,
                deliveryAgentName: agent?.name || null,
                deliveryAgentPhone: agent?.phoneNo || null,
                status: delivery.status as DeliveryStatus,
                assignedAt: delivery.assignedAt,
                pickedUpAt: delivery.pickedUpAt,
                deliveredAt: delivery.deliveredAt,
                createdAt: delivery.createdAt,
                customerName: customer?.name || "Unknown",
                customerPhone: customer?.phoneNo || null,
                deliveryAddress: delivery.deliveryAddress,
                orderTotal: delivery.orderTotal,
                orderStatus: delivery.orderStatus,
                items: itemsByOrder.get(delivery.orderId) || [],
            }
        })
    },

    /**
     * Get single delivery by ID
     */
    async findById(id: string): Promise<DeliveryDetail | null> {
        const result = await db
            .select({ orderId: deliveries.orderId })
            .from(deliveries)
            .where(eq(deliveries.id, id))
            .limit(1)

        if (!result[0]) return null

        const all = await this.findAll({}, 1000, 0)
        return all.find(d => d.id === id) || null
    },

    /**
     * Get delivery by order ID
     */
    async findByOrderId(orderId: string): Promise<DeliveryDetail | null> {
        const all = await this.findAll({}, 1000, 0)
        return all.find(d => d.orderId === orderId) || null
    },

    /**
     * Update delivery status
     */
    async updateStatus(deliveryId: string, status: DeliveryStatus): Promise<Delivery | null> {
        const updateData: Partial<Delivery> = { status }

        // Set timestamps based on status
        if (status === "PICKED_UP") {
            updateData.pickedUpAt = new Date()
        } else if (status === "DELIVERED") {
            updateData.deliveredAt = new Date()
        }

        const [updated] = await db
            .update(deliveries)
            .set(updateData)
            .where(eq(deliveries.id, deliveryId))
            .returning()

        if (!updated) return null

        // Update order status accordingly
        const orderStatusMap: Record<DeliveryStatus, string> = {
            "PENDING": "ASSIGNED",
            "PICKED_UP": "PICKED_UP",
            "IN_TRANSIT": "PICKED_UP",
            "DELIVERED": "DELIVERED",
        }

        await db
            .update(orders)
            .set({
                status: orderStatusMap[status] as "CREATED" | "ACCEPTED" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED",
                updatedAt: new Date()
            })
            .where(eq(orders.id, updated.orderId))

        return updated
    },

    /**
     * Mark delivery as picked up
     */
    async pickUp(deliveryId: string): Promise<Delivery | null> {
        return this.updateStatus(deliveryId, "PICKED_UP")
    },

    /**
     * Mark delivery as in transit
     */
    async inTransit(deliveryId: string): Promise<Delivery | null> {
        return this.updateStatus(deliveryId, "IN_TRANSIT")
    },

    /**
     * Mark delivery as delivered
     */
    async complete(deliveryId: string): Promise<Delivery | null> {
        return this.updateStatus(deliveryId, "DELIVERED")
    },

    /**
     * Get delivery statistics for an agent
     */
    async getAgentStats(agentId: string): Promise<{
        totalDeliveries: number
        pendingDeliveries: number
        completedToday: number
        completedTotal: number
    }> {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const stats = await db
            .select({
                totalDeliveries: sql<number>`count(*)::int`,
                pendingDeliveries: sql<number>`count(*) filter (where ${deliveries.status} in ('PENDING', 'PICKED_UP', 'IN_TRANSIT'))::int`,
                completedToday: sql<number>`count(*) filter (where ${deliveries.status} = 'DELIVERED' and ${deliveries.deliveredAt} >= ${today})::int`,
                completedTotal: sql<number>`count(*) filter (where ${deliveries.status} = 'DELIVERED')::int`,
            })
            .from(deliveries)
            .where(eq(deliveries.deliveryAgentId, agentId))

        return {
            totalDeliveries: stats[0]?.totalDeliveries || 0,
            pendingDeliveries: stats[0]?.pendingDeliveries || 0,
            completedToday: stats[0]?.completedToday || 0,
            completedTotal: stats[0]?.completedTotal || 0,
        }
    },

    /**
     * Get pending deliveries count for a branch
     */
    async getPendingCount(branchId: string): Promise<number> {
        const result = await db
            .select({
                count: sql<number>`count(*)::int`,
            })
            .from(deliveries)
            .where(and(
                eq(deliveries.branchId, branchId),
                inArray(deliveries.status, ["PENDING", "PICKED_UP", "IN_TRANSIT"])
            ))

        return result[0]?.count || 0
    },
}

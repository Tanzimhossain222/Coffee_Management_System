/**
 * Payment Service
 * Handles payment processing with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import { orders, payments, userProfiles } from "@database/schema"
import type { NewPayment, Payment } from "@database/schema/payment.schema"
import { and, desc, eq, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
export type PaymentMethodType = "CASH" | "CARD" | "MOBILE_BANKING" | "WALLET"

export interface PaymentWithOrder {
    id: string
    orderId: string
    customerId: string
    customerName: string
    customerEmail: string
    amount: string
    paymentMethod: PaymentMethodType
    status: PaymentStatus
    transactionId: string | null
    paidAt: Date | null
    createdAt: Date
    // Order info
    orderTotal: string
    orderStatus: string
}

export interface PaymentFilters {
    status?: PaymentStatus
    customerId?: string
    orderId?: string
}

export interface ProcessPaymentInput {
    orderId: string
    customerId: string
    paymentMethod: PaymentMethodType
}

// ============================================
// Payment Service
// ============================================

export const paymentService = {
    /**
     * Find all payments with optional filters
     */
    async findAll(filters?: PaymentFilters, limit = 100, offset = 0): Promise<PaymentWithOrder[]> {
        const conditions: ReturnType<typeof eq>[] = []

        if (filters?.status) {
            conditions.push(eq(payments.status, filters.status))
        }

        if (filters?.customerId) {
            conditions.push(eq(payments.customerId, filters.customerId))
        }

        if (filters?.orderId) {
            conditions.push(eq(payments.orderId, filters.orderId))
        }

        const result = await db
            .select({
                id: payments.id,
                orderId: payments.orderId,
                customerId: payments.customerId,
                customerName: userProfiles.name,
                customerEmail: userProfiles.email,
                amount: payments.amount,
                paymentMethod: payments.paymentMethod,
                status: payments.status,
                transactionId: payments.transactionId,
                paidAt: payments.paidAt,
                createdAt: payments.createdAt,
                orderTotal: orders.totalAmount,
                orderStatus: orders.status,
            })
            .from(payments)
            .innerJoin(orders, eq(payments.orderId, orders.id))
            .innerJoin(userProfiles, eq(userProfiles.authUserId, payments.customerId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(payments.createdAt))
            .limit(limit)
            .offset(offset)

        return result as PaymentWithOrder[]
    },

    /**
     * Get payment by order ID
     */
    async findByOrderId(orderId: string): Promise<PaymentWithOrder | null> {
        const result = await db
            .select({
                id: payments.id,
                orderId: payments.orderId,
                customerId: payments.customerId,
                amount: payments.amount,
                paymentMethod: payments.paymentMethod,
                status: payments.status,
                transactionId: payments.transactionId,
                paidAt: payments.paidAt,
                createdAt: payments.createdAt,
                orderTotal: orders.totalAmount,
                orderStatus: orders.status,
            })
            .from(payments)
            .innerJoin(orders, eq(payments.orderId, orders.id))
            .where(eq(payments.orderId, orderId))
            .limit(1)

        return result[0] as PaymentWithOrder || null
    },

    /**
     * Get payment by ID
     */
    async findById(id: string): Promise<Payment | null> {
        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.id, id))
            .limit(1)

        return payment || null
    },

    /**
     * Process payment (fake processing - simulates real payment)
     * In real app, this would integrate with payment gateway
     * TRANSACTION: Updates payment and order status atomically
     */
    async processPayment(input: ProcessPaymentInput): Promise<{ success: boolean; transactionId: string; payment: Payment }> {
        // Check if payment already exists for order
        const existing = await db
            .select()
            .from(payments)
            .where(eq(payments.orderId, input.orderId))
            .limit(1)

        if (existing.length > 0 && existing[0].status === "COMPLETED") {
            throw new Error("Payment already completed for this order")
        }

        // Generate fake transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // Simulate payment processing delay (1-2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

        // Simulate 95% success rate for demo
        const isSuccess = Math.random() > 0.05

        // BEGIN TRANSACTION: Process payment and update order status atomically
        const result = await db.transaction(async (tx) => {
            let payment: Payment

            if (existing.length > 0) {
                // Update existing payment
                const [updated] = await tx
                    .update(payments)
                    .set({
                        status: isSuccess ? "COMPLETED" : "FAILED",
                        transactionId: isSuccess ? transactionId : null,
                        paidAt: isSuccess ? new Date() : null,
                    })
                    .where(eq(payments.id, existing[0].id))
                    .returning()

                payment = updated
            } else {
                // Get order amount
                const [order] = await tx
                    .select({ totalAmount: orders.totalAmount })
                    .from(orders)
                    .where(eq(orders.id, input.orderId))
                    .limit(1)

                if (!order) {
                    throw new Error("Order not found")
                }

                // Create new payment record
                const [created] = await tx
                    .insert(payments)
                    .values({
                        orderId: input.orderId,
                        customerId: input.customerId,
                        amount: order.totalAmount,
                        paymentMethod: input.paymentMethod,
                        status: isSuccess ? "COMPLETED" : "FAILED",
                        transactionId: isSuccess ? transactionId : null,
                        paidAt: isSuccess ? new Date() : null,
                    } satisfies NewPayment)
                    .returning()

                payment = created
            }

            // Update order status if payment successful
            if (isSuccess) {
                await tx
                    .update(orders)
                    .set({
                        status: "ACCEPTED",
                        updatedAt: new Date()
                    })
                    .where(eq(orders.id, input.orderId))
            }

            return { payment, isSuccess, transactionId }
        })
        // END TRANSACTION

        return {
            success: result.isSuccess,
            transactionId: result.isSuccess ? result.transactionId : "",
            payment: result.payment,
        }
    },

    /**
     * Update payment status
     */
    async updateStatus(paymentId: string, status: PaymentStatus): Promise<Payment | null> {
        const [payment] = await db
            .update(payments)
            .set({
                status,
                ...(status === "COMPLETED" && { paidAt: new Date() }),
            })
            .where(eq(payments.id, paymentId))
            .returning()

        return payment || null
    },

    /**
     * Mark payment as refunded
     */
    async refund(paymentId: string): Promise<Payment | null> {
        return this.updateStatus(paymentId, "REFUNDED")
    },

    /**
     * Get payment statistics
     */
    async getStats(branchId?: string): Promise<{
        totalPayments: number
        completedPayments: number
        pendingPayments: number
        failedPayments: number
        totalAmount: number
    }> {
        const baseQuery = db
            .select({
                totalPayments: sql<number>`count(*)::int`,
                completedPayments: sql<number>`count(*) filter (where ${payments.status} = 'COMPLETED')::int`,
                pendingPayments: sql<number>`count(*) filter (where ${payments.status} = 'PENDING')::int`,
                failedPayments: sql<number>`count(*) filter (where ${payments.status} = 'FAILED')::int`,
                totalAmount: sql<number>`coalesce(sum(case when ${payments.status} = 'COMPLETED' then ${payments.amount}::numeric else 0 end), 0)`,
            })
            .from(payments)

        const stats = branchId
            ? await baseQuery
                .innerJoin(orders, eq(payments.orderId, orders.id))
                .where(eq(orders.branchId, branchId))
            : await baseQuery

        return {
            totalPayments: stats[0]?.totalPayments || 0,
            completedPayments: stats[0]?.completedPayments || 0,
            pendingPayments: stats[0]?.pendingPayments || 0,
            failedPayments: stats[0]?.failedPayments || 0,
            totalAmount: parseFloat(String(stats[0]?.totalAmount || 0)),
        }
    },
}

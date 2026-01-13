/**
 * Cart Service
 * Handles shopping cart operations with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import { cart, coffeeCategories, coffees } from "@database/schema"
import type { Cart, NewCart } from "@database/schema/cart.schema"
import { and, eq, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export interface CartItem {
    id: string
    customerId: string
    coffeeId: string
    quantity: number
    createdAt: Date
    updatedAt: Date
    // Joined coffee data
    coffeeName: string
    coffeePrice: string
    coffeeImageUrl: string | null
    coffeeAvailable: boolean
    categoryName: string | null
}

export interface CartSummary {
    items: CartItem[]
    totalItems: number
    totalAmount: number
}

export interface AddToCartInput {
    customerId: string
    coffeeId: string
    quantity: number
}

// ============================================
// Cart Service
// ============================================

export const cartService = {
    /**
     * Get cart items for a customer with coffee details using LEFT JOIN
     */
    async getCart(customerId: string): Promise<CartSummary> {
        const items = await db
            .select({
                id: cart.id,
                customerId: cart.customerId,
                coffeeId: cart.coffeeId,
                quantity: cart.quantity,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt,
                coffeeName: coffees.name,
                coffeePrice: coffees.price,
                coffeeImageUrl: coffees.imageUrl,
                coffeeAvailable: coffees.available,
                categoryName: coffeeCategories.name,
            })
            .from(cart)
            .innerJoin(coffees, eq(cart.coffeeId, coffees.id))
            .leftJoin(coffeeCategories, eq(coffees.categoryId, coffeeCategories.id))
            .where(eq(cart.customerId, customerId))
            .orderBy(cart.createdAt)

        // Calculate totals
        let totalItems = 0
        let totalAmount = 0

        for (const item of items) {
            totalItems += item.quantity
            totalAmount += parseFloat(item.coffeePrice) * item.quantity
        }

        return {
            items,
            totalItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
        }
    },

    /**
     * Add item to cart or update quantity if exists
     */
    async addItem(input: AddToCartInput): Promise<Cart> {
        // Check if item already exists in cart
        const [existing] = await db
            .select()
            .from(cart)
            .where(and(
                eq(cart.customerId, input.customerId),
                eq(cart.coffeeId, input.coffeeId)
            ))
            .limit(1)

        if (existing) {
            // Update quantity
            const [updated] = await db
                .update(cart)
                .set({
                    quantity: existing.quantity + input.quantity,
                    updatedAt: new Date()
                })
                .where(eq(cart.id, existing.id))
                .returning()

            return updated
        }

        // Insert new item
        const [newItem] = await db
            .insert(cart)
            .values({
                customerId: input.customerId,
                coffeeId: input.coffeeId,
                quantity: input.quantity,
            } satisfies NewCart)
            .returning()

        return newItem
    },

    /**
     * Update cart item quantity
     */
    async updateQuantity(cartId: string, customerId: string, quantity: number): Promise<Cart | null> {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            await this.removeItem(cartId, customerId)
            return null
        }

        const [updated] = await db
            .update(cart)
            .set({
                quantity,
                updatedAt: new Date()
            })
            .where(and(
                eq(cart.id, cartId),
                eq(cart.customerId, customerId)
            ))
            .returning()

        return updated || null
    },

    /**
     * Remove item from cart
     */
    async removeItem(cartId: string, customerId: string): Promise<boolean> {
        const result = await db
            .delete(cart)
            .where(and(
                eq(cart.id, cartId),
                eq(cart.customerId, customerId)
            ))
            .returning({ id: cart.id })

        return result.length > 0
    },

    /**
     * Clear entire cart for a customer
     */
    async clearCart(customerId: string): Promise<number> {
        const result = await db
            .delete(cart)
            .where(eq(cart.customerId, customerId))
            .returning({ id: cart.id })

        return result.length
    },

    /**
     * Get cart item count
     */
    async getItemCount(customerId: string): Promise<number> {
        const result = await db
            .select({
                count: sql<number>`sum(${cart.quantity})::int`,
            })
            .from(cart)
            .where(eq(cart.customerId, customerId))

        return result[0]?.count || 0
    },
}

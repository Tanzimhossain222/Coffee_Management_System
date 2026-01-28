/**
 * Coffee Service
 * Handles all coffee menu operations with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import { coffeeCategories, coffees } from "@database/schema"
import type { Coffee, CoffeeCategory, NewCoffee, NewCoffeeCategory } from "@database/schema/coffee.schema"
import { and, eq, ilike, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export interface CoffeeWithCategory extends Coffee {
    categoryName: string | null
}

export interface CoffeeFilters {
    categoryId?: string
    available?: boolean
    search?: string
    page?: number
    limit?: number
}

export interface CreateCoffeeInput {
    name: string
    description?: string
    price: number
    imageUrl?: string
    categoryId?: string
    available?: boolean
}

export interface UpdateCoffeeInput {
    name?: string
    description?: string
    price?: number
    imageUrl?: string
    categoryId?: string
    available?: boolean
}

// ============================================
// Coffee Service
// ============================================

export const coffeeService = {
    /**
     * Get all coffees with category name using LEFT JOIN
     */
    async findAll(filters?: CoffeeFilters): Promise<{ coffees: CoffeeWithCategory[], total: number }> {
        // Build WHERE conditions
        const conditions = []

        if (filters?.categoryId) {
            conditions.push(eq(coffees.categoryId, filters.categoryId))
        }

        if (filters?.available !== undefined) {
            conditions.push(eq(coffees.available, filters.available))
        }

        if (filters?.search) {
            conditions.push(ilike(coffees.name, `%${filters.search}%`))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(coffees)
            .where(whereClause)

        const total = Number(totalResult[0]?.count || 0)

        // SQL-like query with LEFT JOIN and pagination
        const limit = filters?.limit || 12
        const offset = ((filters?.page || 1) - 1) * limit

        const result = await db
            .select({
                id: coffees.id,
                name: coffees.name,
                description: coffees.description,
                price: coffees.price,
                imageUrl: coffees.imageUrl,
                categoryId: coffees.categoryId,
                available: coffees.available,
                createdAt: coffees.createdAt,
                updatedAt: coffees.updatedAt,
                categoryName: coffeeCategories.name,
            })
            .from(coffees)
            .leftJoin(coffeeCategories, eq(coffees.categoryId, coffeeCategories.id))
            .where(whereClause)
            .orderBy(coffees.name)
            .limit(limit)
            .offset(offset)

        return { coffees: result, total }
    },

    /**
     * Get single coffee by ID with category
     */
    async findById(id: string): Promise<CoffeeWithCategory | null> {
        const result = await db
            .select({
                id: coffees.id,
                name: coffees.name,
                description: coffees.description,
                price: coffees.price,
                imageUrl: coffees.imageUrl,
                categoryId: coffees.categoryId,
                available: coffees.available,
                createdAt: coffees.createdAt,
                updatedAt: coffees.updatedAt,
                categoryName: coffeeCategories.name,
            })
            .from(coffees)
            .leftJoin(coffeeCategories, eq(coffees.categoryId, coffeeCategories.id))
            .where(eq(coffees.id, id))
            .limit(1)

        return result[0] || null
    },

    /**
     * Get related coffees (same category, excluding current coffee)
     */
    async findRelated(coffeeId: string, limit = 4): Promise<CoffeeWithCategory[]> {
        // Get the category of current coffee
        const [current] = await db
            .select({ categoryId: coffees.categoryId })
            .from(coffees)
            .where(eq(coffees.id, coffeeId))
            .limit(1)

        if (!current?.categoryId) {
            // No category, return random available coffees
            return db
                .select({
                    id: coffees.id,
                    name: coffees.name,
                    description: coffees.description,
                    price: coffees.price,
                    imageUrl: coffees.imageUrl,
                    categoryId: coffees.categoryId,
                    available: coffees.available,
                    createdAt: coffees.createdAt,
                    updatedAt: coffees.updatedAt,
                    categoryName: coffeeCategories.name,
                })
                .from(coffees)
                .leftJoin(coffeeCategories, eq(coffees.categoryId, coffeeCategories.id))
                .where(and(
                    eq(coffees.available, true),
                    sql`${coffees.id} != ${coffeeId}`
                ))
                .limit(limit)
        }

        // Get coffees from same category
        return db
            .select({
                id: coffees.id,
                name: coffees.name,
                description: coffees.description,
                price: coffees.price,
                imageUrl: coffees.imageUrl,
                categoryId: coffees.categoryId,
                available: coffees.available,
                createdAt: coffees.createdAt,
                updatedAt: coffees.updatedAt,
                categoryName: coffeeCategories.name,
            })
            .from(coffees)
            .leftJoin(coffeeCategories, eq(coffees.categoryId, coffeeCategories.id))
            .where(and(
                eq(coffees.categoryId, current.categoryId),
                eq(coffees.available, true),
                sql`${coffees.id} != ${coffeeId}`
            ))
            .limit(limit)
    },

    /**
     * Create new coffee
     */
    async create(input: CreateCoffeeInput): Promise<Coffee> {
        const [coffee] = await db
            .insert(coffees)
            .values({
                name: input.name,
                description: input.description,
                price: input.price.toFixed(2),
                imageUrl: input.imageUrl,
                categoryId: input.categoryId,
                available: input.available ?? true,
            } satisfies NewCoffee)
            .returning()

        return coffee
    },

    /**
     * Update coffee
     */
    async update(id: string, input: UpdateCoffeeInput): Promise<Coffee | null> {
        const updateData: Partial<NewCoffee> = {}

        if (input.name !== undefined) updateData.name = input.name
        if (input.description !== undefined) updateData.description = input.description
        if (input.price !== undefined) updateData.price = input.price.toFixed(2)
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl
        if (input.categoryId !== undefined) updateData.categoryId = input.categoryId
        if (input.available !== undefined) updateData.available = input.available

        updateData.updatedAt = new Date()

        const [coffee] = await db
            .update(coffees)
            .set(updateData)
            .where(eq(coffees.id, id))
            .returning()

        return coffee || null
    },

    /**
     * Delete coffee
     */
    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(coffees)
            .where(eq(coffees.id, id))
            .returning({ id: coffees.id })

        return result.length > 0
    },

    /**
     * Toggle coffee availability
     */
    async toggleAvailability(id: string): Promise<Coffee | null> {
        // Get current state
        const [current] = await db
            .select({ available: coffees.available })
            .from(coffees)
            .where(eq(coffees.id, id))
            .limit(1)

        if (!current) return null

        // Toggle
        const [updated] = await db
            .update(coffees)
            .set({
                available: !current.available,
                updatedAt: new Date()
            })
            .where(eq(coffees.id, id))
            .returning()

        return updated
    },

    // ============================================
    // Category Operations
    // ============================================

    /**
     * Get all categories with coffee count
     */
    async findAllCategories(): Promise<(CoffeeCategory & { coffeeCount: number })[]> {
        const result = await db
            .select({
                id: coffeeCategories.id,
                name: coffeeCategories.name,
                description: coffeeCategories.description,
                coffeeCount: sql<number>`count(${coffees.id})::int`,
            })
            .from(coffeeCategories)
            .leftJoin(coffees, eq(coffeeCategories.id, coffees.categoryId))
            .groupBy(coffeeCategories.id, coffeeCategories.name, coffeeCategories.description)
            .orderBy(coffeeCategories.name)

        return result
    },

    /**
     * Create category
     */
    async createCategory(name: string, description?: string): Promise<CoffeeCategory> {
        const [category] = await db
            .insert(coffeeCategories)
            .values({
                name,
                description,
            } satisfies NewCoffeeCategory)
            .returning()

        return category
    },

    /**
     * Update category
     */
    async updateCategory(id: string, name: string, description?: string): Promise<CoffeeCategory | null> {
        const [category] = await db
            .update(coffeeCategories)
            .set({ name, description })
            .where(eq(coffeeCategories.id, id))
            .returning()

        return category || null
    },

    /**
     * Delete category
     */
    async deleteCategory(id: string): Promise<boolean> {
        // First, remove category reference from coffees
        await db
            .update(coffees)
            .set({ categoryId: null })
            .where(eq(coffees.categoryId, id))

        const result = await db
            .delete(coffeeCategories)
            .where(eq(coffeeCategories.id, id))
            .returning({ id: coffeeCategories.id })

        return result.length > 0
    },
}

/**
 * Review Service
 * Handles coffee reviews with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import { authUsers, coffees, reviews, userProfiles } from "@database/schema"
import type { NewReview, Review } from "@database/schema/review.schema"
import { and, desc, eq, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export interface ReviewWithUser {
    id: string
    coffeeId: string
    customerId: string
    customerName: string
    rating: number
    content: string | null
    createdAt: Date
    updatedAt: Date
}

export interface ReviewSummary {
    coffeeId: string
    averageRating: number
    totalReviews: number
}

export interface CreateReviewInput {
    customerId: string
    coffeeId: string
    rating: number
    content?: string
}

export interface ReviewWithCoffee {
    id: string
    coffeeId: string
    coffeeName: string
    customerId: string
    customerName: string
    rating: number
    content: string | null
    createdAt: Date
}

export interface ReviewFilters {
    coffeeId?: string
    customerId?: string
    minRating?: number
}

// ============================================
// Review Service
// ============================================

export const reviewService = {
    /**
     * Get all reviews with optional filters (for admin view)
     */
    async findAll(filters?: ReviewFilters, limit = 100, offset = 0): Promise<ReviewWithCoffee[]> {
        const conditions: ReturnType<typeof eq>[] = []

        if (filters?.coffeeId) {
            conditions.push(eq(reviews.coffeeId, filters.coffeeId))
        }

        if (filters?.customerId) {
            conditions.push(eq(reviews.customerId, filters.customerId))
        }

        // For minRating, we use a different approach since it's a comparison
        let minRatingCondition = undefined
        if (filters?.minRating) {
            if (filters.minRating === 1) {
                // 1-2 stars (low ratings)
                minRatingCondition = sql`${reviews.rating} <= 2`
            } else {
                minRatingCondition = sql`${reviews.rating} >= ${filters.minRating}`
            }
        }

        const result = await db
            .select({
                id: reviews.id,
                coffeeId: reviews.coffeeId,
                coffeeName: coffees.name,
                customerId: reviews.customerId,
                customerName: userProfiles.name,
                rating: reviews.rating,
                content: reviews.content,
                createdAt: reviews.createdAt,
            })
            .from(reviews)
            .innerJoin(coffees, eq(reviews.coffeeId, coffees.id))
            .innerJoin(authUsers, eq(reviews.customerId, authUsers.id))
            .innerJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .where(conditions.length > 0 || minRatingCondition
                ? and(...conditions, minRatingCondition)
                : undefined
            )
            .orderBy(desc(reviews.createdAt))
            .limit(limit)
            .offset(offset)

        return result
    },

    /**
     * Get all reviews for a coffee with user info using JOIN
     */
    async findByCoffeeId(coffeeId: string, limit = 20, offset = 0): Promise<ReviewWithUser[]> {
        const result = await db
            .select({
                id: reviews.id,
                coffeeId: reviews.coffeeId,
                customerId: reviews.customerId,
                customerName: userProfiles.name,
                rating: reviews.rating,
                content: reviews.content,
                createdAt: reviews.createdAt,
                updatedAt: reviews.updatedAt,
            })
            .from(reviews)
            .innerJoin(authUsers, eq(reviews.customerId, authUsers.id))
            .innerJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .where(eq(reviews.coffeeId, coffeeId))
            .orderBy(desc(reviews.createdAt))
            .limit(limit)
            .offset(offset)

        return result
    },

    /**
     * Get review summary (average rating and count) for a coffee
     */
    async getSummary(coffeeId: string): Promise<ReviewSummary> {
        const result = await db
            .select({
                coffeeId: reviews.coffeeId,
                averageRating: sql<number>`coalesce(avg(${reviews.rating})::numeric(10,1), 0)`,
                totalReviews: sql<number>`count(*)::int`,
            })
            .from(reviews)
            .where(eq(reviews.coffeeId, coffeeId))
            .groupBy(reviews.coffeeId)

        return result[0] || {
            coffeeId,
            averageRating: 0,
            totalReviews: 0,
        }
    },

    /**
     * Get summaries for multiple coffees (for list view)
     */
    async getSummaries(coffeeIds: string[]): Promise<Map<string, ReviewSummary>> {
        if (coffeeIds.length === 0) return new Map()

        const result = await db
            .select({
                coffeeId: reviews.coffeeId,
                averageRating: sql<number>`coalesce(avg(${reviews.rating})::numeric(10,1), 0)`,
                totalReviews: sql<number>`count(*)::int`,
            })
            .from(reviews)
            .where(sql`${reviews.coffeeId} = ANY(${coffeeIds})`)
            .groupBy(reviews.coffeeId)

        const map = new Map<string, ReviewSummary>()
        for (const row of result) {
            map.set(row.coffeeId, row)
        }

        return map
    },

    /**
     * Create a new review
     */
    async create(input: CreateReviewInput): Promise<Review> {
        // Check if user already reviewed this coffee
        const existing = await db
            .select({ id: reviews.id })
            .from(reviews)
            .where(and(
                eq(reviews.customerId, input.customerId),
                eq(reviews.coffeeId, input.coffeeId)
            ))
            .limit(1)

        if (existing.length > 0) {
            throw new Error("You have already reviewed this coffee")
        }

        // Validate rating
        if (input.rating < 1 || input.rating > 5) {
            throw new Error("Rating must be between 1 and 5")
        }

        const [review] = await db
            .insert(reviews)
            .values({
                customerId: input.customerId,
                coffeeId: input.coffeeId,
                rating: input.rating,
                content: input.content,
            } satisfies NewReview)
            .returning()

        return review
    },

    /**
     * Update a review
     */
    async update(reviewId: string, customerId: string, rating: number, content?: string): Promise<Review | null> {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5")
        }

        const [review] = await db
            .update(reviews)
            .set({
                rating,
                content,
                updatedAt: new Date()
            })
            .where(and(
                eq(reviews.id, reviewId),
                eq(reviews.customerId, customerId)
            ))
            .returning()

        return review || null
    },

    /**
     * Delete a review (user can only delete their own)
     */
    async delete(reviewId: string, customerId: string): Promise<boolean> {
        const result = await db
            .delete(reviews)
            .where(and(
                eq(reviews.id, reviewId),
                eq(reviews.customerId, customerId)
            ))
            .returning({ id: reviews.id })

        return result.length > 0
    },

    /**
     * Admin delete - can delete any review by ID
     */
    async adminDelete(reviewId: string): Promise<boolean> {
        const result = await db
            .delete(reviews)
            .where(eq(reviews.id, reviewId))
            .returning({ id: reviews.id })

        return result.length > 0
    },

    /**
     * Get user's review for a specific coffee
     */
    async getUserReview(customerId: string, coffeeId: string): Promise<Review | null> {
        const [review] = await db
            .select()
            .from(reviews)
            .where(and(
                eq(reviews.customerId, customerId),
                eq(reviews.coffeeId, coffeeId)
            ))
            .limit(1)

        return review || null
    },

    /**
     * Count total reviews for pagination
     */
    async countByCoffeeId(coffeeId: string): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(reviews)
            .where(eq(reviews.coffeeId, coffeeId))

        return result[0]?.count || 0
    },
}

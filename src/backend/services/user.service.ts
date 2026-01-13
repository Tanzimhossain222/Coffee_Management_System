/**
 * User Service
 * Handles user management operations (CRUD) for admin/manager dashboard
 */

import { db } from "@database/client"
import { authUsers, userProfiles } from "@database/schema"
import { branches } from "@database/schema/branch.schema"
import { and, count, eq, ilike, or } from "drizzle-orm"

// ============================================
// Types
// ============================================

export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "STAFF" | "DELIVERY"
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface UserWithProfile {
    id: string
    email: string
    username: string
    role: string
    verified: boolean
    status: string
    name: string
    phoneNo: string | null
    address: string | null
    branchId: string | null
    branchName: string | null
    createdAt: Date
    updatedAt: Date
}

export interface UserFilters {
    role?: UserRole
    branchId?: string
    status?: UserStatus
    search?: string
    verified?: boolean
}

export interface CreateUserInput {
    email: string
    username?: string
    passwordHash: string
    role: UserRole
    name: string
    phoneNo?: string
    address?: string
    branchId?: string
    verified?: boolean
}

export interface UpdateUserInput {
    role?: UserRole
    status?: UserStatus
    verified?: boolean
    name?: string
    phoneNo?: string
    address?: string
    branchId?: string
}

// ============================================
// User Service
// ============================================

export const userService = {
    /**
     * Find all users with optional filters
     * Uses SQL-like Drizzle syntax with explicit JOINs
     */
    async findAll(filters?: UserFilters, limit = 100, offset = 0): Promise<UserWithProfile[]> {
        // Build WHERE conditions
        const conditions: ReturnType<typeof eq>[] = []

        if (filters?.role) {
            conditions.push(eq(authUsers.role, filters.role))
        }

        if (filters?.branchId) {
            conditions.push(eq(userProfiles.branchId, filters.branchId))
        }

        if (filters?.status) {
            conditions.push(eq(authUsers.status, filters.status))
        }

        if (filters?.verified !== undefined) {
            conditions.push(eq(authUsers.verified, filters.verified))
        }

        if (filters?.search) {
            conditions.push(
                or(
                    ilike(userProfiles.name, `%${filters.search}%`),
                    ilike(authUsers.email, `%${filters.search}%`)
                )!
            )
        }

        const result = await db
            .select({
                id: authUsers.id,
                email: authUsers.email,
                username: authUsers.username,
                role: authUsers.role,
                verified: authUsers.verified,
                status: authUsers.status,
                name: userProfiles.name,
                phoneNo: userProfiles.phoneNo,
                address: userProfiles.address,
                branchId: userProfiles.branchId,
                branchName: branches.name,
                createdAt: authUsers.createdAt,
                updatedAt: authUsers.updatedAt,
            })
            .from(authUsers)
            .innerJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
            .leftJoin(branches, eq(branches.id, userProfiles.branchId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(authUsers.createdAt)
            .limit(limit)
            .offset(offset)

        return result
    },

    /**
     * Find a single user by ID
     */
    async findById(id: string): Promise<UserWithProfile | null> {
        const result = await db
            .select({
                id: authUsers.id,
                email: authUsers.email,
                username: authUsers.username,
                role: authUsers.role,
                verified: authUsers.verified,
                status: authUsers.status,
                name: userProfiles.name,
                phoneNo: userProfiles.phoneNo,
                address: userProfiles.address,
                branchId: userProfiles.branchId,
                branchName: branches.name,
                createdAt: authUsers.createdAt,
                updatedAt: authUsers.updatedAt,
            })
            .from(authUsers)
            .innerJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
            .leftJoin(branches, eq(branches.id, userProfiles.branchId))
            .where(eq(authUsers.id, id))
            .limit(1)

        return result[0] || null
    },

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<UserWithProfile | null> {
        const result = await db
            .select({
                id: authUsers.id,
                email: authUsers.email,
                username: authUsers.username,
                role: authUsers.role,
                verified: authUsers.verified,
                status: authUsers.status,
                name: userProfiles.name,
                phoneNo: userProfiles.phoneNo,
                address: userProfiles.address,
                branchId: userProfiles.branchId,
                branchName: branches.name,
                createdAt: authUsers.createdAt,
                updatedAt: authUsers.updatedAt,
            })
            .from(authUsers)
            .innerJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
            .leftJoin(branches, eq(branches.id, userProfiles.branchId))
            .where(eq(authUsers.email, email.toLowerCase()))
            .limit(1)

        return result[0] || null
    },

    /**
     * Update user (auth + profile data)
     */
    async update(id: string, data: UpdateUserInput): Promise<UserWithProfile | null> {
        // Update auth user if needed
        const authUpdate: Partial<typeof authUsers.$inferInsert> = {}
        if (data.role) authUpdate.role = data.role
        if (data.status) authUpdate.status = data.status
        if (data.verified !== undefined) authUpdate.verified = data.verified

        if (Object.keys(authUpdate).length > 0) {
            authUpdate.updatedAt = new Date()
            await db
                .update(authUsers)
                .set(authUpdate)
                .where(eq(authUsers.id, id))
        }

        // Update profile if needed
        const profileUpdate: Partial<typeof userProfiles.$inferInsert> = {}
        if (data.name) profileUpdate.name = data.name
        if (data.phoneNo !== undefined) profileUpdate.phoneNo = data.phoneNo
        if (data.address !== undefined) profileUpdate.address = data.address
        if (data.branchId !== undefined) profileUpdate.branchId = data.branchId

        if (Object.keys(profileUpdate).length > 0) {
            profileUpdate.updatedAt = new Date()
            await db
                .update(userProfiles)
                .set(profileUpdate)
                .where(eq(userProfiles.authUserId, id))
        }

        return this.findById(id)
    },

    /**
     * Delete user (cascades to profile via FK)
     */
    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(authUsers)
            .where(eq(authUsers.id, id))
            .returning({ id: authUsers.id })

        return result.length > 0
    },

    /**
     * Count users with optional filters
     */
    async count(filters?: UserFilters): Promise<number> {
        const conditions: ReturnType<typeof eq>[] = []

        if (filters?.role) {
            conditions.push(eq(authUsers.role, filters.role))
        }

        if (filters?.branchId) {
            conditions.push(eq(userProfiles.branchId, filters.branchId))
        }

        if (filters?.status) {
            conditions.push(eq(authUsers.status, filters.status))
        }

        const result = await db
            .select({ count: count() })
            .from(authUsers)
            .innerJoin(userProfiles, eq(userProfiles.authUserId, authUsers.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)

        return result[0]?.count || 0
    },

    /**
     * Get user counts by role
     */
    async getCountsByRole(): Promise<Record<string, number>> {
        const result = await db
            .select({
                role: authUsers.role,
                count: count(),
            })
            .from(authUsers)
            .groupBy(authUsers.role)

        return result.reduce((acc, row) => {
            acc[row.role] = row.count
            return acc
        }, {} as Record<string, number>)
    },

    /**
     * Get users by branch (for manager view)
     */
    async findByBranch(branchId: string): Promise<UserWithProfile[]> {
        return this.findAll({ branchId })
    },

    /**
     * Activate user
     */
    async activate(id: string): Promise<UserWithProfile | null> {
        return this.update(id, { status: "ACTIVE" })
    },

    /**
     * Suspend user
     */
    async suspend(id: string): Promise<UserWithProfile | null> {
        return this.update(id, { status: "SUSPENDED" })
    },

    /**
     * Verify user
     */
    async verify(id: string): Promise<UserWithProfile | null> {
        return this.update(id, { verified: true })
    },
}

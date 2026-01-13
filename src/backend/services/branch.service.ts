/**
 * Branch Service
 * Handles branch and staff management with SQL-like Drizzle queries
 */

import { db } from "@database/client"
import { authUsers, branches, userProfiles } from "@database/schema"
import type { UserProfile } from "@database/schema/auth.schema"
import type { Branch, NewBranch } from "@database/schema/branch.schema"
import { and, eq, sql } from "drizzle-orm"

// ============================================
// Types
// ============================================

export interface BranchWithManager extends Branch {
    managerName: string | null
    managerEmail: string | null
}

export interface BranchWithStats extends BranchWithManager {
    staffCount: number
    orderCount: number
}

export interface StaffMember {
    id: string
    authUserId: string
    name: string
    email: string
    phoneNo: string | null
    role: string
    branchId: string | null
    branchName: string | null
}

export interface CreateBranchInput {
    name: string
    address: string
    city: string
    phoneNo?: string
    email?: string
    managerId?: string
    openingTime?: string
    closingTime?: string
}

export interface UpdateBranchInput {
    name?: string
    address?: string
    city?: string
    phoneNo?: string
    email?: string
    managerId?: string
    isActive?: boolean
    openingTime?: string
    closingTime?: string
}

// ============================================
// Branch Service
// ============================================

export const branchService = {
    /**
     * Get all branches with manager info using LEFT JOIN
     */
    async findAll(includeInactive = false): Promise<BranchWithManager[]> {
        const conditions = []
        if (!includeInactive) {
            conditions.push(eq(branches.isActive, true))
        }

        const result = await db
            .select({
                id: branches.id,
                name: branches.name,
                address: branches.address,
                city: branches.city,
                phoneNo: branches.phoneNo,
                email: branches.email,
                managerId: branches.managerId,
                isActive: branches.isActive,
                openingTime: branches.openingTime,
                closingTime: branches.closingTime,
                createdAt: branches.createdAt,
                updatedAt: branches.updatedAt,
                managerName: userProfiles.name,
                managerEmail: authUsers.email,
            })
            .from(branches)
            .leftJoin(authUsers, eq(branches.managerId, authUsers.id))
            .leftJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(branches.name)

        return result
    },

    /**
     * Get branch by ID with manager info
     */
    async findById(id: string): Promise<BranchWithManager | null> {
        const result = await db
            .select({
                id: branches.id,
                name: branches.name,
                address: branches.address,
                city: branches.city,
                phoneNo: branches.phoneNo,
                email: branches.email,
                managerId: branches.managerId,
                isActive: branches.isActive,
                openingTime: branches.openingTime,
                closingTime: branches.closingTime,
                createdAt: branches.createdAt,
                updatedAt: branches.updatedAt,
                managerName: userProfiles.name,
                managerEmail: authUsers.email,
            })
            .from(branches)
            .leftJoin(authUsers, eq(branches.managerId, authUsers.id))
            .leftJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .where(eq(branches.id, id))
            .limit(1)

        return result[0] || null
    },

    /**
     * Create new branch
     */
    async create(input: CreateBranchInput): Promise<Branch> {
        const [branch] = await db
            .insert(branches)
            .values({
                name: input.name,
                address: input.address,
                city: input.city,
                phoneNo: input.phoneNo,
                email: input.email,
                managerId: input.managerId,
                openingTime: input.openingTime,
                closingTime: input.closingTime,
                isActive: true,
            } satisfies NewBranch)
            .returning()

        return branch
    },

    /**
     * Update branch
     */
    async update(id: string, input: UpdateBranchInput): Promise<Branch | null> {
        const updateData: Partial<NewBranch> = {}

        if (input.name !== undefined) updateData.name = input.name
        if (input.address !== undefined) updateData.address = input.address
        if (input.city !== undefined) updateData.city = input.city
        if (input.phoneNo !== undefined) updateData.phoneNo = input.phoneNo
        if (input.email !== undefined) updateData.email = input.email
        if (input.managerId !== undefined) updateData.managerId = input.managerId
        if (input.isActive !== undefined) updateData.isActive = input.isActive
        if (input.openingTime !== undefined) updateData.openingTime = input.openingTime
        if (input.closingTime !== undefined) updateData.closingTime = input.closingTime

        updateData.updatedAt = new Date()

        const [branch] = await db
            .update(branches)
            .set(updateData)
            .where(eq(branches.id, id))
            .returning()

        return branch || null
    },

    /**
     * Delete branch (soft delete by setting isActive = false)
     */
    async delete(id: string): Promise<boolean> {
        const result = await db
            .update(branches)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(branches.id, id))
            .returning({ id: branches.id })

        return result.length > 0
    },

    /**
     * Get staff members for a branch using INNER JOIN
     */
    async getStaff(branchId: string): Promise<StaffMember[]> {
        const result = await db
            .select({
                id: userProfiles.id,
                authUserId: userProfiles.authUserId,
                name: userProfiles.name,
                email: userProfiles.email,
                phoneNo: userProfiles.phoneNo,
                role: authUsers.role,
                branchId: userProfiles.branchId,
                branchName: branches.name,
            })
            .from(userProfiles)
            .innerJoin(authUsers, eq(userProfiles.authUserId, authUsers.id))
            .leftJoin(branches, eq(userProfiles.branchId, branches.id))
            .where(eq(userProfiles.branchId, branchId))
            .orderBy(userProfiles.name)

        return result
    },

    /**
     * Get all delivery agents (for assignment dropdown)
     */
    async getDeliveryAgents(branchId?: string): Promise<StaffMember[]> {
        const conditions = [eq(authUsers.role, "DELIVERY"), eq(authUsers.status, "ACTIVE")]

        if (branchId) {
            conditions.push(eq(userProfiles.branchId, branchId))
        }

        const result = await db
            .select({
                id: userProfiles.id,
                authUserId: userProfiles.authUserId,
                name: userProfiles.name,
                email: userProfiles.email,
                phoneNo: userProfiles.phoneNo,
                role: authUsers.role,
                branchId: userProfiles.branchId,
                branchName: branches.name,
            })
            .from(userProfiles)
            .innerJoin(authUsers, eq(userProfiles.authUserId, authUsers.id))
            .leftJoin(branches, eq(userProfiles.branchId, branches.id))
            .where(and(...conditions))
            .orderBy(userProfiles.name)

        return result
    },

    /**
     * Assign staff to branch
     */
    async assignStaffToBranch(authUserId: string, branchId: string | null): Promise<UserProfile | null> {
        const [profile] = await db
            .update(userProfiles)
            .set({
                branchId,
                updatedAt: new Date()
            })
            .where(eq(userProfiles.authUserId, authUserId))
            .returning()

        return profile || null
    },

    /**
     * Get managers without a branch (for assignment)
     */
    async getAvailableManagers(): Promise<StaffMember[]> {
        const result = await db
            .select({
                id: userProfiles.id,
                authUserId: userProfiles.authUserId,
                name: userProfiles.name,
                email: userProfiles.email,
                phoneNo: userProfiles.phoneNo,
                role: authUsers.role,
                branchId: userProfiles.branchId,
                branchName: sql<string | null>`null`,
            })
            .from(userProfiles)
            .innerJoin(authUsers, eq(userProfiles.authUserId, authUsers.id))
            .where(and(
                eq(authUsers.role, "MANAGER"),
                eq(authUsers.status, "ACTIVE")
            ))
            .orderBy(userProfiles.name)

        return result
    },
}

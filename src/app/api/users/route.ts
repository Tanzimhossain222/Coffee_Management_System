/**
 * Users API Routes
 * GET /api/users - Get users by role and filters
 */

import { db } from "@/backend/database/client"
import { authUsers, branches, userProfiles } from "@/backend/database/schema"
import { authService } from "@/backend/services"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Helper to get current user
async function getCurrentUser(request: NextRequest) {
    const cookieStore = await cookies()
    let token = cookieStore.get("auth_token")?.value

    if (!token) {
        const authHeader = request.headers.get("authorization")
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring(7)
        }
    }

    if (!token) return null

    try {
        return await authService.getUserFromToken(token)
    } catch {
        return null
    }
}

/**
 * GET /api/users
 * Get users by role (ADMIN only)
 * Query params:
 *   - role: ADMIN, MANAGER, DELIVERY, STAFF, CUSTOMER
 *   - available: true/false (for managers without branches assigned)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Admin access required" },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role") as "ADMIN" | "MANAGER" | "DELIVERY" | "STAFF" | "CUSTOMER" | null
        const available = searchParams.get("available") === "true"

        const conditions = [eq(authUsers.status, "ACTIVE")]

        // Filter by role if provided
        if (role) {
            conditions.push(eq(authUsers.role, role))
        }

        // Get users from database with optional branch info
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

        // Filter for available managers (without branch assignment)
        let filteredResult = result
        if (available && role === "MANAGER") {
            filteredResult = result.filter(u => !u.branchId)
        }

        return NextResponse.json({
            success: true,
            data: filteredResult,
        })
    } catch (error) {
        console.error("Get users error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

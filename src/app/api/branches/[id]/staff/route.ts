/**
 * Branches [id] Staff API Routes
 * GET /api/branches/[id]/staff - Get staff for a branch
 * GET /api/branches/[id]/delivery-agents - Get delivery agents for a branch
 */

import { authService, branchService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
    params: Promise<{ id: string }>
}

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
 * GET /api/branches/[id]/staff
 * Get all staff members for a branch
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (!["ADMIN", "MANAGER"].includes(user.role)) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const staff = await branchService.getStaff(id)

        return NextResponse.json({
            success: true,
            data: staff,
        })
    } catch (error) {
        console.error("Get staff error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch staff" },
            { status: 500 }
        )
    }
}

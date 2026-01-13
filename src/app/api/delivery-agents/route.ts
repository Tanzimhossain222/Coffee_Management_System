/**
 * Delivery Agents API Routes
 * GET /api/delivery-agents - Get all delivery agents
 */

import { authService, branchService } from "@/backend/services"
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
 * GET /api/delivery-agents
 * Get all delivery agents (optionally filtered by branch)
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

        if (!["ADMIN", "MANAGER"].includes(user.role)) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const branchId = searchParams.get("branchId") || undefined

        const agents = await branchService.getDeliveryAgents(branchId)

        return NextResponse.json({
            success: true,
            data: agents,
        })
    } catch (error) {
        console.error("Get delivery agents error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch delivery agents" },
            { status: 500 }
        )
    }
}
